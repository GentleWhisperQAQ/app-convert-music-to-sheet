//钢琴各个音的频率数组
const noteArr = [27.5, 29.135, 30.868, 32.703, 34.648, 36.708, 38.891, 41.203, 43.654, 46.249, 48.999, 51.913,
    55, 58.27, 61.735, 65.406, 69.296, 73.416, 77.782, 82.407, 87.307, 92.499, 97.999, 103.826,
    110, 116.541, 123.471, 130.813, 138.591, 146.832, 155.563, 164.814, 174.614, 184.997, 195.998, 207.652,
    220, 233.082, 246.942, 261.626, 277.183, 293.665, 311.127, 329.629, 349.228, 369.994, 391.995, 415.305,
    440, 466.164, 493.883, 523.251, 554.365, 587.33, 622.254, 659.255, 698.456, 739.989, 783.991, 830.609,
    880, 932.328, 987.767, 1046.502, 1108.731, 1174.659, 1244.598, 1318.52, 1396.913, 1479.978, 1567.982, 1661.219,
    1760, 1864.655, 1975.533, 2093.004, 2217.461, 2349.318, 2489.016, 2637.02, 2793.826, 2959.955, 3135.437, 3322.437,
    3520, 3729.31, 3951.066, 4186.009]
//这里将钢琴中央C大调定为1 
const keyList = ['6(-4)', '6#(-4)', '7(-4)', '1(-3)', '1#(-3)', '2(-3)', '2#(-3)', '3(-3)', '4(-3)', '4#(-3)', '5(-3)', '5#(-3)',
    '6(-3)', '6#(-3)', '7(-3)', '1(-2)', '1#(-2)', '2(-2)', '2#(-2)', '3(-2)', '4(-2)', '4#(-2)', '5(-2)', '5#(-2)',
    '6(-2)', '6#(-2)', '7(-2)', '1(-1)', '1#(-1)', '2(-1)', '2#(-1)', '3(-1)', '4(-1)', '4#(-1)', '5(-1)', '5#(-1)',
    '6(-1)', '6#(-1)', '7(-1)', '1', '1#', '2', '2#', '3', '4', '4#', '5', '5#',
    '6', '6#', '7', '1(1)', '1#(1)', '2(1)', '2#(1)', '3(1)', '4(1)', '4#(1)', '5(1)', '5#(1)',
    '6(1)', '6#(1)', '7(1)', '1(2)', '1#(2)', '2(2)', '2#(2)', '3(2)', '4(2)', '4#(2)', '5(2)', '5#(2)',
    '6(2)', '6#(2)', '7(2)', '1(3)', '1#(3)', '2(3)', '2#(3)', '3(3)', '4(3)', '4#(3)', '5(3)', '5#(3)',
    '6(3)', '6#(3)', '7(3)', '1(4)', '1#(4)', '2(4)', '2#(4)', '3(4)', '4(4)', '4#(4)', '5(4)', '5#(4)']


if (navigator.mediaDevices) {
    // 获取打开麦克风权限，以及stream对象
    navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
            var chunks = [];
            var finalNoteArray = new Array();
            // 创建MediaRecorder对象，需要传入stream对象
            var mediaRecorder = new MediaRecorder(stream);

            var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = audioCtx.createAnalyser();
            const source = audioCtx.createMediaStreamSource(stream);
            source.connect(analyser);
            var arr = new Uint8Array(analyser.frequencyBinCount);//用于存放音频数据的数组，其长度是fftsize的一半
            var myReq
            var requestAnimationFrame = window.requestAnimationFrame ||
                window.webkitrequestAnimationFrame ||
                window.mozrequestAnimationFrame;//兼容

            var startBtn = document.createElement('button');
            var stopBtn = document.createElement('button');
            document.body.append(startBtn);
            document.body.append(stopBtn);
            startBtn.innerText = '开始';
            stopBtn.innerText = '结束';

            // 开始
            startBtn.onclick = () => {
                // 开始录音 
                finalNoteArray = new Array();

                mediaRecorder.start();
                myReq = requestAnimationFrame(fn);  //请求帧
            }
            // 结束
            stopBtn.onclick = () => {
                // 停止录音
                //一次录音解析简谱结果在finalNoteArray中，在此处可以进行提取
                
                mediaRecorder.stop();
            }

            // 添加事件监听
            mediaRecorder.onstart = () => {
                console.log('start', mediaRecorder.state);
            }
            mediaRecorder.onstop = () => {

                console.log('stop', mediaRecorder.state);
                // 数据块合成blob对象
                var blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
                console.log(blob)

                var audio = document.createElement('audio');
                var url = (window.URL || webkitURL).createObjectURL(blob);
                audio.src = url;
                audio.controls = true;
                document.body.appendChild(audio);
                console.log(audio, url)
            }
            mediaRecorder.ondataavailable = (e) => {
                console.log('data');
                console.log(e);
                chunks.push(e.data);
            }


            let i = 1; // 记录requestAnimationFrame的执行次数（屏幕刷新次数）
            let time = 60  // 每time帧转换一次音
            function fn() {
                if ((i % time) == 0) {  //计时器触发时，执行功能函数
                    freqToNote(arr)
                }
                i++
                if (mediaRecorder.state == 'recording') { //若正在录音则请求帧
                    requestAnimationFrame(fn);
                }
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
                var steplen = audioCtx.sampleRate / 2048
                var minindex = steplen * index
                var maxindex = steplen * (index + 1)
                var avgindex = (minindex + maxindex) / 2
                var value = new Array(minindex, maxindex)
                return avgindex
            }

            function freqToNote(arr) {
                //由频率数组得到乐谱
                analyser.getByteFrequencyData(arr);// 将音频频域数据复制到传入的Uint8Array数组
                var maxEnergyFreq = getMaxRange(arr)         // 获取最大振幅频率
                var noteIndex = normalSearch(noteArr, maxEnergyFreq) // 获取对应音符下标
                if (noteIndex != 0) {
                    console.log(keyList[noteIndex]) // 打印对应音符下标
                    finalNoteArray.push(keyList[noteIndex])
                    console.log(finalNoteArray)  //一次录音解析简谱结果在finalNoteArray中
                }
            }

        }
        ).catch((e) => {
            console.log(e);
        })
}





function normalSearch(arr, sel) {
    var i = 0
    for (i = 0; i < arr.length; i++) {
        if (sel < arr[i]) return i
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

