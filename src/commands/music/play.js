
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'play',
  description: 'Play a song from a URL or search term',

  async execute(client, message, args) {
    const voiceChannel = message.member.voice.channel;
    if (!voiceChannel) {
      return message.reply('You must be in a voice channel.');
    }

    const query = args.join(' ');
    if (!query) {
      return message.reply('Provide a YouTube URL or search term.');
    }

    const state = client.engine.get(message.guild.id);

    // Connect if not connected
    if (!state.connection) {
      await client.engine.connect(message.guild, voiceChannel);
    }

    // Add to queue
    const track = {
      title: query,
      url: query,
      requester: message.author.tag,
    };

    state.queue.push(track);

    if (!state.current) {
      await client.engine.playNext(message.guild.id);
    }

    const embed = new EmbedBuilder()
      .setColor(client.config.embedColor)
      .setTitle('Queued')
      .setDescription(`**${query}** added to queue.`);

    return message.channel.send({ embeds: [embed] });
  },
};
