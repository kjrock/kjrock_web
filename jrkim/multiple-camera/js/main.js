/*
*  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
*
*  Use of this source code is governed by a BSD-style license
*  that can be found in the LICENSE file in the root of the source
*  tree.
*/

'use strict';

// const videoElement = document.querySelector('video');
const audioInputSelect = document.querySelector('select#audioSource');
const videoSelect = document.querySelector('select#videoSource');
const numSelect = document.querySelector('select#num-camera');
let startTestButton =  document.querySelector('#start-test');
let videoArea =  document.querySelector('#video-area');
const selectors = [audioInputSelect, videoSelect];

startTestButton.onclick = start;

function gotDevices(deviceInfos) {
  // Handles being called several times to update labels. Preserve values.
  const values = selectors.map(select => select.value);
  selectors.forEach(select => {
    while (select.firstChild) {
      select.removeChild(select.firstChild);
    }
  });
  for (let i = 0; i !== deviceInfos.length; ++i) {
    const deviceInfo = deviceInfos[i];
    const option = document.createElement('option');
    option.value = deviceInfo.deviceId;
    if (deviceInfo.kind === 'audioinput') {
      option.text = deviceInfo.label || `microphone ${audioInputSelect.length + 1}`;
      audioInputSelect.appendChild(option);
    } else if (deviceInfo.kind === 'videoinput') {
      option.text = deviceInfo.label || `camera ${videoSelect.length + 1}`;
      videoSelect.appendChild(option);
    } else {
      console.log('Some other kind of source/device: ', deviceInfo);
    }
  }
  selectors.forEach((select, selectorIndex) => {
    if (Array.prototype.slice.call(select.childNodes).some(n => n.value === values[selectorIndex])) {
      select.value = values[selectorIndex];
    }
  });
}

navigator.mediaDevices.enumerateDevices().then(gotDevices).catch(handleError);

function gotStream(stream) {
  window.stream = stream; // make stream available to console
  let videoElement = addNewVideoElement();
  videoElement.srcObject = stream;
  // Refresh button list in case labels have become available
  return navigator.mediaDevices.enumerateDevices();
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

function addNewVideoElement() {
  // var newRow = testTable.insertRow(-1);
  // var newCell = newRow.insertCell(-1);
  // var video = document.createElement('video');
  // video.autoplay = true;
  // newCell.appendChild(video);

  var video = document.createElement('video');
  let camera_num =
  numSelect.options[numSelect.selectedIndex].value;
  var w =  (100/camera_num);
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

function start() {
  // if (window.stream) {
  //   window.stream.getTracks().forEach(track => {
  //     track.stop();
  //   });
  // }

  const audioSource = audioInputSelect.value;
  const videoSource = videoSelect.value;
  const constraints = {
    audio: {deviceId: audioSource ? {exact: audioSource} : undefined},
    video: {deviceId: videoSource ? {exact: videoSource} : undefined}
  };
  navigator.mediaDevices.getUserMedia(constraints).then(gotStream).then(gotDevices).catch(handleError);
}

// audioInputSelect.onchange = start;
// videoSelect.onchange = start;


