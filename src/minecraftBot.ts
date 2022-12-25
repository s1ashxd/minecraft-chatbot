import { TextChannel, WebhookClient } from "discord.js";
import { Bot, createBot } from "mineflayer";
import { SocksClient, SocksProxy } from "socks";
import applyMapListener from "./maps";
import { Client } from 'minecraft-protocol'

export interface MinecraftBot {
  address: string
  guildID: string
  interactChannel: TextChannel
  messageRegexp: RegExp
  messageDelay: number
  lastMessageTime: number
  spawned: Boolean
  bot: Bot
}

export interface MinecraftBotOptions {
  host: string
  port: number
  username: string
  password: string
  guildID: string
  interactChannel: TextChannel
  webhookClient: WebhookClient
  usernameRegexp: RegExp
  messageRegexp: RegExp
  messageDelay: number
  proxy: SocksProxy
}

export async function createMinecraftBot({
  host, 
  port, 
  username, 
  guildID,
  interactChannel,
  webhookClient,
  usernameRegexp,
  messageRegexp,
  messageDelay,
  proxy
}: MinecraftBotOptions): Promise<MinecraftBot> {
  let connector: (client: Client) => void = null
  if (proxy) {
    await SocksClient.createConnection({
      proxy,
      command: 'connect',
      destination: { host, port: port ?? 48743 }
    }, (err, data) => {
      if (err) {
        interactChannel.send('Не удалось подключиться к прокси: ' + err.message)
        console.log('error')
        return
      }
      connector = client => {
        client.setSocket(data.socket)
        client.emit('connect')
      }
    })
  }
  console.log(connector)
  const bot = createBot({ host, port, username, connect: connector })
  bot.on('messagestr', (message) => {
    if (message.trim().length < 1) return
    let result = message.match(usernameRegexp)
    let playerName = result === null ? null : result[1]
    let cleanMessage = message
    let avatarURL = 'https://cdn.discordapp.com/app-icons/1026834854190514287/dbb06470dba89c2740b35b980bdb2ace.png'
    if (playerName && playerName.length > 0) {
      cleanMessage = message.substring(result[0].length)
      if (cleanMessage.trim().length < 1) return
      avatarURL = 'https://mc-heads.net/avatar/' + playerName
    } else playerName = 'Server'
    if (playerName === bot.username) return
    webhookClient.send({
      username: playerName,
      avatarURL,
      content: cleanMessage.replace(/(?=[_*~`>]+)/g, '\\')
    })
  })

  applyMapListener(interactChannel, bot)
  return {
    address: host + (port ? ':' + port : ''),
    guildID,
    interactChannel,
    messageRegexp,
    messageDelay,
    lastMessageTime: 0,
    spawned: false,
    bot
  }
}