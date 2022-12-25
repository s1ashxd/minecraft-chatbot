import { TextChannel, WebhookClient } from 'discord.js'
import { config } from 'dotenv'
import discordClient from './discord'
import { createMinecraftBot, MinecraftBot } from './minecraftBot'

config()

let botArray: MinecraftBot[] = []

discordClient.on('interactionCreate', async data => {
  if (!data.isChatInputCommand()) return
  switch (data.commandName) {
    case 'start': {
      if (botArray.filter(b => b.guildID === data.guildId).length > 2) {
        await data.reply('На этом сервере уже запущенно 3 бота. Остановите одного, чтобы запустить нового')
        return
      }
      const botUsername = data.options.getString('username') ?? 'WyvernBot'
      if (botArray.filter(b => b.bot.username === botUsername).length > 0) {
        await data.reply('Бот с таким никнеймом уже существует')
        return
      }
      const interactChannelID = data.options.getChannel('channel').id
      if (botArray.filter(b => b.interactChannel.id === interactChannelID).length > 0) {
        await data.reply('Канал взаимодействия занят другим ботом')
        return
      } 
      let interactChannel: TextChannel = null
      try {
        interactChannel = (await data.guild.channels.fetch(interactChannelID)) as TextChannel
      } catch (e) {
        await data.reply('Укажите действительный канал взаимодействия')
        return
      }
      if (!interactChannel) {
        await data.reply('Укажите действительный канал взаимодействия. Он должен быть текстовым!')
        return
      }
      const webhooks = await interactChannel.fetchWebhooks()
      const existsWebhooks = webhooks.filter(c => c.name === 'WyvernBotWebhook')
      const webhookURL = existsWebhooks.size < 1 
        ? (await interactChannel.createWebhook({ name: 'WyvernBotWebhook' })).url 
        : existsWebhooks.first().url
      const proxyHost = data.options.getString('proxy_host')
      const proxyPort = data.options.getInteger('proxy_port')
      const proxyUsername = data.options.getString('proxy_username')
      const proxyPassword = data.options.getString('proxy_password')
      const proxyType = data.options.getInteger('proxy_type')
      let useProxy = false
      if (proxyHost || proxyPort || proxyUsername || proxyPassword || proxyType) {
        if (!proxyHost || !proxyPort || !proxyType) {
          data.reply('Для использования SOCKS прокси укажите все необходимые параметры (host, port, username, password, type)')
          return
        }
        useProxy = true
      }
      if (useProxy) await data.reply('Подключаюсь к прокси...')
      const minecraftBot = await createMinecraftBot({
        host: data.options.getString('ip'),
        port: data.options.getInteger('port'),
        username: botUsername,
        password: data.options.getString('password'),
        guildID: data.guildId,
        interactChannel,
        webhookClient: new WebhookClient({ url: webhookURL }),
        usernameRegexp: new RegExp(data.options.getString('username_regex')),
        messageRegexp: new RegExp(data.options.getString('message_regex') ?? '', 'g'),
        messageDelay: data.options.getInteger('message_delay') ?? 0,
        proxy: useProxy ? {
          host: proxyHost,
          port: proxyPort,
          userId: proxyUsername,
          password: proxyPassword,
          type: proxyType as 4 | 5
        } : null
      })
      minecraftBot.bot
        .once('login', async () => { 
          minecraftBot.spawned = true
          await interactChannel.send(`Бот для ${minecraftBot.address} присоеденился на сервер`) 
        })
        .once('error', async err => { 
          if (botArray.includes(minecraftBot)) 
            botArray.splice(botArray.lastIndexOf(minecraftBot), 1)
          await interactChannel.send(`Произошла ошибка у бота для ${minecraftBot.address}: ${err.message}`)
        })
        .once('kicked', async (reason) => {
          await minecraftBot.interactChannel.send(`Бот для ${minecraftBot.address} остановлен по причине ${JSON.parse(reason)?.text ?? reason}`) 
          botArray.splice(botArray.lastIndexOf(minecraftBot), 1)
        })
      botArray.push(minecraftBot)
      data.replied 
        ? await minecraftBot.interactChannel.send('Бот запущен! Ожидайте сообщение о спавне!') 
        : await data.reply('Бот запущен! Ожидайте сообщение о спавне!')
      return
    }
    case 'stop': {
      if (botArray.filter(b => b.guildID === data.guildId).length < 1) {
        await data.reply('На данном сервере не запущено ни одного бота')
        return
      }
      const botUsername = data.options.getString('username')
      const address = data.options.getString('address')
      const filteredBots = botArray.filter(b => b.bot.username === botUsername && b.address === address)
      if (filteredBots.length < 0) {
        await data.reply('Бота с таким никнеймом не существует')
        return
      }
      const minecraftBot = filteredBots[0]
      minecraftBot.bot.end('discord')
      botArray.splice(botArray.lastIndexOf(minecraftBot), 1)
      await data.reply('Бот успешно остановлен')
      return
    }
    case 'bot_list': {
      const filteredBots = botArray.filter(b => b.guildID === data.guildId)
      if (filteredBots.length < 1) {
        await data.reply('На данном сервере не запущено ни одного бота')
        return
      }
      let message = ''
      for (let i = 0; i < filteredBots.length; i++) {
        const minecraftBot = filteredBots[i]
        message += `Бот #${i} (${minecraftBot.bot.username}): ${minecraftBot.address}\n`
        const timeSinceLastMessage = Date.now() - minecraftBot.lastMessageTime
        if (timeSinceLastMessage < minecraftBot.messageDelay) 
          message += `_Сообщения этого бота заблокированы на ${(minecraftBot.messageDelay - timeSinceLastMessage) / 1000} секунд_\n`
        message += '\n'
      }
      await data.reply(message)
      return
    }
    case 'clean_message': {
      const botArrayFiltered = botArray.filter(b => b.guildID === data.guildId && b.interactChannel.id === data.channelId)
      if (botArrayFiltered.length < 1) return
      const minecraftBot = botArrayFiltered[0]
      if (!minecraftBot.spawned) {
        await data.reply('Бот не инициализирован. Подождите...')
        return
      }
      const timeSinceLastMessage = Date.now() - minecraftBot.lastMessageTime
      if (timeSinceLastMessage < minecraftBot.messageDelay) {
        await data.reply(`Повторите попытку через ${(minecraftBot.messageDelay - timeSinceLastMessage) / 1000} секунд`)
        return
      }
      const cleanContent = data.options.getString('message').replace(minecraftBot.messageRegexp, '').trim()
      minecraftBot.bot.chat(cleanContent)
      minecraftBot.lastMessageTime = Date.now()
      await data.reply({
        content: `Отправлено чистое сообщение: ${cleanContent}`,
      })
      break
    }
    case 'halt': {
      const index = data.options.getInteger('index')
      const bots = botArray.filter(b => b.guildID === data.guildId)
      if (bots.length < 1) {
        await data.reply('На данном сервере не запущено ни одного бота')
        return
      }
      const botToRemove = index === null ? bots[bots.length - 1] : bots[index]
      botToRemove.bot.end('discord')
      botArray.splice(botArray.lastIndexOf(botToRemove), 1)
      await data.reply('Бот удален успешно')
      break
    }
  }
})

discordClient.on('messageCreate', async data => {
  if (data.author.bot) return
  const botArrayFiltered = botArray.filter(b => b.guildID === data.guildId && b.interactChannel.id === data.channelId)
  if (botArrayFiltered.length < 1) return
  const minecraftBot = botArrayFiltered[0]
  if (!minecraftBot.spawned) return
  const timeSinceLastMessage = Date.now() - minecraftBot.lastMessageTime
  if (timeSinceLastMessage < minecraftBot.messageDelay) {
    await data.reply(`Повторите попытку через ${(minecraftBot.messageDelay - timeSinceLastMessage) / 1000} секунд`)
    return
  }
  const cleanContent = data.cleanContent.replace(minecraftBot.messageRegexp, '').trim()
  const author = data.author.username.replace(minecraftBot.messageRegexp, '')
  minecraftBot.bot.chat(author + ': ' + cleanContent)
  minecraftBot.lastMessageTime = Date.now()
  await data.react('✅')
})

discordClient.login(process.env.BOT_TOKEN)