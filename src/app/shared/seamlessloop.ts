export class SeamlessLoop {

  is
  private _total: number
  private _load: number
  cb_loaded: any
  cb_loaded_flag: Boolean
  timeout: any
  playDelay: number
  stopDelay: number
  next: number
  audios: any[]
  actual: any
  dropOld: Boolean
  old: any
  _volume: number
  loaded: boolean = false

  duration
  transitionCallBack
  
  constructor() {
    this.is = {
        //@ts-ignore
          ff: Boolean(!(window.mozInnerScreenX == null) && /firefox/.test( navigator.userAgent.toLowerCase() )),
          //@ts-ignore
          ie: Boolean(document.all && !window.opera),
          //@ts-ignore
          opera: Boolean(window.opera),
          //@ts-ignore
          chrome: Boolean(window.chrome),
          //@ts-ignore
          safari: Boolean(!window.chrome && /safari/.test( navigator.userAgent.toLowerCase() ) && window.getComputedStyle && !window.globalStorage && !window.opera)
        };
    console.debug("ff: " + this.is.ff);
    console.debug("ie: " + this.is.ie);
    console.debug("opera: " + this.is.opera);
    console.debug("chrome: " + this.is.chrome);
    console.debug("safari: " + this.is.safari);
    this._total = 0;
    this._load = 0;
    this.cb_loaded;
    this.cb_loaded_flag = new Boolean();
    this.timeout;
    this.playDelay = -30;
    this.stopDelay = 30;
    if(this.is.chrome) this.playDelay = -25;
    if(this.is.chrome) this.stopDelay = 25;
    if(this.is.ff) this.playDelay = -25;
    if(this.is.ff) this.stopDelay = 85;
    if(this.is.opera) this.playDelay = 5;
    if(this.is.opera) this.stopDelay = 0;
    console.debug(this.playDelay + ", " + this.stopDelay);
    this.next = 1;
    this.audios = new Array();
    this.actual = new Array();
    this.dropOld = new Boolean();
    this.old;
    this._volume = 1;
  }


  _eventCanplaythrough(audBool) {
    if(audBool == false) {
      audBool = true;
      this._load++;
      if(this._load == this._total) {
        this.loaded = true;
        if(this.cb_loaded_flag == true) {
          this.cb_loaded();
          this.cb_loaded_flag = false;
        }
      }
    }
  }
    
  _eventPlaying(audMute) {
    setTimeout(function() {
      audMute.pause();
      try {
        audMute.currentTime = 0;
      } catch (e){console.debug(e.message);};
    }, this.stopDelay);
    
    if(this.dropOld == true) {
      let t = this
      setTimeout(function() {
        if(t.old.paused == false) {
          t.old.pause();
          try {
            t.old.currentTime = 0;
          } catch (e){console.debug(e.message);};
        }
      }, this.stopDelay);
      this.dropOld = false;
    }
  }

  _eventEnded(aud) {
    aud.volume = this._volume;
  }

  doLoop() {
    var key = (this.next == 1 ? "_1" : "_2");
    var antikey = (this.next == 1 ? "_2" : "_1");
    
    this.timeout = setTimeout(() => {
      this.doLoop(); 
      if(this.transitionCallBack) 
        this.transitionCallBack()
    }, this.actual._length + this.playDelay);
    
    if(this.is.opera) this.actual[antikey].pause();
    
    this.actual[key].play();
    this.next *= -1;
  }

  isLoaded() {
    return Boolean(this._load == this._total);
  }

  start(id) {
    if(id != "") {
      this.actual = this.audios[id];
    }
    this.doLoop();
  }
  
  volume(vol) {
    if(typeof vol != "undefined") {
      console.log(this.actual)
      if(this.actual._1)
        this.actual._1.volume = vol;
      if(this.actual._2)
        this.actual._2.volume = vol;
      this._volume = vol;
    }
    return vol;
  }
  
  stop() {
    clearTimeout(this.timeout);
    if(this.actual._1) {
      this.actual._1.currentTime = 0;
      this.actual._1.pause();
    }
    if(this.actual._2) {
      this.actual._2.currentTime = 0;
      this.actual._2.pause();
    }
  }
  
  callback(cb_loaded) {
    this.cb_loaded = cb_loaded;
    if(this.isLoaded() == true) cb_loaded();
    else this.cb_loaded_flag = true;
  }
  
  update(id, sync) {
    //var key = (this.next == 1 ? "_1" : "_2");
    var antikey = (this.next == 1 ? "_2" : "_1");
  
    this.old = this.actual[antikey];
    this.actual = this.audios[id];
    if(sync == false) {
      if(this.old.paused == false) {
        this.dropOld = true;
        if(this.is.opera) this.old.pause();
      }
      clearTimeout(this.timeout);
      this.doLoop();
    }
  }
  
  addUri(uri, length, id) {
    this.duration = length
    this.audios[id] = new Array();
    this.audios[id]._length = length;
    this.audios[id]._1_isLoaded = new Boolean();
    this.audios[id]._2_isLoaded = new Boolean();
    this.audios[id]._1 = new Audio(uri);
    this.audios[id]._2 = new Audio(uri);
    this._total++;
    this.audios[id]._1.addEventListener("canplaythrough", () => {this._eventCanplaythrough(this.audios[id]._1_isLoaded);});
    this.audios[id]._2.addEventListener("canplaythrough", () => {this._eventCanplaythrough(this.audios[id]._2_isLoaded);});
    this.audios[id]._1.addEventListener("playing", () => {this._eventPlaying(this.audios[id]._2);});
    this.audios[id]._2.addEventListener("playing", () => {this._eventPlaying(this.audios[id]._1);});
    this.audios[id]._1.addEventListener("ended", () => {this._eventEnded(this.audios[id]._1);});
    this.audios[id]._2.addEventListener("ended", () => {this._eventEnded(this.audios[id]._2);});
    this.audios[id]._1.load();
    this.audios[id]._2.load();
    this.audios[id]._1.volume = this._volume;
    this.audios[id]._2.volume = this._volume;
  }

}