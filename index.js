const mineflayer = require('mineflayer')
const express = require('express')

/* =========================================
   SERVER CONFIG
========================================= */

const HOST = 'aeroxolserver.aternos.me'
const PORT = 19266
const VERSION = '1.21.7'
const PASSWORD = 'alif123'

/* =========================================
   BOT LIST
========================================= */

const botNames = [
  'pagol',
  'manoshik',
  'mata_nosto',
  'IkeaBot'
]

/* =========================================
   IKEA BOT CONFIG
========================================= */

const PREFIX = '$'
const owners = ['alifthepro123']

const seenPlayers = {}
const whisperedPlayers = new Set()
const stalkingIntervals = {}

const jokes = [
  'Why did the creeper cross the road? To get to the other sssside.',
  'Never dig straight down.',
  'Herobrine joined the server.',
  'Creepers love hugs.',
  'Skeletons have terrible aim.',
  'Villagers are just unemployed players.'
]

/* =========================================
   EXPRESS SERVER
========================================= */

const app = express()

app.get('/', (req, res) => {
  res.send('Bots online')
})

app.listen(3000, () => {
  console.log('Express server running on port 3000')
})

/* =========================================
   CREATE BOT
========================================= */

function createBot(username) {

  console.log(`[${username}] Creating bot...`)

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username,
    version: VERSION
  })

  bot.afkEnabled = true
  bot.spawnTime = Date.now()

  bot.on('login', () => {
    console.log(`[${username}] Logged in`)
  })

  bot.once('spawn', async () => {

    console.log(`[${username}] Spawned`)

    await sleep(1500)

    bot.chat(`/login ${PASSWORD}`)

    console.log(`[${username}] Auth complete`)

    startBasicLoop(bot)

    if (username === 'IkeaBot') {
      setupIkeaBot(bot)
    }
  })

  bot.on('playerJoined', (player) => {
    seenPlayers[player.username] = new Date().toLocaleString()
  })

  bot.on('messagestr', (msg) => {
    console.log(`[${username}] ${msg}`)
  })

  bot.on('kicked', (reason) => {
    console.log(`[${username}] Kicked: ${reason}`)
  })

  bot.on('error', (err) => {
    console.log(`[${username}] Error: ${err.message}`)
  })

  bot.on('end', () => {

    console.log(`[${username}] Reconnecting in 5s...`)

    setTimeout(() => {
      createBot(username)
    }, 5000)
  })
}

/* =========================================
   BASIC LOOP
========================================= */

function startBasicLoop(bot) {

  setInterval(async () => {

    if (bot.username === 'IkeaBot' && !bot.afkEnabled) return

    try {

      bot.chat(`I'm a bot pls ignore me`)

      // walk forward
      bot.setControlState('forward', true)

      await sleep(5000)

      bot.setControlState('forward', false)

      // turn 180°
      await bot.look(
        bot.entity.yaw + Math.PI,
        0,
        true
      )

      // jump 3 times
      for (let i = 0; i < 3; i++) {

        bot.setControlState('jump', true)

        await sleep(400)

        bot.setControlState('jump', false)

        await sleep(700)
      }

    } catch (e) {
      console.log(e)
    }

  }, 60000)
}

/* =========================================
   IKEA BOT SYSTEM
========================================= */

