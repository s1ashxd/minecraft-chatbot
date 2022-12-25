import { ChannelType, REST, Routes, SlashCommandBuilder } from "discord.js";
import { config } from "dotenv";

config()

const commands = [
  new SlashCommandBuilder()
    .setName('start')
    .setDescription('Запускает бота')
    .addStringOption(op => op
      .setName('ip')
      .setDescription('IP сервера')
      .setRequired(true))
    .addChannelOption(op => op
      .addChannelTypes(ChannelType.GuildText)
      .setName('channel')
      .setDescription('Канал взаимодействия')
      .setRequired(true))
    .addIntegerOption(op => op
      .setName('port')
      .setDescription('Порт сервера'))
    .addStringOption(op => op
      .setName('username')
      .setDescription('Никнейм бота'))
    .addStringOption(op => op
      .setName('password')
      .setDescription('Пароль бота'))
    .addStringOption(op => op
      .setName('username_regex')
      .setDescription('RegExp, вырезающий никнейм из сообщения. Индекс группы никнейма: 1'))
    .addStringOption(op => op
      .setName('message_regex')
      .setDescription('Фильтр сообщения'))
    .addIntegerOption(op => op
      .setName('message_delay')
      .setDescription('Задержка между сообщениями'))
    .addStringOption(op => op
      .setName('proxy_host')
      .setDescription('Хост SOCKS прокси'))
    .addIntegerOption(op => op
      .setName('proxy_port')
      .setDescription('Порт SOCKS прокси'))
    .addStringOption(op => op
      .setName('proxy_username')
      .setDescription('Пользователь SOCKS прокси'))
    .addStringOption(op => op
      .setName('proxy_password')
      .setDescription('Пароль SOCKS прокси'))
    .addIntegerOption(op => op
      .setName('proxy_type')
      .setDescription('Тип SOCKS прокси')
      .setChoices({ name: 'SOCKS4', value: 4}, { name: 'SOCKS5', value: 5 })),
  new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Останавливает бота')
    .addStringOption(op => op
      .setName('address')
      .setDescription('IP и порт сервера')
      .setRequired(true))
    .addStringOption(op => op
      .setName('username')
      .setDescription('Никнейм бота')
      .setRequired(true)),
  new SlashCommandBuilder()
    .setName('bot_list')
    .setDescription('Выведет список ботов этого сервера'),
  new SlashCommandBuilder()
    .setName('clean_message')
    .setDescription('Отправляет сообщение без никнейма')
    .addStringOption(op => op
      .setName('message')
      .setDescription('Сообщение')
      .setRequired(true)),
  new SlashCommandBuilder()
    .setName('halt')
    .setDescription('Экстренно завершает работу предыдущего бота или бота по индексу в массиве')
    .addIntegerOption(op => op
      .setName('index')
      .setDescription('Индекс бота в массиве'))
].map(c => c.toJSON())

const rest = new REST({ version: '10' }).setToken(process.env.BOT_TOKEN)

rest.put(Routes.applicationGuildCommands(process.env.BOT_ID, process.env.DEV_SERVER_ID), { body: commands })
  .then(() => console.log(`Successfully registered application commands.`))
  .catch(console.error);