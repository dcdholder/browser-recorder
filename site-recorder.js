const Xvfb      = require('xvfb');
const webdriver = require('selenium-webdriver');
const browser   = require('selenium-webdriver/chrome');
const ffmpeg    = require('fluent-ffmpeg');

const OUTPUT_FILENAME = './video.mp4';
const RECORDING_URL   = 'www.google.ca'; //process.env.RECORDING_URL;
const RECORDING_TIME  = 3;               //process.env.RECORDING_TIME;
const RECORDING_RES   = '1920x1080';

//might need to specify framebuffer id in the ffmpeg thing
//which framebuffer does the browser use?

class SiteRecorder {
  constructor() {
    this.started = false;
    this.xvfb    = new Xvfb();
  }

  start() {
    if (!this.started) {
      return this.xvfb.start().then(() => {
        return browser.get(this.url);
      }).then(() => {
        return startFfmpegProcess();
      });

      this.started = true;
    } else {
      return Promise.reject('Site recording already started');
    }
  }

  stop(uploadTarget) {
    if (this.started) {
      return this.xvfb.stop().then(() => {
        return stopFfmpegProcess();
      }).then(() => {
        return uploadVideo(uploadTarget);
      });

      this.started = false;
    } else {
      return Promise.reject('Site recording not started');
    }
  }

  startFfmpegProcess() {
    if (!this.ffmpegProcess) {
      let screenBuffer = 'x11grab';
      let inputOptions = [`-f ${screenBuffer}`];

      //TODO: create the ffmpeg process
    } else {
      return Promise.reject('Ffmpeg process already running');
    }
  }

  stopFfmpegProcess() {
    if (this.ffmpegProcess) {
      //TODO: fill this in
      return new Promise((resolve,reject) => {
        this.ffmpegProcess.on('close', (code) => {
          resolve();
        });

        ffmpegProcess.kill(ffmpegProcess.pid,'SIGINT');
      }).then(() => {
        this.ffmpegProcess = null;
      });
    } else {
      return Promise.reject('Ffmpeg process not running');
    }
  }

  uploadVideo() {
    return Promise.resolve(); //TODO: fill this in
  }
}
