import * as cheerio from 'cheerio';
import axios from 'axios';

const helper = {
	logStart() {
		console.log('Bot has been started...')
	},

	getChatID(msg) {
		return msg.chat.id
	},

	formatName(name) {
		return name ? name.replace(/\u00A0/g, ' ').trim() : '';
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
				const name = cell?.find('strong')?.last()?.text()

				if(cell) {
					arrObjects.push({
						photo: cell_photo?.find('img')?.attr('src') || '',
						name: name ? this.formatName(name)  : '',
						job: cell?.find('p')?.first()?.text() || '',
					});
				}
			});

			return arrObjects;
		} catch (error) {
			console.error(error);
		}
	},

	async getSheetData(students = null) {
		// Google Sheets configuration
		const API_KEY = process.env.SHEET_API_KEY;     // API key
		const SHEET_ID = process.env.SHEET_ID; // ID table

		let RANGE = ''

		switch(students) {
			case 'students':
				RANGE = process.env.SHEET_RANGE_STUDENTS;
				break;
			case 'links':
				RANGE = process.env.SHEET_RANGE_LINKS;
				break;
			default:
				RANGE = process.env.SHEET_RANGE_TEACHERS;
				break
		}

		try {
			const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${RANGE}?key=${API_KEY}`;
			const response = await axios.get(url);
			return response.data.values;
		} catch (error) {
			console.error('Error while receiving data:', error);
			return [];
		}
	}
}

export default helper