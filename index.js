const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447581540509815034';

const client = new Client({
  checkUpdate: false,
  readyStatus: false,
  patchVoice: false,
  ws: {
    properties: {
      browser: 'Discord Client'
    }
  }
});

const originalPatch = client.settings._patch;
client.settings._patch = function(data) {
  try {
    if (data && data.friend_source_flags === null) {
      data.friend_source_flags = { all: false };
    }
    return originalPatch.call(this, data);
  } catch (e) {
    console.log('Patching error caught, ignoring...');
  }
};

const BASE_INTERVAL = 2 * 60 * 60 * 1000;
const MIN_DELAY = 5 * 60 * 1000;
const MAX_DELAY = 10 * 60 * 1000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

async function doBump() {
  try {
    const channel = client.channels.cache.get(CHANNEL_ID);
    if (!channel) {
      console.log('Fetching channel...');
      await client.channels.fetch(CHANNEL_ID);
      return setTimeout(doBump, 5000);
    }
    
    console.log('Sending /bump...');
    
    const guild = channel.guild;
    await guild.commands.fetch();
    const bumpCommand = guild.commands.cache.find(cmd => cmd.name === 'bump' && cmd.applicationId === '302050872383242240');
    
    if (!bumpCommand) {
      console.log('Bump command not found, trying alternative method...');
      await channel.sendSlash('302050872383242240', 'bump');
    } else {
      await bumpCommand.run(channel);
    }
    
    console.log('Bump sent!');
    
  } catch (error) {
    console.error('Bump failed:', error.message);
  }
  
  const nextDelay = BASE_INTERVAL + getRandomDelay();
  console.log('Next bump in ' + Math.round(nextDelay / 60000) + ' minutes');
  setTimeout(doBump, nextDelay);
}

client.once('ready', () => {
  console.log('LOGGED IN as ' + client.user.tag);
  setTimeout(doBump, 60000);
});

process.on('unhandledRejection', () => {});

client.login(TOKEN);

app.get('/', (req, res) => res.send('OK'));
app.listen(PORT, () => console.log('Server on port ' + PORT));
