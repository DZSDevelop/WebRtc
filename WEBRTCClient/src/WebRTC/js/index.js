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
let userId;//当前用户ID
let remoteUser;//远程用户ID
//音频设置
let mediaStreamConstraints = {video: true,}
let iceConfig = {
    "iceServers": [
        {url: 'stun:stun.ekiga.net'},
        {url: 'turn:turnserver.com', username: 'user', credential: 'pass'}
    ]
}
let localRC = null
let remoteRC

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

//拨打第一位用户
function callUser1() {
    remoteUser = textUser1.value.trim()
    if (!remoteUser) {
        alert("请输入对方用户ID")
        return
    }
    //加载本地流
    navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(function (mediaStream) {
        lv.srcObject = mediaStream;
        localStream = mediaStream;
        createLocalPeerConnection()
        mediaStream.getTracks().forEach(track => {
            localRC.addTrack(track, mediaStream)
        })
    });
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
            //接收回复SDP数据
            case 4:
                handlerAnswerSDP(msg)
                break
            //接收ICE数据
            case 5:
                handlerICE(msg)
                break
            //接收ICE数据
            case 6:
                handlerAnswerICE(msg)
                break
        }
    }

}

//发送消息
function sendMessage(toUser, json, type) {
    sock.send(JSON.stringify({
        messageType: 0,
        mediaType: type,
        from: userId,
        to: toUser,
        content: json,
        createAt: new Date().getTime()
    }))
}

//发送SDP信息
function sendSDP(toUser, SDP) {
    let info = JSON.stringify(SDP).toString()
    trace("发送SDP信息" + info)
    sendMessage(toUser, info, 3)
}

//回复SDP信息
function answerSDP(toUser, SDP) {
    let info = JSON.stringify(SDP).toString()
    trace("回复SDP信息" + info)
    sendMessage(toUser, info, 4)
}

//发送ICE信息
function sendICE(toUser, ice) {
    let info = JSON.stringify(ice).toString()
    trace("发送ICE数据" + info)
    sendMessage(toUser, info, 5)
}

//回复ICE信息
function answerICE(toUser, ice) {
    let info = JSON.stringify(ice).toString()
    trace("回复ICE数据" + info)
    sendMessage(toUser, info, 6)
}

//处理接收SDP信息
function handlerSDP(msg) {
    trace("接收SDP数据" + msg.content)
    remoteUser = msg.from;
    remoteRC = new RTCPeerConnection(iceConfig)
    remoteRC.onicecandidate = function (evt) {
        if (evt.candidate) {
            answerICE(remoteUser, new RTCIceCandidate(evt.candidate))
        }
    };
    remoteRC.oniceconnectionstatechange = function (evt) {
        trace(`oniceconnectionstatechange, pc.iceConnectionState is ${remoteRC.iceConnectionState}.`);
    };
    remoteRC.ontrack = function (evt) {
        rv1.srcObject = evt.streams[0]
    };

    remoteRC.setRemoteDescription(new RTCSessionDescription(JSON.parse(msg.content))).then(() => {
        //加载本地流
        navigator.mediaDevices.getUserMedia(mediaStreamConstraints).then(function (mediaStream) {
            localStream = mediaStream
            lv.srcObject = mediaStream
            mediaStream.getTracks().forEach(track => {
                remoteRC.addTrack(track, mediaStream)
            })
            remoteRC.createAnswer().then(function (answer) {
                remoteRC.setLocalDescription(answer).then(function () {
                    answerSDP(remoteUser, answer)
                })
            })
        })
    })
}

//处理回复SDP信息
function handlerAnswerSDP(msg) {
    trace("接收SDP" + msg.content)
    const remoteDescription = new RTCSessionDescription(JSON.parse(msg.content));
    localRC.setRemoteDescription(remoteDescription);
}

//处理接收ICE信息
function handlerICE(msg) {
    remoteRC.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.content)))
}

//处理回复ICE信息
function handlerAnswerICE(msg) {
    localRC.addIceCandidate(new RTCIceCandidate(JSON.parse(msg.content)))
}


//创建PeerConnection
function createLocalPeerConnection() {
    localRC = new RTCPeerConnection(iceConfig)
    localRC.onnegotiationneeded = function (evt) {
        localRC.createOffer().then(function (offer) {
            localRC.setLocalDescription(offer).then(r => {
                sendSDP(remoteUser, offer)
            })
        })
    };
    localRC.onicecandidate = function (evt) {
        if (evt.candidate) {
            sendICE(remoteUser, evt.candidate)
        }
    };
    localRC.oniceconnectionstatechange = function (evt) {
        trace(`oniceconnectionstatechange, pc.iceConnectionState is ${localRC.iceConnectionState}.`);
    };
    localRC.ontrack = function (evt) {
        rv1.srcObject = evt.streams[0]
    };
}

//打印日志
function trace(text) {
    text = text.trim();
    const now = (window.performance.now() / 1000).toFixed(3);
    console.log(now, text);
}


