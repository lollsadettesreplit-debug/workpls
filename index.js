const { Client } = require('discord.js-selfbot-v13');
const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 10000;

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447581540509815034';
const GUILD_ID = '1447580859585790057';

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

function sendBumpRaw() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({
      type: 2,
      application_id: '302050872383242240',
      guild_id: GUILD_ID,
      channel_id: CHANNEL_ID,
      session_id: client.sessionId,
      data: {
        version: '947088344167366698',
        id: '947088344167366698',
        name: 'bump',
        type: 1
      },
      nonce: Date.now().toString()
    });

    const options = {
      hostname: 'discord.com',
      path: '/api/v9/interactions',
      method: 'POST',
      headers: {
        'Authorization': TOKEN,
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    };

    const req = https.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => {
        if (res.statusCode === 200 || res.statusCode === 204) {
          resolve(true);
        } else {
          reject(new Error('Status: ' + res.statusCode + ' - ' + responseData.substring(0, 100)));
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

async function doBump() {
  try {
    console.log('Sending /bump...');
    await sendBumpRaw();
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
