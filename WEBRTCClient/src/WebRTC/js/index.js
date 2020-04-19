//服务器连接相关控件
const btnCS = document.getElementById('connect')
const textUser = document.getElementById('userID')
//显示本地视频相关控件
const btnShowLocal = document.getElementById('showLocal')
const lv = document.getElementById('lVideo')
//呼叫用户1相关控件
const textUser1 = document.getElementById('callID1')
const btnCall1 = document.getElementById('call1')
const btnHU1 = document.getElementById('hu1')
const rv1 = document.getElementById("rVideo1")
//呼叫用户2相关控件
const textUser2 = document.getElementById('callID2')
const btnCall2 = document.getElementById('call2')
const btnHU2 = document.getElementById('hu2')
const rv2 = document.getElementById("rVideo2")

let localStream
let r1Stream
let r2Stream

let Server = "ws://localhost:8080/websocket?userId="
let sock = null
let userId
//音频设置
let mediaStreamConstraints = {video: true,}
let iceConfig = {
    "iceServers": [
        {url: 'stun:stun.ekiga.net'},
        {url: 'turn:turnserver.com', username: 'user', credential: 'pass'}
    ]
}
let pc = null

//连接服务器
function connectServer() {
    userId = textUser.value.trim()
    if (!userId) {
        alert("请输入当前用户ID")
        return
    }
    Server = Server + userId
    sock = new WebSocket(Server)
    sock.onopen = handlerConnectSuccess
    sock.onclose = handlerConnectClose
    sock.onmessage = handlerMessage
}

//显示本地视频
function showLocalClick() {

}

//拨打第一位用户
function callUser1() {

}

//挂断
function hangUp1() {

}

//拨打第二位用户
function callUser2() {

}

//挂断
function hangUp2() {

}

//信令服务器连接成功
function handlerConnectSuccess() {
    textUser.disabled = true
    btnCS.disabled = true
}

//信令服务器关闭
function handlerConnectClose() {
    textUser.disabled = false
    btnCS.disabled = false
}

//处理消息
function handlerMessage(m) {
    const msg = JSON.parse(m.data)
    if (msg.messageType === 0 && userId === msg.to) {
        switch (msg.mediaType) {
            //接收SDP数据
            case 3:
                handlerSDP(msg)
                break
            //接收ICE数据
            case 4:
                handlerICE(msg)
                break
        }
    }

}

//发送消息
function sendMessage(toUser, msgContent, msgType) {
    sock.send(JSON.stringify({
        messageType: 0,
        mediaType: msgType,
        from: userId,
        to: toUser,
        content: msgContent,
        createAt: new Date().getTime()
    }))
}

//发送SDP信息
function sendSDP(toUser, msgContent) {
    sendMessage(toUser, msgContent, 3)
}

//发送ICE信息
function sendICE(toUser, msgContent) {
    sendMessage(toUser, msgContent, 4)
}

//处理接收SDP信息
function handlerSDP(msg) {
    const rsdt = new RTCSessionDescription(msg.content)

}

//处理接收ICE信息
function handlerICE(msg) {

}


//创建PeerConnection
function createPeerConnection() {
    pc = new RTCPeerConnection(iceConfig)
    pc.onnegotiationneeded = onnegotiationneeded;
    pc.onicecandidate = onicecandidate;
    pc.onicegatheringstatechange = onicegatheringstatechange;
    pc.oniceconnectionstatechange = oniceconnectionstatechange;
    pc.onsignalingstatechange = onsignalingstatechange;
    pc.ontrack = ontrack;
}

function onnegotiationneeded() {
    const offer = pc.createOffer().then(function () {


    })
    pc.setLocalDescription(offer)
    sendSDP("", offer)
}

function onicecandidate() {

}


function onicegatheringstatechange(evt) {
    trace(`onicegatheringstatechange, pc.iceGatheringState is ${pc.iceGatheringState}.`);
}

function oniceconnectionstatechange(evt) {
    trace(`oniceconnectionstatechange, pc.iceConnectionState is ${pc.iceConnectionState}.`);
}

function onsignalingstatechange(evt) {
    trace(`onsignalingstatechange, pc.signalingstate is ${pc.signalingstate}.`);
}

function ontrack(evt) {

}


//打印日志
function trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
    console.log(now, text);
}


