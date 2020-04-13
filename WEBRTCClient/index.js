//音频设置
let mediaStreamConstraints = {video: true,};
//相关控件
const localVideo = document.getElementById('lVideo')
const remoteVideo = document.getElementById("rVideo")

let localStream
let remoteStream

function callClick() {

}

//显示本地流
function showLocalClick() {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(getLocalMediaStream).catch(handleLocalMediaStreamError)
}

function getLocalMediaStream(mediaStream) {
    localStream = mediaStream
    localVideo.srcObject = mediaStream
}

function handleLocalMediaStreamError(error) {
    trace(`navigator.getUserMedia error: ${error.toString()}.`);
}

function gotRemoteMediaStream(event) {
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
    trace('Remote peer connection received remote stream.');
}

//打印日志
function trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
    console.log(now, text);
}