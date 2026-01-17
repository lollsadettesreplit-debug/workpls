const { Client } = require('discord.js-selfbot-v13');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 10000;

const TOKEN = process.env.DISCORD_TOKEN;
const CHANNEL_ID = '1447582915696529450';

const client = new Client({
  checkUpdate: false,
  ws: { properties: { browser: 'Discord Client' } }
});

const BASE_INTERVAL = 2 * 60 * 60 * 1000;
const MIN_DELAY = 5 * 60 * 1000;
const MAX_DELAY = 10 * 60 * 1000;

function getRandomDelay() {
  return Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY + 1)) + MIN_DELAY;
}

function getNextBumpTime() {
  return BASE_INTERVAL + getRandomDelay();
}

async function humanDelay(min, max) {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, delay));
}

async function doBump() {
  try {
    const channel = await client.channels.fetch(CHANNEL_ID);
    
    console.log('Preparing bump...');
    await humanDelay(1000, 3000);
    
    await channel.sendTyping();
    await humanDelay(500, 1500);
    
    console.log('Sending /bump...');
    await channel.sendSlash('302050872383242240', 'bump');
    
    console.log('Bump sent successfully');
    
  } catch (error) {
    console.error('Bump failed:', error.message);
  }
  
  const nextDelay = getNextBumpTime();
  const nextTime = new Date(Date.now() + nextDelay);
  const minutes = Math.round(nextDelay / 60000);
  
  console.log('Next bump in ' + minutes + ' minutes');
  console.log('Scheduled for: ' + nextTime.toLocaleTimeString());
  console.log('---');
  
  setTimeout(doBump, nextDelay);
}

client.on('ready', () => {
  console.log('Logged in as ' + client.user.tag);
  console.log('Target channel: ' + CHANNEL_ID);
  console.log('Interval: 2h + 5-10min random');
  console.log('---');
  
  const firstDelay = Math.floor(Math.random() * 30000) + 30000;
  console.log('First bump in ' + Math.round(firstDelay / 1000) + ' seconds...');
  
  setTimeout(doBump, firstDelay);
});

client.on('error', (error) => {
  console.error('Client error:', error.message);
});

client.on('disconnect', () => {
  console.log('Disconnected, reconnecting...');
});

client.login(TOKEN).catch(err => {
  console.error('Login failed:', err.message);
  console.log('Check your DISCORD_TOKEN');
  process.exit(1);
});

app.get('/', (req, res) => {
  res.json({
    status: 'running',
    uptime: process.uptime(),
    user: client.user ? client.user.tag : 'not logged in'
  });
});

app.get('/health', (req, res) => {
  res.send('OK');
});

app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});
