const mineflayer = require('mineflayer')
const express = require('express')

/* =========================
   SERVER SETTINGS
========================= */

const HOST = 'aeroxolserver.aternos.me'
const PORT = 19266
const PASSWORD = 'alif123'

/* =========================
   BOT NAMES
========================= */

const botNames = [
  'pagol',
  'manoshik',
  'mata_nosto'
]

/* =========================
   EXPRESS SERVER
========================= */

const app = express()

app.get('/', (req, res) => {
  res.send('Bots are running!')
})

app.listen(3000, () => {
  console.log('Express server running on port 3000')
})

/* =========================
   CREATE BOT
========================= */

function createBot(username) {

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: username
  })

  console.log(`[${username}] Creating bot...`)

  bot.once('spawn', () => {
    console.log(`[${username}] Spawned!`)

    // Wait 3 seconds then login
    setTimeout(() => {

      bot.chat(`/login ${PASSWORD}`)

      console.log(`[${username}] Logged in`)

      startIgnoreLoop(bot)
      startMovementLoop(bot)

    }, 3000)
  })

  /* =========================
     AUTO RECONNECT
  ========================= */

  bot.on('end', () => {
    console.log(`[${username}] Disconnected. Reconnecting in 5s...`)

    setTimeout(() => {
      createBot(username)
    }, 5000)
  })

  bot.on('kicked', (reason) => {
    console.log(`[${username}] Kicked:`, reason)
  })

  bot.on('error', (err) => {
    console.log(`[${username}] Error:`, err.message)
  })
}

/* =========================
   IGNORE LOOP
========================= */

function startIgnoreLoop(bot) {

  setInterval(() => {

    bot.chat(`I'm a bot pls ignore me by typing /ignore name`)

    console.log(`[${bot.username}] Sent ignore message`)

  }, 60 * 1000)
}

/* =========================
   MOVEMENT LOOP
========================= */

function startMovementLoop(bot) {

  setInterval(async () => {

    try {

      console.log(`[${bot.username}] Moving...`)

      // Walk straight
      bot.setControlState('forward', true)

      await sleep(5000)

      bot.setControlState('forward', false)

      // Turn 90 degrees
      bot.look(
        bot.entity.yaw + Math.PI / 2,
        bot.entity.pitch,
        true
      )

      // Jump 3 times
      for (let i = 0; i < 3; i++) {

        bot.setControlState('jump', true)

        await sleep(500)

        bot.setControlState('jump', false)

        await sleep(500)
      }

    } catch (err) {
      console.log(`[${bot.username}] Movement error:`, err.message)
    }

  }, 60 * 1000)
}

/* =========================
   SLEEP FUNCTION
========================= */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/* =========================
   START ALL BOTS
========================= */

for (const name of botNames) {
  createBot(name)
}
