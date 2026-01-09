const mineflayer = require("mineflayer");

// ===== EDIT ONLY HERE =====
const HOST = "aeroxolserver.aternos.me";
const PORT = 25565;
const BOT_NAMES = ["pagol", "manoshik", "mata_nosto"];
const PASSWORD = "hagla123";
// ==========================

function createBot(name) {
  console.log(`🔌 Connecting ${name} to ${HOST}:${PORT}`);

  const bot = mineflayer.createBot({
    host: HOST.trim(),
    port: Number(PORT),
    username: name
  });

  bot.once("spawn", () => {
    console.log(`✅ ${name} spawned`);

    setTimeout(() => {
      bot.chat(`/login ${PASSWORD}`);
    }, 3000);

    setInterval(() => {
      bot.chat(
        "im a bot to make the server 24/7, so please ignore me by command /ignore name"
      );

      bot.setControlState("forward", true);

      setTimeout(() => {
        bot.setControlState("forward", false);
        bot.look(bot.entity.yaw + Math.PI, 0, true);
        jump(bot, 5);
      }, 2000);
    }, 60000);
  });

  bot.on("end", () => {
    console.log(`❌ ${name} disconnected → retry in 5s`);
    setTimeout(() => createBot(name), 5000);
  });

  bot.on("error", err => {
    console.log(`⚠️ ${name} error: ${err.message}`);
  });
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

// Delay join 5 sec
setTimeout(() => {
  BOT_NAMES.forEach(createBot);
}, 5000);
