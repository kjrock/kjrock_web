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

let localCamera = $('local-camera');
var videoArea = $('video-area');
var nPeerConnectionsInput = $('num-peerconnections');
let cameraConstraintSel = $('camera-constraints');
var videoWidth = $('video-width');
var startTestButton = $('start-test');
const hangupButton = document.getElementById('hangupButton');
const websocketServer = document.getElementById('websocket-server');
const socket = new WebSocket('ws://' + websocketServer.value);
const roomId = document.getElementById('room-id');
const MyIdTag = document.getElementById('my-id');
const MyId = Math.floor(Math.random() * 10000);
MyIdTag.innerText = MyId;

const _180pConstraints = {
  audio: true,
  video: {width: {ideal: 320}, height: {ideal: 180}}
};

const _240pConstraints = {
  audio: true,
  video: {width: {ideal: 320}, height: {ideal: 240}}
};

const _360pConstraints = {
  audio: true,
  video: {width: {ideal: 640}, height: {ideal: 360}}
};

const _480pConstraints = {
  audio: true,
  video: {width: {ideal: 640}, height: {ideal: 480}}
};

const _540pConstraints = {
  audio: true,
  video: {width: {ideal: 960}, height: {ideal: 540}}
};

const _720pConstraints = {
  audio: true,
  video: {width: {ideal: 1280}, height: {ideal: 720}}
};

const _1080pConstraints = {
  audio: true,
  video: {width: {ideal: 1920}, height: {ideal: 1080}}
};

let cameraConstraints = { 
"180p": _180pConstraints,
"240p": _240pConstraints,
"360p": _360pConstraints,
"480p": _480pConstraints,
"540p": _540pConstraints,
"720p": _720pConstraints,
"1080p": _1080pConstraints,
}

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

var PCs = new Map();
let localStream;

socket.onmessage = async (event) => {
  let text = await event.data.text();
  console.log("text: ", text);
  const data = JSON.parse(text);
  if (!localStream) {
    console.log("return, localStream is null");
    return;
  }
  
  switch (data.type) {
    case 'ready':
    case 'offer':
      if(!PCs.has(data.sender)) {
        let senderId = data.sender;
        let new_pc = new PCWrapper(senderId);
        PCs.set(senderId, new_pc);
      }
      PCs.get(data.sender).onmessage(data);
      break;
    case 'answer':
    case 'candidate':
      if(PCs.has(data.sender)) {
        PCs.get(data.sender).onmessage(data);
      }
      break;
    case 'bye':
      if(PCs.has(data.sender)) {
        PCs.get(data.sender).onmessage(data);
        PCs.delete(data.sender);
      }
      break;
    default:
      console.log('unhandled', e);
      break;
  }
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
    localStream.getTracks().forEach(track => this.pc.addTrack(track, localStream));
     
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
      this.remoteVideo = null;
    }
  };
}

async function startTest() {
  console.log('Starting call');
  startTestButton.disabled = true;
  hangupButton.disabled = false;

  let constraintVal =
    cameraConstraintSel.options[cameraConstraintSel.selectedIndex].value;

  localStream = await navigator.mediaDevices.getUserMedia(cameraConstraints[constraintVal]);
  window.stream = localStream; // stream available to console
  localCamera.srcObject = localStream;
  socket.send(JSON.stringify({type: 'ready', sender:MyId}));
}

function hangup() {
  console.log('Ending call');
  PCs.forEach(PC => PC.hangup());
  PCs.clear();

  videoArea.innerHTML = "";
  startTestButton.disabled = false;
  hangupButton.disabled = true;

  stream.getTracks().forEach(track => track.stop());
  localStream = null;
}
