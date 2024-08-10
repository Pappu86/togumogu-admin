<template>
  <v-card style="text-align: center">
    <v-card-text>
      <v-btn
        outlined
        icon
        class="bd_green--text"
        :disabled="!loaded"
        @click.native="playing ? pause() : play()"
      >
        <v-icon v-if="!playing || paused">mdi-play</v-icon>
        <v-icon v-else>mdi-pause</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="red--text"
        :disabled="!loaded"
        @click.native="stop()"
      >
        <v-icon>mdi-stop</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="info--text"
        :disabled="!loaded"
        @click.native="mute()"
      >
        <v-icon v-if="!isMuted">mdi-volume-high</v-icon>
        <v-icon v-else>mdi-volume-off</v-icon>
      </v-btn>
      <v-btn
        outlined
        icon
        class="secondary--text"
        @click.native="loaded ? download() : reload()"
      >
        <v-icon v-if="!loaded">mdi-refresh</v-icon>
        <v-icon v-else>mdi-download</v-icon>
      </v-btn>
      <v-slider
        v-model="percentage"
        dark
        :disabled="!loaded"
        @click.native="setPosition()"
      ></v-slider>
      <v-chip class="primary" text-color="white">
        {{ currentTime }} / {{ duration }}
      </v-chip>
    </v-card-text>
    <audio
      id="player"
      ref="player"
      :src="file"
      @ended="ended"
      @canplay="canPlay"
    >
      Your browser does not support the <code>audio</code> element.
    </audio>
  </v-card>
</template>
<script>
const formatTime = (second) =>
  new Date(second * 1000).toISOString().substr(11, 8);

export default {
  name: 'AudioPlayer',
  props: {
    file: {
      type: String,
      default: null,
    },
    autoPlay: {
      type: Boolean,
      default: false,
    },
    ended: {
      type: Function,
      default: () => {},
    },
    canPlay: {
      type: Function,
      default: () => {},
    },
  },
  data() {
    return {
      firstPlay: true,
      isMuted: false,
      loaded: false,
      playing: false,
      paused: false,
      percentage: 0,
      currentTime: '00:00:00',
      audio: undefined,
      totalDuration: 0,
    };
  },
  computed: {
    duration() {
      return this.audio ? formatTime(this.totalDuration) : '';
    },
  },
  mounted() {
    this.audio = this.$refs.player;
    this.init();
  },
  beforeDestroy() {
    this.audio.removeEventListener('timeupdate', this._handlePlayingUI);
    this.audio.removeEventListener('loadeddata', this._handleLoaded);
    this.audio.removeEventListener('pause', this._handlePlayPause);
    this.audio.removeEventListener('play', this._handlePlayPause);
    this.audio.removeEventListener('ended', this._handleEnded);
  },

  methods: {
    setPosition() {
      this.audio.currentTime = parseInt(
        (this.audio.duration / 100) * this.percentage
      );
    },
    stop() {
      this.paused = this.playing = false;
      this.audio.pause();
      this.audio.currentTime = 0;
    },
    play() {
      if (this.playing) return;
      this.paused = false;
      this.audio.play().then((_) => (this.playing = true));
    },
    pause() {
      this.paused = !this.paused;
      this.paused ? this.audio.pause() : this.audio.play();
    },
    download() {
      this.audio.pause();
      window.open(this.file, 'download');
    },
    mute() {
      this.isMuted = !this.isMuted;
      this.audio.muted = this.isMuted;
      this.volumeValue = this.isMuted ? 0 : 75;
    },
    reload() {
      this.audio.load();
    },
    _handleLoaded() {
      if (this.audio.readyState >= 2) {
        if (this.audio.duration === Infinity) {
          // Fix duration for streamed audio source or blob based
          // https://stackoverflow.com/questions/38443084/how-can-i-add-predefined-length-to-audio-recorded-from-mediarecorder-in-chrome/39971175#39971175
          this.audio.currentTime = 1e101;
          this.audio.ontimeupdate = () => {
            this.audio.ontimeupdate = () => {};
            this.audio.currentTime = 0;
            this.totalDuration = parseInt(this.audio.duration);
            this.loaded = true;
          };
        } else {
          this.totalDuration = parseInt(this.audio.duration);
          this.loaded = true;
        }

        if (this.autoPlay) this.audio.play();
      } else {
        throw new Error('Failed to load sound file');
      }
    },
    _handlePlayingUI(e) {
      this.percentage = (this.audio.currentTime / this.audio.duration) * 100;
      this.currentTime = formatTime(this.audio.currentTime);
    },
    _handlePlayPause(e) {
      if (e.type === 'play' && this.firstPlay) {
        // in some situations, audio.currentTime is the end one on chrome
        this.audio.currentTime = 0;
        if (this.firstPlay) {
          this.firstPlay = false;
        }
      }
      if (
        e.type === 'pause' &&
        this.paused === false &&
        this.playing === false
      ) {
        this.currentTime = '00:00:00';
      }
    },
    _handleEnded() {
      this.paused = this.playing = false;
    },
    init() {
      this.audio.addEventListener('timeupdate', this._handlePlayingUI);
      this.audio.addEventListener('loadeddata', this._handleLoaded);
      this.audio.addEventListener('pause', this._handlePlayPause);
      this.audio.addEventListener('play', this._handlePlayPause);
      this.audio.addEventListener('ended', this._handleEnded);
    },
  },
};
</script>
