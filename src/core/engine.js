const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} = require('@discordjs/voice');

const { spawn } = require('child_process');
const prism = require('prism-media');
const GuildState = require('./guildState');

class Engine {
  constructor(client) {
    this.client = client;
    this.guilds = new Map();
  }

  get(guildId) {
    if (!this.guilds.has(guildId)) {
      const state = new GuildState();
      state.player = createAudioPlayer();
      this.bindPlayerEvents(guildId, state);
      this.guilds.set(guildId, state);
    }
    return this.guilds.get(guildId);
  }

  bindPlayerEvents(guildId, state) {
    state.player.on(AudioPlayerStatus.Idle, () => {
      this.handleTrackEnd(guildId);
    });
  }

  async connect(guild, voiceChannel) {
    const state = this.get(guild.id);

    state.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true
    });

    state.connection.subscribe(state.player);

    await entersState(state.connection, VoiceConnectionStatus.Ready, 15_000);

    return state;
  }

  async handleTrackEnd(guildId) {
    const state = this.get(guildId);

    if (state.loop === 'track') {
      return this.playCurrent(guildId);
    }

    state.queue.shift();

    if (state.loop === 'queue' && state.current) {
      state.queue.push(state.current);
    }

    if (!state.queue.length) {
      state.current = null;
      return;
    }

    this.playNext(guildId);
  }

  async playNext(guildId) {
    const state = this.get(guildId);
    if (!state.queue.length) return;

    state.current = state.queue[0];
    await this.playCurrent(guildId);
  }

  async playCurrent(guildId, seekMs = 0) {
    const state = this.get(guildId);
    if (!state.current) return;

    const resource = this.createStream(
      state.current.url,
      state.filters,
      seekMs
    );

    state.startedAt = Date.now() - seekMs;
    state.totalPaused = 0;

    state.player.play(resource);
  }

  createStream(url, filters, seekMs = 0) {
    const yt = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-o', '-',
      url
    ]);

    const ffmpeg = new prism.FFmpeg({
      args: [
        '-ss', (seekMs / 1000).toString(),
        '-i', 'pipe:0',
        '-af', this.buildFilterGraph(filters),
        '-f', 'opus',
        'pipe:1'
      ]
    });

    yt.stdout.pipe(ffmpeg);

    return createAudioResource(ffmpeg);
  }

  buildFilterGraph(filters) {
    const chain = [];

    if (filters.bass > 0)
      chain.push(`bass=g=${filters.bass}`);

    if (filters.nightcore)
      chain.push('asetrate=48000*1.25,aresample=48000,atempo=1.1');

    if (filters.speed !== 1)
      chain.push(`atempo=${filters.speed}`);

    if (filters.vibrato)
      chain.push(`vibrato=f=${filters.vibrato.frequency}:d=${filters.vibrato.depth}`);

    if (filters.tremolo)
      chain.push(`tremolo=f=${filters.tremolo.frequency}:d=${filters.tremolo.depth}`);

    chain.push('loudnorm');

    return chain.join(',');
  }
}

module.exports = Engine;
