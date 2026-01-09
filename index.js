const mineflayer = require("mineflayer");
const express = require("express");

// ===== ENV CONFIG =====
const HOST = process.env.MC_HOST;
const PORT = Number(process.env.MC_PORT);
const BOT_NAMES = process.env.BOT_NAMES.split(",");
const PASSWORD = process.env.AUTHME_PASSWORD;
// ======================

// ---- EXPRESS KEEP-ALIVE ----
const app = express();
const WEB_PORT = process.env.PORT || 10000;

app.get("/", (req, res) => {
  res.send("Minecraft bots are running");
});

app.get("/ping", (req, res) => {
  res.send("pong");
});

app.listen(WEB_PORT, () => {
  console.log(`🌐 Express server running on port ${WEB_PORT}`);
});
// --------------------------------

function createBot(name, delay) {
  setTimeout(() => {
    console.log(`🔌 Connecting ${name} to ${HOST}:${PORT}`);

    const bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
      username: name
    });

    let lastAction = Date.now();

    bot.once("spawn", () => {
      console.log(`✅ ${name} spawned`);

      // AuthMe login
      setTimeout(() => {
        bot.chat(`/login ${PASSWORD}`);
      }, 3000);

      // Main activity loop
      setInterval(() => {
        if (!bot.entity) return;

        bot.chat(
          "im a bot to make the server 24/7, so please ignore me by command /ignore name"
        );

        lastAction = Date.now();

        bot.setControlState("forward", true);

        setTimeout(() => {
          bot.setControlState("forward", false);
          bot.look(bot.entity.yaw + Math.PI, 0, true);
          jump(bot, 5);
        }, 2000);
      }, 60000);

      // AFK protection (5 min)
      setInterval(() => {
        if (Date.now() - lastAction > 5 * 60 * 1000) {
          jump(bot, 2);
          lastAction = Date.now();
        }
      }, 15000);
    });

    bot.on("end", () => {
      console.log(`❌ ${name} disconnected → reconnecting in 5s`);
      createBot(name, 5000);
    });

    bot.on("error", err => {
      console.log(`⚠️ ${name} error: ${err.message}`);
    });
  }, delay);
}

function jump(bot, times) {
  let i = 0;
  const t = setInterval(() => {
    bot.setControlState("jump", true);
    setTimeout(() => bot.setControlState("jump", false), 200);
    i++;
    if (i >= times) clearInterval(t);
  }, 500);
}

// ---- STAGGER BOT JOINS ----
BOT_NAMES.forEach((name, i) => {
  createBot(name.trim(), 5000 + i * 8000);
});
