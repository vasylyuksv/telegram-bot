import TeleBot from "telebot"
import mongo from "./db.mjs"

import helper from "./helper.mjs";
import kb from "./keyboard-buttons.mjs";
import keyboardjs from "./keyboard.mjs";

// import bot_data from "./bot_data.mjs";

const bot = new TeleBot(process.env.TELEGRAM_BOT_TOKEN);

let teachers_html = []
let teachers_list = []
let students_list = []
let links_list = []

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
			//get links
			links_list = links_list?.length
				? links_list
				: await helper.getSheetData('links')

			const formatted_links_list = links_list?.reduce((acc, curr) => {
				if(curr?.length && curr?.[1]) {

					acc.push([
						{
							text: curr?.[0] || 'Go to',
							url: `${curr[1]}`
						}
					])
				}
				return acc
			}, [])


			return bot.sendMessage(chatId, 'Оберіть посилання', {
				replyMarkup: {
					inline_keyboard: formatted_links_list,
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
			await  bot.sendMessage(chatId, 'Головне Меню', {
				replyMarkup: {
					keyboard: keyboardjs.home,
					resize: true
				}
			});
			break;

		case kb.menus.teacher_list:
			//teachers list
			teachers_html = teachers_html?.length
				? teachers_html
				: await helper.getTeachersHtml()

			const formated_teachers = teachers_html?.reduce((acc, curr, idx) => {
				if(curr.name) {
					const name = helper.formatName(curr.name)
					acc.push([
						{
							text: name,
							callback_data: `cd_html_teacher__${idx}`
						}
					])
				}
				return acc
			}, [])

			await  bot.sendMessage(chatId, `Виберіть наукового співробітника зі списку: (${formated_teachers?.length})`, {
				replyMarkup: {
					inline_keyboard: formated_teachers,
					resize: true
				}
			});

			break;
		case kb.menus.teacher_contacts:
			//teachers list
			teachers_list = teachers_list?.length
				? teachers_list
				: await helper.getSheetData()

			const formatted_teachers_list = teachers_list?.reduce((acc, curr, idx) => {
				if(curr?.length && curr?.[1]) {
					const name = helper.formatName(curr[1])

					acc.push([
						{
							text: `${name}`,
							callback_data: `cd_teacher__${idx}`
						}
					])
				}
				return acc
			}, [])


			return  bot.sendMessage(chatId, `Оберіть наукового співробітника зі списку, щоб переглянути контактні дані: (${formatted_teachers?.length})`, {
				replyMarkup: {
					inline_keyboard: formatted_teachers_list,
					resize: true
				}
			});
		case kb.menus.prefect_contacts:
			//students list
			students_list = students_list?.length
				? students_list
				: await helper.getSheetData('students')

			const formatted_students_list = students_list?.reduce((acc, curr, idx) => {
				if(curr?.length && curr?.[1]) {
					const name = helper.formatName(curr[1])

					acc.push([
						{
							text: `${name}`,
							callback_data: `cd_student__${idx}`
						}
					])
				}
				return acc
			}, [])

			return  bot.sendMessage(chatId, `Оберіть групу для отримання контактних даних старости:`, {
				replyMarkup: {
					inline_keyboard: formatted_students_list,
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

//clear variables
bot.on([
	'/clear_teachers_html',
	'/clear_teachers',
	'/clear_students',
], async (msg) => {
	const chatId = helper.getChatID(msg)
	let caption = `Кількість `

	switch(msg.text) {
		case '/clear_teachers_html':
			teachers_html = []
			caption += `вчителів: ${teachers_html?.length}`
			break;
		case '/clear_teachers':
			teachers_list = []
			caption += `вчителів: ${teachers_list?.length}`
			break;
		case '/clear_students':
			students_list = []
			caption += `груп: ${students_list?.length}`
			break;
		default:
			return
	}

	return  bot.sendMessage(chatId, caption, {
		replyMarkup: {
			keyboard: keyboardjs.home,
			resize: false,
		}
	});
})

bot.on('callbackQuery', async (msg) => {
	const chatId = helper.getChatID(msg.message)

	let photo = ''
	let idx = msg.data.split('__')[1];
	let data = ''
	let caption = ''

	// identify inline button by callback_data
	try {
		switch (true) {
			case msg.data.startsWith('cd_html_teacher__'):
				teachers_html = teachers_html?.length
					? teachers_html
					: await helper.getTeachersHtml()

				data = teachers_html[idx]

				if (!data?.name) break;

				photo = data?.photo
				caption = `<strong>${data.name}</strong>\n${data.job}`

				if (photo) {
					await bot.sendPhoto(chatId, photo, {caption: caption, parseMode: 'html'})
				} else {
					await bot.sendMessage(chatId, caption, {parseMode: 'html'})
				}
				break;

			case msg.data.startsWith('cd_teacher__'):

				teachers_list = teachers_list?.length
					? teachers_list
					: await helper.getSheetData()

				if (!teachers_list[idx]?.length) break;

				data = teachers_list[idx]
				caption = `<strong>${data?.[1]}</strong>\nEmail ${data?.[2]}\nTel: ${data?.[4]}`

				await bot.sendMessage(chatId, caption, {parseMode: 'html'});
				break;

			case msg.data.startsWith('cd_student__'):
				students_list = students_list?.length
					? students_list
					: await helper.getSheetData('students')

				if (!students_list[idx]?.length) break;

				data = students_list[idx]
				caption = `<strong>${data?.[2]} (${data?.[1]})</strong>\nEmail: ${data?.[3]}\nTel: ${data?.[4]}`

				await bot.sendMessage(chatId, caption, {parseMode: 'html'});
				break;

			default:
				await bot.sendMessage(chatId, 'Не знайдено', {
					replyMarkup: {
						keyboard: keyboardjs.menus,
						resize: true
					},
				});
		}
	} catch (error) {
		console.error('Error in callbackQuery:', error);
		await bot.sendMessage(chatId, 'Не знайдено', {
			replyMarkup: {
				keyboard: keyboardjs.menus,
				resize: true
			},
		});
	}
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

