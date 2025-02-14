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

// var testTable = $('test-table');
var videoArea = $('video-area');
var nPeerConnectionsInput = $('num-peerconnections');
var videoWidth = $('video-width');
var startTestButton = $('start-test');
const hangupButton = document.getElementById('hangupButton');

startTestButton.disabled = false;
hangupButton.disabled = true;

startTestButton.onclick = startTest;
hangupButton.addEventListener('click', hangup);


var cpuOveruseDetectionCheckbox = $('cpuoveruse-detection');
const codecPreferences = document.getElementById('codecPreferences');
const supportsSetCodecPreferences = window.RTCRtpTransceiver &&
  'setCodecPreferences' in window.RTCRtpTransceiver.prototype;
const preferredCodec = document.getElementById('prefered-codec');
codecPreferences.addEventListener('change', () => {
  preferredCodec.value = codecPreferences.options[codecPreferences.selectedIndex].value;
});

let PCs = [];
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
    call();
  } else if (videoSource.mozCaptureStream) {
    mediaStream = videoSource.mozCaptureStream();
    console.log('Captured stream from videoSource with mozCaptureStream()',
    mediaStream);
    call();
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


function logError(err) {
  console.log(err);
}

function addNewVideoElement() {
  // var newRow = testTable.insertRow(-1);
  // var newCell = newRow.insertCell(-1);
  // var video = document.createElement('video');
  // video.autoplay = true;
  // newCell.appendChild(video);

  var video = document.createElement('video');
  let pc_num =
   nPeerConnectionsInput.options[nPeerConnectionsInput.selectedIndex].value;
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

function PeerConnection(id, cpuOveruseDetection) {
  this.id = id;
  this.cpuOveruseDetection = cpuOveruseDetection;

  this.localConnection = null;
  this.remoteConnection = null;

  this.remoteView = addNewVideoElement();

  this.start = function() {
    var onGetUserMediaSuccess = this.onGetUserMediaSuccess.bind(this);
    if (mediaStream) {
      onGetUserMediaSuccess(mediaStream);
    }

    // navigator.mediaDevices.getUserMedia({
    //   audio: true,
    //   video: true
    // })
    //   .then(onGetUserMediaSuccess)
    //   .catch(logError);
  };

  this.onGetUserMediaSuccess = function(stream) {
    // Create local peer connection.
    this.localConnection = new RTCPeerConnection(null, {
      'optional': [{
        'googCpuOveruseDetection': this.cpuOveruseDetection
      }]
    });
    this.localConnection.onicecandidate = (event) => {
      this.onIceCandidate(this.remoteConnection, event);
    };
    this.localConnection.addStream(stream);

    // Create remote peer connection.
    this.remoteConnection = new RTCPeerConnection(null, {
      'optional': [{
        'googCpuOveruseDetection': this.cpuOveruseDetection
      }]
    });
    this.remoteConnection.onicecandidate = (event) => {
      this.onIceCandidate(this.localConnection, event);
    };
    this.remoteConnection.onaddstream = (e) => {
      this.remoteView.srcObject = e.stream;
    };

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
        console.log(option.value);
      });
      if (preferredCodec.value !== '') {
        const [mimeType, sdpFmtpLine] = preferredCodec.value.split(' ');
        const {codecs} = RTCRtpSender.getCapabilities('video');
        const selectedCodecIndex = codecs.findIndex(c => c.mimeType === mimeType && c.sdpFmtpLine === sdpFmtpLine);
        const selectedCodec = codecs[selectedCodecIndex];
        codecs.splice(selectedCodecIndex, 1);
        codecs.unshift(selectedCodec);
        console.log(codecs);
        const transceiver = this.localConnection.getTransceivers().find(t => t.sender && t.sender.track === stream.getVideoTracks()[0]);
        transceiver.setCodecPreferences(codecs);
        console.log('Preferred video codec', selectedCodec);
      }
    }

    // Initiate call.
    var onCreateOfferSuccess = this.onCreateOfferSuccess.bind(this);
    this.localConnection.createOffer({
      offerToReceiveAudio: 1,
      offerToReceiveVideo: 1
    })
      .then(onCreateOfferSuccess, logError);
  };

  this.onCreateOfferSuccess = function(desc) {
    this.localConnection.setLocalDescription(desc);
    this.remoteConnection.setRemoteDescription(desc);

    var onCreateAnswerSuccess = this.onCreateAnswerSuccess.bind(this);
    this.remoteConnection.createAnswer()
      .then(onCreateAnswerSuccess, logError);
  };

  this.onCreateAnswerSuccess = function(desc) {
    this.remoteConnection.setLocalDescription(desc);
    this.localConnection.setRemoteDescription(desc);
  };

  this.onIceCandidate = function(connection, event) {
    if (event.candidate) {
      connection.addIceCandidate(new RTCIceCandidate(event.candidate));
    }
  };
}

function startTest() {
  startTestButton.disabled = true;
  hangupButton.disabled = false;
  var cpuOveruseDetection = cpuOveruseDetectionCheckbox.checked;
  let pc_num =
    nPeerConnectionsInput.options[nPeerConnectionsInput.selectedIndex].value;
  for (var i = 0; i < pc_num; ++i) {
    let new_pc = new PeerConnection(i, cpuOveruseDetection);
    new_pc.start();
    PCs.push(new_pc);
  }
}

function hangup() {
  console.log('Ending call');
  PCs.forEach(function(pc){
    pc.localConnection.close();
    pc.remoteConnection.close();
    pc.remoteConnection = null;
    pc.localConnection = null;
    pc.remoteView = null;
  });

  while(PCs.pop()){}

  codecPreferences.innerHTML = ""
  videoArea.innerHTML = "";
  startTestButton.disabled = false;
  hangupButton.disabled = true;
  codecPreferences.disabled = false;
}
