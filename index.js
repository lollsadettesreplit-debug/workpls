console.log('=== AUTO BUMP BOT ===');

const express = require('express');
const https = require('https');

const app = express();
const PORT = process.env.PORT || 10000;

// CONFIG
const TOKEN = process.env.DISCORD_TOKEN;
const SERVER_ID = '1447204367089270874';
const CHANNEL_ID = '1447213878030237696';

// VERIFICA
if (!TOKEN) {
  console.error('❌ ERRORE: DISCORD_TOKEN non trovato!');
  console.error('   Vai su Render → Settings → Environment');
  console.error('   Aggiungi: DISCORD_TOKEN = tuo_token_qui');
  process.exit(1);
}

console.log('✅ Configurazione OK');
console.log('✅ Server ID:', SERVER_ID);
console.log('✅ Channel ID:', CHANNEL_ID);

// FUNZIONE BUMP
function sendBump() {
  console.log('🔄 Invio bump...');
  
  const data = JSON.stringify({
    type: 2,
    application_id: '302050872383242240', // Disboard ID
    guild_id: SERVER_ID,
    channel_id: CHANNEL_ID,
    data: {
      id: '947088344167366698',
      name: 'bump',
      type: 1
    }
  });

  const options = {
    hostname: 'discord.com',
    port: 443,
    path: '/api/v9/interactions',
    method: 'POST',
    headers: {
      'Authorization': TOKEN,
      'Content-Type': 'application/json',
      'User-Agent': 'Mozilla/5.0'
    }
  };

  const req = https.request(options, (res) => {
    console.log(`📡 Risposta: ${res.statusCode}`);
    
    res.on('data', () => {});
    res.on('end', () => {
      if (res.statusCode === 200 || res.statusCode === 204) {
        console.log('✅ BUMP INVIATO!');
        console.log('⏰ Prossimo tra 2 ore');
      } else {
        console.log('⚠️  Bump fallito, riprovo dopo');
      }
    });
  });

  req.on('error', (error) => {
    console.log('❌ Errore rete:', error.message);
  });

  req.write(data);
  req.end();
}

// SERVER WEB
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'autobump',
    uptime: Math.floor(process.uptime()),
    next_bump: '2 ore'
  });
});

app.get('/health', (req, res) => {
  res.send('OK');
});

// AVVIA
app.listen(PORT, () => {
  console.log(`🌐 Server avviato: porta ${PORT}`);
  
  // PRIMO BUMP TRA 1 MINUTO
  setTimeout(() => {
    sendBump();
  }, 60000);
  
  // POI OGNI 2 ORE
  setInterval(() => {
    sendBump();
  }, 7200000); // 2 ore
  
  console.log('🚀 Bot pronto!');
  console.log('⏱️  Primo bump tra 1 minuto');
});

console.log('✅ Setup completato');
