const helper = {
	logStart() {
		console.log('Bot has been started...')
	},

	getChatID(msg) {
		return msg.chat.id
	}
}

export default helper