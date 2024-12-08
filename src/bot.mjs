import TeleBot from "telebot"
import mongo from "./db.mjs"

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN)

bot.on("text", (msg) => {
	return msg.text.startsWith('/')
		? null
		: msg.reply.text(msg.text)
})

bot.on('/who', (msg) => {
	return bot.sendMessage(msg.from.id, `Hello, ${msg.from.first_name} ${msg.from.last_name} ${msg.from.username}`)
})

bot.on('/start', (msg) =>
	msg.reply.photo('https://duikt.edu.ua/img/logo_new.png')
)
bot.on('/db', (msg) => {
	console.debug(msg, 'msg')
	return msg.reply.text(mongo.db) || 'no db'
})

bot.on('/env', (msg) => msg.reply.text(process.env.VERCEL_ENV))


export default bot
