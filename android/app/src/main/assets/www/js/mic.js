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




// 获取录音按钮
const recordBtn = document.querySelector('#record')
// 获取audio
const audio = document.querySelector('#audio')

const audioStream = {
    status: false, // 录音状态
    streams: [], // 用于存储录音stream
    blob: null, // stream转换成的blob
}

// MediaRecorder实例
let mediaRecorder = null
var finalNoteArray = new Array();
var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const analyser = audioCtx.createAnalyser();

// 给录音按钮添加点击事件
recordBtn.addEventListener('click', async (e) => {
    // 判断录音状态
    if (audioStream.status) {
        controlMediaRecorder()
    } else {
        // 判断mediaRecorder是否存在
        mediaRecorder ? controlMediaRecorder() : getpermission()
    }
})

// 获取权限
function getpermission() {
    // audio 音频 | video 视频
    const constraints = { audio: true, video: false }
    navigator.mediaDevices.getUserMedia(constraints).then((MediaStream) => {
        // 获取成功 得到媒体流 MediaStream 并实例一个MediaRecorder对象
        mediaRecorder = new MediaRecorder(MediaStream);
        mediaRecorder.addEventListener('dataavailable', onDataavailable)
        mediaRecorder.addEventListener('stop', onStop)

        const source = audioCtx.createMediaStreamSource(MediaStream);
        source.connect(analyser);


        controlMediaRecorder()
    }).catch((error) => {
        // 获取失败
        console.error(error);
    })
}
var arr = new Uint8Array(analyser.frequencyBinCount);//用于存放音频数据的数组，其长度是fftsize的一半
var requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitrequestAnimationFrame ||
    window.mozrequestAnimationFrame;//兼容

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

// 控制MediaRecorder
function controlMediaRecorder() {
    // 判断录音状态
    // inactive 休息  |  recording 录音中  |  paused 暂停
    if (mediaRecorder.state == 'inactive') {
        // 开始录制将之前的录音清空 
        audioStream.streams = []
        // 释放内存
        if (audioStream.blob) {
            URL.revokeObjectURL(audioStream.blob)
            audioStream.blob = null
        }



        mediaRecorder.start(1000)
        finalNoteArray = new Array();
        requestAnimationFrame(fn);  //请求帧
        recordBtn.innerText = '结束录制'
        audioStream.status = true
        console.log("开始录制---");
    } else {


        mediaRecorder.stop()
        //一次录音解析简谱结果在finalNoteArray中，在此处可以进行提取
        console.log(finalNoteArray)
        Display(finalNoteArray)
        recordBtn.innerText = '开始录制'
        audioStream.status = false
        console.log("结束录制---");
    }
}

// 监听stop事件
function onStop() {
    // 将audioStream.streams转换为地址
    audioStream.blob = new Blob(audioStream.streams, { type: audioStream.streams[0].type })
    audio.src = URL.createObjectURL(audioStream.blob)
}

/**
 * 监听录音dataavailable事件
 * 触发条件
 * 1. 媒体流结束时
 * 2. 调用stop()
 * 3. 调用requestData()
 * 4. 调用start(timeslice)  每隔 timeslice 毫秒触发一次 dataavailable事件
*/
function onDataavailable(event) {
    // event.data blob对象
    audioStream.streams.push(event.data)
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


function download(text, name, type) {
    var a = document.getElementById("a");
    var file = new Blob([text], { type: type });
    a.href = URL.createObjectURL(file);
    a.download = name;
    a.dispatchEvent(new MouseEvent('click', { 'bubbles': false, 'cancelable': true }));
}

function downLoadDataToLoc() {
    var blob = new Blob(finalNoteArray, { type: 'text/plain' })
    // 创建一个blob的对象，把Json转化为字符串作为我们的值
    if ("msSaveOrOpenBlob" in navigator) {
        // 这个判断要不要都行，如果是IE浏览器，使用的是这个，
        window.navigator.msSaveOrOpenBlob(blob, "results.txt");
    } else {    // 不是IE浏览器使用的下面的
        var url = window.URL.createObjectURL(blob)
        // 上面这个是创建一个blob的对象连链接，
        var link = document.createElement('a')
        // 创建一个链接元素，是属于 a 标签的链接元素，所以括号里才是a，

        link.href = url;
        // 把上面获得的blob的对象链接赋值给新创建的这个 a 链接
        link.setAttribute('download', "results.txt")
        // 设置下载的属性（所以使用的是download），这个是a 标签的一个属性
        // 后面的是文件名字，可以更改
        link.click();
        // 使用js点击这个链接
    }
}


function Display(arr) {
    console.log("display");
    const rel = document.getElementsByClassName("content")[0];
    let Rstr = "";
    let i=0
    for (i = 0; i < arr.length; i++) {
        var str = arr[i]
        console.log(str)
        if (i % 4 == 0) {
            Rstr +=  '|';
        }
        if (i % 8 == 0&&i!=0) {
            Rstr += '\n'+'|';
        }
        Rstr += str + ' ';  

    }
    // while(i%4!=0){
    //     Rstr += '0' + ' ';
    //     i++
    // }
    // Rstr +=  '|';
    rel.innerText = Rstr;
    console.log(Rstr)
}