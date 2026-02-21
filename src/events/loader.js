const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const eventsPath = path.join(__dirname);
  const files = fs.readdirSync(eventsPath).filter(file =>
    file.endsWith('.js') && file !== 'loader.js'
  );

  for (const file of files) {
    const event = require(`./${file}`);
    client.on(event.name, (...args) => event.execute(client, ...args));
  }
};
