//音频设置
let mediaStreamConstraints = {video: true,};
//相关控件
const localVideo = document.getElementById('lVideo')
const remoteVideo = document.getElementById("rVideo")

let localStream
let remoteStream

//建立2个对等连接,分别代表本地和远程
let localPeerConnection
let remotePeerConnection


//拨打电话
function callClick() {

}

//显示本地流
function showLocalClick() {
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(getLocalMediaStream).catch(handleMediaStreamError)
}

//获取当前流文件
function getLocalMediaStream(mediaStream) {
    localStream = mediaStream
    localVideo.srcObject = mediaStream
}

//处理媒体流异常
function handleMediaStreamError(error) {
    trace(`navigator.getUserMedia error: ${error.toString()}.`);
}

//获取远程媒体流文件
function gotRemoteMediaStream(event) {
    const mediaStream = event.stream;
    remoteVideo.srcObject = mediaStream;
    remoteStream = mediaStream;
    trace('Remote peer connection received remote stream.');
}



// 服务器配置
const servers = null;

localPeerConnection = new RTCPeerConnection(servers);
trace('Created local peer connection object localPeerConnection.');

localPeerConnection.addEventListener('icecandidate', handleConnection);
localPeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);





remotePeerConnection = new RTCPeerConnection(servers);
trace('Created remote peer connection object remotePeerConnection.');

remotePeerConnection.addEventListener('icecandidate', handleConnection);
remotePeerConnection.addEventListener('iceconnectionstatechange', handleConnectionChange);




remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream);
localPeerConnection.addStream(localStream);
trace('Added local stream to localPeerConnection.');

trace('localPeerConnection createOffer start.');
localPeerConnection.createOffer(offerOptions).then(createdOffer).catch(setSessionDescriptionError);


function handleConnection(event) {
    const peerConnection = event.target;
    const iceCandidate = event.candidate;

    if (iceCandidate) {
        const newIceCandidate = new RTCIceCandidate(iceCandidate);
        const otherPeer = getOtherPeer(peerConnection);

        otherPeer.addIceCandidate(newIceCandidate)
            .then(() => {
                handleConnectionSuccess(peerConnection);
            }).catch((error) => {
            handleConnectionFailure(peerConnection, error);
        });

        trace(`${getPeerName(peerConnection)} ICE candidate:\n` +
            `${event.candidate.candidate}.`);
    }
}

function handleConnectionChange(event) {
    const peerConnection = event.target;
    console.log('ICE state change event: ', event);
    trace(`${getPeerName(peerConnection)} ICE state: ` + `${peerConnection.iceConnectionState}.`);
}




//打印日志
function trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
    console.log(now, text);
}