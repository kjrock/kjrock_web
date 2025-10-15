/*
 *  Copyright (c) 2016 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

/* jshint esversion: 6 */

'use strict';

var $ = document.getElementById.bind(document);
var videoArea = $('video-area');
var nPeerConnectionsInput = $('num-peerconnections');
var videoWidth = $('video-width');
var startTestButton = $('start-test');
const hangupButton = document.getElementById('hangupButton');
const roomId = document.getElementById('room-id');
const MyIdTag = document.getElementById('my-id');
const MyId = Math.floor(Math.random() * 10000);
MyIdTag.innerText = MyId;

startTestButton.disabled = false;
hangupButton.disabled = true;

startTestButton.onclick = startTest;
hangupButton.addEventListener('click', hangup);

const codecPreferences = document.getElementById('codecPreferences');
const supportsSetCodecPreferences = window.RTCRtpTransceiver &&
  'setCodecPreferences' in window.RTCRtpTransceiver.prototype;
const preferredCodec = document.getElementById('prefered-codec');
codecPreferences.addEventListener('change', () => {
  preferredCodec.value = codecPreferences.options[codecPreferences.selectedIndex].value;
});

let PCs = new Map();
let socket = null;
let mediaStream = null;

const videoSource = document.getElementById('video-source');
const videoSourceList = document.getElementById('video-sources');
videoSourceList.addEventListener('change', () => {
  const source = document.querySelector('source');
  mediaStream = null;
  source.setAttribute('src', videoSourceList.options[videoSourceList.selectedIndex].value);
  videoSource.load();
  videoSource.play();
});

function maybeCreateStream() {
  if (mediaStream) {
    return;
  }
  if (videoSource.captureStream) {
    mediaStream = videoSource.captureStream();
    console.log('Captured stream from videoSource with captureStream',
    mediaStream);
    // call();
  } else if (videoSource.mozCaptureStream) {
    mediaStream = videoSource.mozCaptureStream();
    console.log('Captured stream from videoSource with mozCaptureStream()',
    mediaStream);
    // call();
  } else {
    console.log('captureStream() not supported');
  }
  window.stream = mediaStream; // stream available to console
}

// Video tag capture must be set up after video tracks are enumerated.
videoSource.oncanplay = maybeCreateStream;
if (videoSource.readyState >= 3) { // HAVE_FUTURE_DATA
  // Video is already ready to play, call maybeCreateStream in case oncanplay
  // fired before we registered the event handler.
  maybeCreateStream();
}

videoSource.play();

function makeSocket() {
  let websocketServer = document.getElementById('websocket-server');
  socket = new WebSocket('ws://' + websocketServer.value);
  
  socket.addEventListener("open", (event) => {
    console.log("socket open:");
    socket.send(JSON.stringify({type: 'ready', sender:MyId}));
  });

  socket.onmessage = async (event) => {
    let text = await event.data.text();
    console.log("text: ", text);
    const data = JSON.parse(text);
    if (!mediaStream) {
      console.log("return, mediaStream is null");
      return;
    }
    
    switch (data.type) {
      case 'ready':
      case 'offer':
        if(!PCs.has(data.sender)) {
          let senderId = data.sender;
          let new_pc = new PCWrapper(senderId);
          PCs.set(senderId, new_pc);
          console.log("PCs size:", PCs.size);
        }
        PCs.get(data.sender).onmessage(data);
        break;
      case 'answer':
      case 'candidate':
        if(PCs.has(data.sender) && (MyId === data.receiver)) {
          PCs.get(data.sender).onmessage(data);
        }
        break;
      case 'bye':
        if(PCs.has(data.sender) && (MyId === data.receiver)) {
          PCs.get(data.sender).onmessage(data);
          PCs.delete(data.sender);
          console.log("PCs size:", PCs.size);
        }
        break;
      default:
        console.log('unhandled', e);
        break;
    }
  }

  return socket;
}


function logError(err) {
  console.log(err);
}

function addNewVideoElement() {
  var video = document.createElement('video');
  let pc_num = parseInt(nPeerConnectionsInput.value, 10);
  var w =  (100/pc_num);
  if (w > 30) {
    w = 30;
  }

  w = w + "%";

  console.log("w : " + w);
  video.style.width = w;
  video.autoplay = true;
  video.controls = true;
  videoArea.appendChild(video);

  return video;
}

