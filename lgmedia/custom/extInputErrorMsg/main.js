
'use strict';

const video = document.querySelector('video');
const videoblock = document.querySelector('#videoblock');
const messagebox = document.querySelector('#errormessage');

function errorMessage(who, what) {
  const message = who + ': ' + what;
  messagebox.innerText = message;
  messagebox.style.display = 'block';
  console.log(message);
}

function clearErrorMessage() {
  messagebox.style.display = 'none';
}


video.onloadedmetadata = () => {
  console.log("video.onloadedmetadata");
};

video.onresize = () => {
  console.log("video.onresize");
};

let onExtInputError = ({detail}) => {
  console.log('##### onExtInputError');
  messagebox.innerText = detail;
  messagebox.style.display = 'block';
  console.log(detail);
}

document.addEventListener('extinputerrormsg', onExtInputError, true);

