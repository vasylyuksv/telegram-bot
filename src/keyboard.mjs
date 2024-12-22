import kb from './keyboard-buttons.mjs'

const keyboardjs = {
	home: [
		[kb.home.links, kb.home.menus]
	],
	menus: [
		[ kb.menus.teacher_list, kb.menus.teacher_contacts ],
		[ kb.menus.prefect_contacts],
		[ kb.back ]
	]
}

export default keyboardjs