const mineflayer = require("mineflayer");
const http = require("http");

// ===== EDIT ONLY HERE =====
const HOST = "aeroxolserver.aternos.me";
const PORT = 19266;
const BOT_NAMES = ["pagol", "manoshik", "mata_nosto"];
const PASSWORD = "hagla123";
// ==========================

// ---- KEEP RENDER ALIVE ----
const WEB_PORT = process.env.PORT || 10000;
http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Bots running");
}).listen(WEB_PORT, () => {
  console.log(`🌐 Keep-alive server on port ${WEB_PORT}`);
});

// --------------------------

function createBot(name, delay) {
  setTimeout(() => {
    console.log(`🔌 Connecting ${name} to ${HOST}:${PORT}`);

    const bot = mineflayer.createBot({
      host: HOST,
      port: PORT,
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
  createBot(name, 5000 + i * 8000); // join one-by-one
});
