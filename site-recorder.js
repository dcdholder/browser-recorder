require('chromedriver');

const {Builder, Capabilities, By, Key, until} = require('selenium-webdriver');
const child_process             = require('child_process');

const SOURCE        = 'http://www.google.ca';
const SCREEN_NUMBER = 5;
const RES_WIDTH     = '1920';
const RES_HEIGHT    = '1080';
const FRAMERATE     = 30;

class SiteRecorder {
  constructor(url) {
    this.url = url;
  }

  start() {
    if (!this.started) {
      return this.startXvfbProcess().then(() => {
        let chromeCapabilities = Capabilities.chrome();
        let chromeOptions      = {
            'args': ['--start-fullscreen', `window-size=${RES_WIDTH},${RES_HEIGHT}`]
        };
        chromeCapabilities.set('chromeOptions', chromeOptions);

        this.driver = new Builder().withCapabilities(chromeCapabilities).build();
        this.driver.get(this.url);

        return this.startFfmpegProcess();
      }).then(() => {
        this.started = true;
      });
    } else {
      return Promise.reject('Site recording already started');
    }
  }

  stop(uploadTarget) {
    if (this.started) {
      return this.stopFfmpegProcess().then(() => {
        return this.driver.quit();
      }).then(() => {
        return this.stopXvfbProcess();
      }).then(() => {
        return this.uploadVideo(uploadTarget);
      });

      this.started = false;
    } else {
      return Promise.reject('Site recording not started');
    }
  }

  startXvfbProcess() {
    if (!this.xvfbProcess) {
      let cmd  = 'Xvfb';
      let args = [
        `:${SCREEN_NUMBER}`,
        `-screen`,
        `0`,
        `${RES_WIDTH}x${RES_HEIGHT}x24`
      ];

      this.xvfbProcess = child_process.spawn(cmd,args);

      return Promise.resolve();
    } else {
      return Promise.reject('Xvbf process already running');
    }
  }

  stopXvfbProcess() {
    if (this.xvfbProcess) {
      return new Promise((resolve,reject) => {
        this.xvfbProcess.on('close', (code) => {
          resolve();
        });

        this.xvfbProcess.kill('SIGINT');
      }).then(() => {
        this.xvfbProcess = null;
      });
    } else {
      return Promise.reject('Xvfb process not running');
    }
  }

  startFfmpegProcess() {
    if (!this.ffmpegProcess) {
      let cmd  = 'ffmpeg';
      let args = [
        `-y`,
        `-video_size`,
        `${RES_WIDTH}x${RES_HEIGHT}`,
        `-framerate`,
        `${FRAMERATE}`,
        `-f`,
        `x11grab`,
        `-i`,
        `:${SCREEN_NUMBER}.0`,
        '/tmp/dvrtest.mp4'
      ];

      this.ffmpegProcess = child_process.spawn(cmd,args);

      return Promise.resolve();
    } else {
      return Promise.reject('Ffmpeg process already running');
    }
  }

  stopFfmpegProcess() {
    if (this.ffmpegProcess) {
      return new Promise((resolve,reject) => {
        this.ffmpegProcess.on('close', (code) => {
          resolve();
        });

        this.ffmpegProcess.kill('SIGINT');
      }).then(() => {
        this.ffmpegProcess = null;
      });
    } else {
      return Promise.reject('Ffmpeg process not running');
    }
  }

  uploadVideo(uploadTarget) {
    return Promise.resolve(); //TODO: fill this in
  }
}

const RECORD_TIME  = 3000;
let   siteRecorder = new SiteRecorder(SOURCE);

siteRecorder.start().then(() => {
  return new Promise((resolve,reject) => {
    setTimeout(() => {resolve();}, RECORD_TIME);
  });
}).then(() => {
  return siteRecorder.stop();
});
