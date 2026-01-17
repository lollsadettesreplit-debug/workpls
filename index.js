
const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447582915696529450';

const client = new Client({
  checkUpdate: false,
  readyStatus: false,
  patchVoice: false
});

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
      console.log('Channel not found, fetching...');
      await client.channels.fetch(CHANNEL_ID);
      return setTimeout(doBump, 5000);
    }
    
    console.log('Sending /bump...');
    await channel.sendSlash('302050872383242240', 'bump');
    
    console.log('Bump sent successfully');
    
  } catch (error) {
    console.error('Bump failed:', error.message);
  }
  
  const nextDelay = BASE_INTERVAL + getRandomDelay();
  const minutes = Math.round(nextDelay / 60000);
  
  console.log('Next bump in ' + minutes + ' minutes');
  
  setTimeout(doBump, nextDelay);
}

client.once('ready', () => {
  console.log('Logged in as ' + client.user.tag);
  console.log('Waiting 60 seconds before first bump...');
  
  setTimeout(doBump, 60000);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled error:', error.message);
});

client.login(TOKEN).catch(err => {
  console.error('Login failed:', err.message);
  process.exit(1);
});

app.get('/', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log('Server on port ' + PORT);
});


