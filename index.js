const mineflayer = require('mineflayer');

// ==================
// CHANGE ONLY THESE
// ==================
const ip = "aeroxolserver.aternos.me";
const port = 19266;
const botNames = ["pagol", "manoshik", "mata_nosto"];
const LOGIN_PASSWORD = "hagla123";
// ==================

function createBot(username) {
  const bot = mineflayer.createBot({
    host: ip,
    port: port,
    username: username
    // ⚠️ DO NOT set version (auto-detect)
  });

  let lastActionTime = Date.now();

  bot.once("spawn", () => {
    console.log(`✅ ${bot.username} joined server`);

    // 🔐 AuthMe login (delay REQUIRED)
    setTimeout(() => {
      bot.chat(`/login ${LOGIN_PASSWORD}`);
      console.log(`🔐 ${bot.username} sent /login`);
    }, 3000);

    // 🚶 Walk loop every 1 minute
    setInterval(() => {
      if (!bot.entity) return;

      bot.chat(
        "im a bot to make the server 24/7, so please ignore me by command /ignore name"
      );

      lastActionTime = Date.now();

      // Walk ~5 blocks
      bot.setControlState("forward", true);

      setTimeout(() => {
        bot.setControlState("forward", false);

        // Turn 180°
        bot.look(bot.entity.yaw + Math.PI, 0, true);

        // Jump 5 times
        jump(bot, 5);
      }, 2000);
    }, 60000);

    // 💤 AFK detection (5 min → jump twice)
    setInterval(() => {
      if (Date.now() - lastActionTime >= 5 * 60 * 1000) {
        console.log(`😴 ${bot.username} AFK detected`);
        jump(bot, 2);
        lastActionTime = Date.now();
      }
    }, 10000);
  });

  bot.on("end", () => {
    console.log(`❌ ${bot.username} disconnected → reconnecting in 5s`);
    setTimeout(() => createBot(username), 5000);
  });

  bot.on("kicked", (reason) => {
    console.log(`🚫 ${bot.username} kicked: ${reason}`);
  });

  bot.on("error", (err) => {
    console.log(`⚠️ ${bot.username} error: ${err.message}`);
  });
}

// Jump helper
function jump(bot, count) {
  let i = 0;
  const interval = setInterval(() => {
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 200);
    i++;
    if (i >= count) clearInterval(interval);
  }, 500);
}

// ⏱️ Bots join after 5 seconds
botNames.forEach((name) => {
  setTimeout(() => {
    createBot(name);
  }, 5000);
});
