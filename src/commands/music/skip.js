module.exports = {
  name: 'skip',
  description: 'Skip current track',

  async execute(client, message) {
    const state = client.engine.get(message.guild.id);

    if (!state.current) {
      return message.reply('Nothing is playing.');
    }

    state.player.stop(true);

    return message.channel.send('Skipped.');
  },
};