if (supportsSetCodecPreferences) {
  const {codecs} = RTCRtpSender.getCapabilities('video');
  codecs.forEach(codec => {
    if (['video/red', 'video/ulpfec', 'video/rtx'].includes(codec.mimeType)) {
      return;
    }
    const option = document.createElement('option');
    option.value = (codec.mimeType + ' ' + (codec.sdpFmtpLine || '')).trim();
    option.innerText = option.value;
    codecPreferences.appendChild(option);
  });
}

function PCWrapper(senderId) {
  this.senderId = senderId;
  this.pc = null;
  this.remoteVideo = addNewVideoElement();

  this.onmessage = data => {
  if (data.type !== 'ready' ) {
    if (MyId !== data.receiver) {
      console.log("return, not me");
      return;
    }
  }

    switch (data.type) {
      case 'ready':
        if (this.pc) {
          console.log('already in call, ignoring');
          return;
        }
        this.makeCall();
        break;
      case 'offer':
        this.handleOffer(data);
        break;
      case 'answer':
        this.handleAnswer(data);
        break;
      case 'candidate':
        this.handleCandidate(data);
        break;
      case 'bye':
        this.hangup();
        break;
      default:
        console.log('unhandled', e);
        break;
    }
  };

  this.createPeerConnection = () => {
    this.pc = new RTCPeerConnection();
    this.pc.onicecandidate = e => {
      const message = {
        type: 'candidate',
        candidate: null,
        sender: MyId,
        receiver: this.senderId,
      };
      if (e.candidate) {
        message.candidate = e.candidate.candidate;
        message.sdpMid = e.candidate.sdpMid;
        message.sdpMLineIndex = e.candidate.sdpMLineIndex;
      }

      socket.send(JSON.stringify(message));
    };
    this.pc.ontrack = e => this.remoteVideo.srcObject = e.streams[0];
    mediaStream.getTracks().forEach(track => this.pc.addTrack(track, mediaStream));
     
    if (supportsSetCodecPreferences) {
      if (preferredCodec.value !== '') {
        const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ');
        const {codecs} = RTCRtpSender.getCapabilities('video');
        const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine);
        const selectedCodec = codecs[selectedCodecIndex];
        codecs.splice(selectedCodecIndex, 1);
        codecs.unshift(selectedCodec);
        console.log(codecs);
        const transceiver = this.pc.getTransceivers().find(t => t.sender && t.sender.track === localStream.getVideoTracks()[0]);
        transceiver.setCodecPreferences(codecs);
        console.log('Preferred video codec', selectedCodec);
      }
    }
  }

  this.makeCall = async () => {
    this.createPeerConnection();

    const offer = await this.pc.createOffer();
    socket.send(JSON.stringify({type: 'offer', sdp: offer.sdp, sender: MyId, receiver: this.senderId}));
    await this.pc.setLocalDescription(offer);
  }

  this.handleOffer = async offer => {
    if (this.pc) {
      console.error('existing peerconnection');
      return;
    }

    this.createPeerConnection();
    await this.pc.setRemoteDescription(offer);


    const answer = await this.pc.createAnswer();
    socket.send(JSON.stringify({type:'answer', sdp:answer.sdp, sender:MyId, receiver:this.senderId}));
    await this.pc.setLocalDescription(answer);
  }

  this.handleAnswer = async answer => {
    if (!this.pc) {
      console.error('no peerconnection');
      return;
    }
    await this.pc.setRemoteDescription(answer);
  }

  this.handleCandidate = async candidate => {
    if (!this.pc) {
      console.error('no peerconnection');
      return;
    }
    if (!candidate.candidate) {
      await this.pc.addIceCandidate(null);
    } else {
      await this.pc.addIceCandidate(candidate);
    }
  }

  this.hangup = async () => {
    if (this.pc) {
      socket.send(JSON.stringify({type:'bye', sender:MyId, receiver:this.senderId}));
      this.pc.close();
      this.pc = null;
      if (videoArea) {
        videoArea.removeChild(this.remoteVideo);
      }
      this.remoteVideo = null;
    }
  };
}

async function startTest() {
  console.log('Starting call');
  startTestButton.disabled = true;
  hangupButton.disabled = false;
  makeSocket();
}

function hangup() {
  console.log('Ending call');
  PCs.forEach(PC => PC.hangup());
  PCs.clear();

  socket.close();
  socket = null;
  videoArea.innerHTML = "";
  startTestButton.disabled = false;
  hangupButton.disabled = true;
}
