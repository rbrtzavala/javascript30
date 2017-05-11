const video = document.querySelector('.player');
const canvas = document.querySelector('.photo');
const ctx = canvas.getContext('2d');
const strip = document.querySelector('.strip');
const snap = document.querySelector('.snap');

function getVideo() {
  // grab users media source, returns a promise
  navigator.mediaDevices.getUserMedia({ video: true, audio: false })
    .then(localMediaStream => {
      // console.log(localMediaStream);
      // convert media stream into something player can understand
      video.src = window.URL.createObjectURL(localMediaStream);
      video.play();
    })
    .catch(err => {
      console.log('No!!!', err);
    });
}

function paintToCanvas() {
  const width = video.videoWidth;
  const height = video.videoHeight;
  canvas.width = width;
  canvas.height = height;

  return setInterval(() => {
    // take canvas context and pass video element
    // drawImage( image, x, y, w, h )
    ctx.drawImage( video, 0, 0, width, height);

    // take pixels out of canvas
    let pixels = ctx.getImageData(0, 0, width, height);
    // apply effect to pixels
    // pixels = redEffect(pixels);

    pixels = rgbSplit(pixels);
    ctx.globalAlpha = 0.1;

    // pixels = greenScreen(pixels);
    // put pixels back
    ctx.putImageData(pixels, 0, 0);
  }, 16); // interval to 16 milliseconds
}


function takePhoto() {
  // play sound effect
  snap.currentTime = 0;
  snap.play();

  // take data out of the canvas
  const data = canvas.toDataURL('image/jpeg');
  // create a link element
  const link = document.createElement('a');
  link.href = data;
  link.setAttribute('download', 'handsome');
  link.innerHTML = `<img src="${data}" alt="CHEESE!" />`;
  // insert as firstChild
  strip.insertBefore(link, strip.firstChild);
}

function redEffect(pixels) {
  for(let i = 0; i < pixels.data.length; i+= 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // red
    pixels.data[i + 1] = pixels.data[i + 1] - 50; // green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue
  }
  return pixels;
}

function rgbSplit(pixels) {
  for(let i = 0; i < pixels.data.length; i+= 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // red
    pixels.data[i + 100] = pixels.data[i + 1]; // green
    pixels.data[i - 150] = pixels.data[i + 2]; // blue
  }
  return pixels;
}

function greenScreen(pixels) {
  const levels = {};

  document.querySelectorAll('.rgb input').forEach((input) => {
    levels[input.name] = input.value;
  });

  // console.log(levels);

  for(let i = 0; i < pixels.data.length; i+= 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    if ( red >= levels.rmin
      && green >= levels.gmin
      && blue >= levels.bmin
      && red <= levels.rmax
      && green <= levels.gmax
      && blue <= levels.bmax) {
        pixels.data[i + 3] = 0;
      }
    }
    return pixels;
}

getVideo();
video.addEventListener('canplay', paintToCanvas);
