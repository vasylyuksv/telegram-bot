import TeleBot from "telebot"
import mongo from "./db.mjs"

import helper from "./helper.mjs";
import kb from "./keyboard-buttons.mjs";
import keyboardjs from "./keyboard.mjs";

import bot_data from "./bot_data.mjs";

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

bot.on('/env', (msg) => {
	return msg.reply.text(process.env.VERCEL_ENV)
});
bot.on("text", async (msg) => {
	//filter system message
	if (msg.text.startsWith('/')) return;

	//save user
	await updateUserOnMessage(msg)

	//get chat id
	const chatId = helper.getChatID(msg)

	//check message text
	switch(msg.text){
		case kb.home.links:
			return bot.sendMessage(chatId, 'Оберіть посилання', {
				replyMarkup: {
					inline_keyboard: keyboardjs.links,
				}
			});
			// break;
		case kb.home.menus:
			return bot.sendMessage(chatId, 'Оберіть розділ', {
				replyMarkup: {
					keyboard: keyboardjs.menus,
					resize: true
				}
			});
		case kb.back:
			return  bot.sendMessage(chatId, 'Головне Меню', {
				replyMarkup: {
					keyboard: keyboardjs.home,
					resize: true
				}
			});

		case kb.menus.teacher_list:


			return  bot.sendMessage(chatId, 'Розділи меню', {
				replyMarkup: {
					inline_keyboard: bot_data.teacher_list.reduce((acc, curr) => {
						acc.push([
							{
								text: curr.name,
								callback_data: curr.name}
						])
						return acc
					}, []),
					resize: true
				}
			});
		default:
			return  bot.sendMessage(chatId, 'Головне Меню', {
				replyMarkup: {
					keyboard: keyboardjs.home,
					resize: true
				}
			});
	}
})



bot.on('/start', async (msg) => {

	let user = await fetchUser(msg.chat)

	let welcome_message = `${msg.from.first_name} ${msg.from.last_name} (${msg.from.username}), раді бачити тебе на кафедрі Комп'ютерних наук, чим можу бути корисним?`
	if(user.count > 1) welcome_message = `Раді бачити тебе знову на кафедрі Комп'ютерних наук, чим можу бути корисним?`

	return msg.reply.photo(
		'https://duikt.edu.ua/img/logo_new.png',
		{
			caption: `${welcome_message}`,
			replyMarkup: {
				keyboard: keyboardjs.home,
				once: true,
				resize: true
			},
		},
	)
})

bot.on('callbackQuery', (msg) => {
	const chatId = helper.getChatID(msg.message)
	const teacher_name = (name) => bot_data.teacher_list.find(el => el.name === name)

	switch (msg.data) {
		case teacher_name(msg.data).name:
			return bot.sendMessage(
				chatId,
				`<strong>${teacher_name(msg.data).name}</strong>\n${teacher_name(msg.data).email}`,
				{ parseMode: 'html' }
			)
		default:
			return bot.sendMessage(chatId, 'Не знайдено', {
				replyMarkup: {
					keyboard: keyboardjs.home,
					resize: true
				}
			});
	}

	// return bot.answerCallbackQuery(msg.id, `Inline button callback: ${ msg.data }`, true);
});

export default bot

const users = mongo.db('DUIKTCS').collection('Users')

//fetch user from db or create new
async function fetchUser(data) {
	const filter = {id: data.id}
	await users.updateOne(filter, {$set: data}, {upsert: true})
	return await users.findOne(filter)
}

async function updateUserOnMessage(msg) {
	let user = await fetchUser(msg.chat)

	const data = {}
	//set
	data['id'] = user.id;
	if(!user.count) data['createdAt'] = new Date();
	data['updatedAt'] = new Date();
	data['count'] = user.count ? ++user.count : 1;

	//save in user collection
	await fetchUser(data)
}

