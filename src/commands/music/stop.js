module.exports = {
  name: 'stop',
  description: 'Stop playback and clear queue',

  async execute(client, message) {
    const state = client.engine.get(message.guild.id);

    if (!state.connection) {
      return message.reply('Bot is not connected.');
    }

    state.queue = [];
    state.current = null;

    state.player.stop(true);

    if (state.connection) {
      state.connection.destroy();
      state.connection = null;
    }

    return message.channel.send('Stopped and disconnected.');
  },
};
