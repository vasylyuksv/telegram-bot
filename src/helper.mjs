import * as cheerio from 'cheerio';
import axios from 'axios';

const helper = {
	logStart() {
		console.log('Bot has been started...')
	},

	getChatID(msg) {
		return msg.chat.id
	},

	async getTeachersHtml() {
		try {
			const response = await axios.get('https://duikt.edu.ua/ua/162-naukovo-pedagogichniy-personal-kafedra-kompyuternih-nauk-ta-informaciynih-tehnologiy');

			const html = response.data;
			const $ = cheerio.load(html);
			const array = $('.page.container-fluid')?.first().find('table > tbody > tr');

			const arrObjects = [];
			array.each((i, elem) => {
				const cell_photo = $(elem)?.find('td:nth-child(1)')
				const cell = $(elem)?.find('td:nth-child(2)')

				//.replace(/\u00A0/g, ' ').trim()
				const name = cell?.find('strong')?.last()?.text()

				if(cell) {
					arrObjects.push({
						photo: cell_photo?.find('img')?.attr('src') || '',
						name: name ? name.replace(/\u00A0/g, ' ').trim()  : '',
						job: cell?.find('p')?.first()?.text() || '',
					});
				}
			});

			return arrObjects;
		} catch (error) {
			console.error(error);
		}
	}
}

export default helper