function setupIkeaBot(bot) {

  console.log('[IkeaBot] Special systems enabled')

  /* =========================
     CHAT COMMANDS
  ========================= */

  bot.on('chat', async (username, message) => {

    if (username === bot.username) return

    seenPlayers[username] = new Date().toLocaleString()

    const lower = message.toLowerCase()

    /* =========================
       AUTO GREETING
    ========================= */

    if (lower === 'hello' || lower === 'hi') {

      bot.chat(`what's up ${username}, how it's going?`)
    }

    /* =========================
       PREFIX CHECK
    ========================= */

    if (!message.startsWith(PREFIX)) return

    const args = message.slice(PREFIX.length).trim().split(' ')
    const command = args.shift()?.toLowerCase()

    const isOwner = owners.includes(username)

    /* =========================
       PUBLIC COMMANDS
    ========================= */

    if (command === 'ping') {
      bot.chat(`Ping: ${bot.player.ping || 0}ms`)
    }

    else if (command === 'uptime') {

      const uptime = Math.floor((Date.now() - bot.spawnTime) / 1000)

      bot.chat(`Uptime: ${uptime}s`)
    }

    else if (command === 'info') {

      const pos = bot.entity.position

      bot.chat(
        `Bot:${bot.username} Version:${VERSION} XYZ:${Math.floor(pos.x)} ${Math.floor(pos.y)} ${Math.floor(pos.z)} Health:${bot.health}`
      )
    }

    else if (command === 'health') {

      bot.chat(`Health:${bot.health} Hunger:${bot.food}`)
    }

    else if (command === 'inventory') {

      const items = bot.inventory.items()

      if (!items.length) {
        bot.chat('Inventory empty')
      } else {
        bot.chat(items.map(i => i.name).join(', '))
      }
    }

    else if (command === 'players') {

      const players = Object.keys(bot.players)

      bot.chat(`Players: ${players.join(', ')}`)
    }

    else if (command === 'time') {

      bot.chat(`Time: ${bot.time.timeOfDay}`)
    }

    else if (command === 'tps') {

      bot.chat('TPS checking depends on server support.')
    }

    else if (command === 'joke') {

      const joke = jokes[Math.floor(Math.random() * jokes.length)]

      bot.chat(joke)
    }

    else if (command === 'seen') {

      const target = args[0]

      if (!target) {
        bot.chat('Usage: $seen <player>')
      } else {

        if (seenPlayers[target]) {
          bot.chat(`${target} was seen at ${seenPlayers[target]}`)
        } else {
          bot.chat(`Never seen ${target}`)
        }
      }
    }

    else if (command === 'serverinfo') {

      const count = Object.keys(bot.players).length

      bot.chat(
        `IP:${HOST} Port:${PORT} Version:${VERSION} Players:${count}`
      )
    }

    else if (command === 'help' || command === 'cmds') {

      bot.chat(
        'Commands: ping uptime info health inventory players time tps joke seen serverinfo help'
      )
    }

    /* =========================
       OWNER COMMANDS
    ========================= */

    if (!isOwner) return

    if (command === 'say') {

      const text = args.join(' ')

      if (text) {
        bot.chat(text)
      }
    }

    else if (command === 'disconnect') {

      bot.quit()
    }

    else if (command === 'reconnect') {

      const sec = parseInt(args[0]) || 5

      bot.chat(`Reconnecting in ${sec}s`)

      setTimeout(() => {
        bot.quit()
      }, sec * 1000)
    }

    else if (command === 'afk') {

      const state = args[0]

      if (state === 'on') {

        bot.afkEnabled = true
        bot.chat('AFK enabled')
      }

      else if (state === 'off') {

        bot.afkEnabled = false
        bot.chat('AFK disabled')
      }
    }
  })

  /* =========================
     SECRET PLACE PROTECTION
  ========================= */

  setInterval(() => {

    for (const username in bot.players) {

      if (username === bot.username) continue

      const player = bot.players[username]

      if (!player.entity) continue

      const distance = bot.entity.position.distanceTo(
        player.entity.position
      )

      if (distance <= 5) {

        // stop afk movement
        bot.afkEnabled = false

        // sneak
        bot.setControlState('sneak', true)

        // look at player
        bot.lookAt(player.entity.position.offset(0, 1.6, 0))

        // whisper once
        if (!whisperedPlayers.has(username)) {

          bot.chat(
            `/whisper ${username} hey what are you doing here? it's a secret place`
          )

          whisperedPlayers.add(username)
        }

        // spam help every 5 mins
        if (!stalkingIntervals[username]) {

          stalkingIntervals[username] = setInterval(() => {

            bot.chat(
              `pls help me @${username} is stalking me,help pls`
            )

          }, 300000)
        }

      } else {

        // restore afk
        bot.afkEnabled = true

        bot.setControlState('sneak', false)

        if (stalkingIntervals[username]) {

          clearInterval(stalkingIntervals[username])

          delete stalkingIntervals[username]
        }
      }
    }

  }, 3000)
}

/* =========================================
   SLEEP
========================================= */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/* =========================================
   START ALL BOTS
========================================= */

for (const name of botNames) {
  createBot(name)
       }
