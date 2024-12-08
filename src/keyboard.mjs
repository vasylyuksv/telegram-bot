import kb from './keyboard-buttons.mjs'

const keyboardjs = {
	home: [
		[kb.home.links, kb.home.menus]
	],
	links: [
		[{ text: 'Сайт кафедри', url: 'https://duikt.edu.ua/ua/161-kafedra-kompyuternih-nauk/' }],
		[{ text: 'Особистий кабінет', url: 'https://dn.duikt.edu.ua/my/' }],
		[{ text: 'Розклад', url: 'https://e-rozklad.duikt.edu.ua/time-table/student?type=0' }],
	],
	menus: [
		[ kb.menus.teacher_list, kb.menus.teacher_contacts ],
		[ kb.menus.prefect_contacts],
		[ kb.back ]
	]
}

export default keyboardjs