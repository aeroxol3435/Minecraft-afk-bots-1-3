const mineflayer = require('mineflayer');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000; // Render auto-assigns

// Environment variables
const serverIP = process.env.SERVER_IP;
const serverPort = parseInt(process.env.SERVER_PORT) || 25565;
const usernames = (process.env.BOT_NAMES || 'pagol,manoshik,mata_nosto').split(',');

function createBot(username) {
  const bot = mineflayer.createBot({
    host: serverIP,
    port: serverPort,
    username: username
  });

  bot.once('spawn', () => {
    console.log(`✅ ${bot.username} spawned`);
    bot.chat("im back");

    setInterval(() => {
      if (!bot.entity || !bot.entity.position) return;

      bot.chat("i wanna run away");

      bot.setControlState('forward', true);

      setTimeout(() => {
        bot.setControlState('forward', false);
        bot.look(bot.entity.yaw + Math.PI, 0, true); // turn around
      }, 2000);
    }, 60000);
  });

  bot.on('end', () => {
    console.log(`❌ ${bot.username} disconnected. Reconnecting...`);
    setTimeout(() => {
      createBot(username);
    }, 10000);
  });

  bot.on('error', (err) => {
    console.log(`⚠️ ${bot.username} error: ${err.message}`);
  });

  return bot;
}

// Create bots
usernames.forEach(name => createBot(name));

// Express for uptime check
app.get('/', (req, res) => {
  res.send(`🟢 Bots online: ${usernames.join(', ')}`);
});

app.get('/ping', (req, res) => {
  res.send('pong');
});

app.listen(port, () => {
  console.log(`🌐 Web server running at http://localhost:${port}`);
});
