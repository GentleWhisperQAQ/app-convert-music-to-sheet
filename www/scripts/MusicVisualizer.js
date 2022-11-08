const noteArr = [28, 29
	, 31
	, 33
	, 35
	, 37
	, 38
	, 41
	, 44
	, 46
	, 49
	, 52
	, 55
	, 58
	, 62
	, 65
	, 69
	, 73
	, 78
	, 82
	, 87
	, 92
	, 98
	, 104
	, 110
	, 117
	, 123
	, 131
	, 139
	, 147
	, 156
	, 165
	, 175
	, 185
	, 196
	, 208
	, 220
	, 233
	, 245
	, 262
	, 277
	, 294
	, 312
	, 330
	, 350
	, 370
	, 393
	, 416
	, 441
	, 467
	, 495
	, 524
	, 555
	, 588
	, 623
	, 661
	, 699
	, 741
	, 787
	, 833
	, 883
	, 934
	, 992
	, 1049
	, 1114
	, 1180
	, 1251
	, 1328
	, 1405
	, 1486
	, 1576
	, 1673
	, 1775
	, 1871
	, 1985
	, 2097
	, 2228
	, 2378
	, 2507
	, 2659
	, 2825
	, 2994
	, 3182
	, 3363
	, 3579
	, 3844
	, 10000
	, 300000]
function Musicvisualizer(obj) {
	this.source = null;
	this.count = 0;

	this.analyser = Musicvisualizer.ac.createAnalyser();
	this.size = obj.size;
	// this.analyser.fftSize = this.size*2;
	this.analyser.fftSize = 4096;

	// GainNode用来控制音频的音量
	this.gainNode = Musicvisualizer.ac[Musicvisualizer.ac.createGain ? "createGain" : "createGainNode"]();
	// 对象调用对象可以用obj.method，也可以obj[method]
	this.gainNode.connect(Musicvisualizer.ac.destination);

	this.analyser.connect(this.gainNode);

	this.xhr = new XMLHttpRequest();
	this.draw = obj.draw;
	this.visualize();
}

Musicvisualizer.ac = new (window.AudioContext || window.webkitAudioContext)();//共用的
console.log(Musicvisualizer.ac.sampleRate)

// 解决 Chrome 66之后高版本中AudioContext被强行suspend的问题
if (typeof AudioContext != "undefined" || typeof webkitAudioContext != "undefined") {
	var resumeAudio = function () {
		if (typeof Musicvisualizer.ac == "undefined" || Musicvisualizer.ac == null) return;
		if (Musicvisualizer.ac.state == "suspended") Musicvisualizer.ac.resume();
		document.removeEventListener("click", resumeAudio);
	};
	document.addEventListener("click", resumeAudio);
}

// load -> decode -> play
Musicvisualizer.prototype.load = function (url, fun) {
	this.xhr.abort();
	this.xhr.open("GET", url);
	this.xhr.responseType = "arraybuffer";
	var self = this;
	this.xhr.onload = function () {
		fun(self.xhr.response);
	}
	this.xhr.send();
}

// BaseAudioContext.decodeAudioData()用来生成AudioBuffer
// AudioBuffer供AudioBufferSourceNode使用，这样，AudioBufferSourceNode才可以播放音频数据
Musicvisualizer.prototype.decode = function (arraybuffer, fun) {
	Musicvisualizer.ac.decodeAudioData(arraybuffer, function (buffer) {
		fun(buffer);
	}, function (err) {
		console.log(err);
	});
}

Musicvisualizer.prototype.play = function (path) {
	var n = ++this.count;
	var self = this;
	self.source && self.source[self.source.stop ? "stop" : "noteOff"](); // 开始前先暂停之前音频的播放，防止多份音频同时播放
	if (path instanceof ArrayBuffer) {
		self.decode(path, function (buffer) {
			if (n != self.count) return;
			var bufferSource = Musicvisualizer.ac.createBufferSource();
			// 将解码成功后的buffer赋值给bufferSource的buffer属性
			bufferSource.buffer = buffer;
			bufferSource.loop = true;
			bufferSource.connect(self.analyser);
			bufferSource[bufferSource.start ? "start" : "noteOn"](0);
			self.source = bufferSource;
		});
	}
	else {
		self.load(path, function (arraybuffer) {
			if (n != self.count) return;
			self.decode(arraybuffer, function (buffer) {
				if (n != self.count) return;
				var bufferSource = Musicvisualizer.ac.createBufferSource();
				// 将解码成功后的buffer赋值给bufferSource的buffer属性
				bufferSource.buffer = buffer;
				bufferSource.connect(self.analyser);
				bufferSource[bufferSource.start ? "start" : "noteOn"](0);
				self.source = bufferSource;
			});
		});
	}

}

Musicvisualizer.prototype.changeVolumn = function (percent) {
	this.gainNode.gain.value = percent * percent;
}

Musicvisualizer.prototype.visualize = function () {
	var self = this;
	var arr = new Uint8Array(self.analyser.frequencyBinCount);//数组长度是fftsize的一半
	var myDataArray = new Float32Array(self.analyser.frequencyBinCount);
	// console.log(self.analyser.fftSize)
	requestAnimationFrame = window.requestAnimationFrame ||
		window.webkitrequestAnimationFrame ||
		window.mozrequestAnimationFrame;//兼容
	function fn() {
		self.analyser.getByteFrequencyData(arr);// 将音频频域数据复制到传入的Uint8Array数组
		self.analyser.getFloatFrequencyData(myDataArray);
		// console.log(arr);
		// console.log(myDataArray);
		// self.draw(arr);
		var avgfreq = getMaxRange(arr)
		// console.log(avgfreq)
		var noteIndex = normalSearch(noteArr, avgfreq)
		// console.log(noteArr)
		compareToNum(noteIndex)
		requestAnimationFrame(fn);
	}
	requestAnimationFrame(fn);
}

function getMaxRange(arr) {
	//求幅度最大频率区间
	var maxx = arr[0]
	var index = 0
	for (var i = 0; i < arr.length - 1; i++) {
		if (maxx < arr[i + 1]) {
			maxx = arr[i + 1]
			index = i + 1
		}
	}
	var steplen = Musicvisualizer.ac.sampleRate / 4096
	var minindex = steplen * index
	var maxindex = steplen * (index + 1)
	var avgindex = (minindex + maxindex) / 2
	var value = new Array(minindex, maxindex)
	return avgindex
}

function normalSearch(arr, sel) {
	var i = 0
	for (i = 0; i < arr.length; i++) {
		if (sel >= arr[i]) return i
	}
	return i
}

function binarySearch(arr, sel) {
	//首先确定首、尾下标
	var low = 0;
	var high = arr.length - 1;
	while (low <= high) { //只要查找区间起始点和结束点中间还有值(要包括两值相同的情况)，我们就继续进行查找
		var mid = (low + high) / 2; //确定中间值下标
		if (sel == arr[mid]) { //如果查找值等于中间值
			return mid  //则这个mid值，就是查找到的数组下标
		} else if (sel < arr[mid]) { //如果查找值小于中间值
			high = mid - 1; //则在左半部分查找，需要重新确认区间high的位置
		} else { //否则查找值大于中间值
			low = mid + 1 //则在右半部分查找，需要重新确认区间low的位置
		}
	}
	low = low - 1
	return low//查找完都没有查找到，就退出
}

function compareToNum(noteIndex) {
	//比较得出音高
	console.log(noteIndex)

}