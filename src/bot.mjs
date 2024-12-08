import TeleBot from "telebot"

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN)

bot.on("text", msg => msg.reply.text(msg.text))

bot.on('/who', (msg) => {
	return bot.sendMessage(msg.from.id, `Hello, ${msg.from.first_name}`)
})

bot.on('/start', (msg) =>
	msg.reply.photo('https://duikt.edu.ua/img/logo_new.png')
)

export default bot
