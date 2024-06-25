
'use strict';

const video = document.querySelector('video');
const videoblock = document.querySelector('#videoblock');
const messagebox = document.querySelector('#errormessage');

const buttonTv = document.querySelector('#TV');
const buttonHdmi1 = document.querySelector('#HDMI_1');
const buttonHdmi2 = document.querySelector('#HDMI_2');
const buttonHdmi3 = document.querySelector('#HDMI_3');
const buttonHdmi4 = document.querySelector('#HDMI_4');

buttonTv.onclick = () => {
  videoblock.removeChild(video)
  video.innerHTML = '<source src="tv://" type="service/webos-broadcast">'
  videoblock.appendChild(video)
};

buttonHdmi1.onclick = () => {
  videoblock.removeChild(video)
  video.innerHTML = '<source src="ext://hdmi:1" type="service/webos-external">'
  videoblock.appendChild(video)
};
buttonHdmi2.onclick = () => {
  videoblock.removeChild(video)
  video.innerHTML = '<source src="ext://hdmi:2" type="service/webos-external">'
  videoblock.appendChild(video)
};
buttonHdmi3.onclick = () => {
  videoblock.removeChild(video)
  video.innerHTML = '<source src="ext://hdmi:3" type="service/webos-external">'
  videoblock.appendChild(video)
};
buttonHdmi4.onclick = () => {
  videoblock.removeChild(video)
  video.innerHTML = '<source src="ext://hdmi:4" type="service/webos-external">'
  videoblock.appendChild(video)
};

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

