console.log('🚀 BUMP BOT - SECONDARY SERVER TEST');

const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 10000;

// ==================== CONFIG ====================
const TOKEN = process.env.DISCORD_TOKEN;
const SERVER_ID = '1447580859585790057';     // Secondary server
const CHANNEL_ID = '1447582915696529450';    // Channel in secondary server

// Timing per test: 5 minuti invece di 2 ore (per test veloce)
const TEST_INTERVAL = 5 * 60 * 1000; // 5 minuti
const MIN_EXTRA = 1 * 60 * 1000;     // 1 minuto extra
const MAX_EXTRA = 3 * 60 * 1000;     // 3 minuti extra

if (!TOKEN) {
  console.error('❌ ERRORE: TOKEN MANCANTE');
  console.error('👉 Vai su Render → Settings → Environment');
  console.error('👉 Aggiungi: DISCORD_TOKEN = tuo_token');
  process.exit(1);
}

console.log('✅ Config OK');
console.log('✅ Secondary Server:', SERVER_ID);
console.log('✅ Channel:', CHANNEL_ID);
console.log('⏱️  Test mode: 5-8 minutes between bumps');

// ==================== FUNZIONI ====================
function getRandomExtra() {
  return Math.floor(Math.random() * (MAX_EXTRA - MIN_EXTRA + 1)) + MIN_EXTRA;
}

function getNextDelay() {
  return TEST_INTERVAL + getRandomExtra();
}

function sendBump() {
  console.log('🧪 TEST BUMP - Invio comando...');
  
  const data = JSON.stringify({
    type: 2,
    application_id: '302050872383242240', // Disboard ID
    guild_id: SERVER_ID,
    channel_id: CHANNEL_ID,
    session_id: 'test_session_' + Date.now(),
    data: {
      id: '947088344167366698',
      name: 'bump',
      type: 1,
      version: '947088344167366698'  // ⬅️ AGGIUNTO QUESTO!
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
      console.log(`📡 Status Code: ${res.statusCode}`);
      
      if (res.statusCode === 200 || res.statusCode === 204) {
        console.log('✅ TEST SUCCESS - Bump inviato!');
        console.log('🎯 Funziona sul server secondario!');
      } else if (res.statusCode === 401) {
        console.log('🔑 TOKEN SCADUTO o non valido');
        console.log('👉 Ottieni nuovo token con F12 → Console');
      } else if (res.statusCode === 404) {
        console.log('❌ Disboard non trovato in questo server');
        console.log('👉 Invita Disboard con /invite');
      } else if (res.statusCode === 403) {
        console.log('🚫 Permessi insufficienti');
        console.log('👉 Assicurati di avere accesso al canale');
      } else {
        console.log(`⚠️  Risposta: ${responseData.substring(0, 200)}`);
      }
      
      // Programma prossimo test
      scheduleNextBump();
    });
  });

  req.on('error', (error) => {
    console.log('❌ Errore di rete:', error.message);
    // Riprova tra 2 minuti
    setTimeout(scheduleNextBump, 2 * 60 * 1000);
  });

  req.write(data);
  req.end();
}

function scheduleNextBump() {
  const delay = getNextDelay();
  const nextTime = new Date(Date.now() + delay);
  
  console.log(`⏰ Prossimo test: ${nextTime.toLocaleTimeString()}`);
  console.log(`   (tra ${Math.round(delay / 1000)} secondi)`);
  console.log('---');
  
  setTimeout(sendBump, delay);
}

// ==================== WEB SERVER ====================
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    mode: 'secondary-server-test',
    server_id: SERVER_ID,
    channel_id: CHANNEL_ID,
    interval: '5-8 minutes',
    note: 'Testing on secondary server'
  });
});

app.get('/health', (req, res) => {
  res.send('TEST SERVER OK');
});

// ==================== START ====================
app.listen(PORT, () => {
  console.log(`🌐 Server test on port ${PORT}`);
  
  // Primo test tra 15 secondi
  const firstDelay = 15000;
  console.log(`⏳ Primo test tra ${firstDelay / 1000} secondi`);
  
  setTimeout(() => {
    sendBump();
  }, firstDelay);
  
  console.log('🎯 Bot di test attivo sul server secondario');
  console.log('👉 Verifica che Disboard sia nel server secondario!');
});

console.log('✅ Setup test completato');
