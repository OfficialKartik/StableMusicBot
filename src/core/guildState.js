class GuildState {
  constructor() {
    this.connection = null;
    this.player = null;

    this.queue = [];
    this.current = null;

    this.startedAt = 0;
    this.pausedAt = 0;
    this.totalPaused = 0;

    this.volume = 100;
    this.loop = 'off'; // off | track | queue
    this.autoplay = false;

    this.filters = {
      bass: 0,
      speed: 1,
      nightcore: false,
      vibrato: null,
      tremolo: null
    };

    this.nowPlayingMessage = null;
  }
}

module.exports = GuildState;
