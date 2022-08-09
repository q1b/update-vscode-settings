import parser from "./parser.js"
import { dirname } from "node:path"
import fs from "node:fs/promises"
import constants from "./constants.js"
import { kitchen } from "./utils.js"

async function ensureWrite(file, text) {
	await fs.mkdir(dirname(file), { recursive: true })
	await fs.writeFile(file, text, "utf8")
}

/**
 * THEORY
 *
 * Goal -> Make a UI working within which is enjoyable which is already there, but I want to make it more, and more polished
 *
 * How? -> First make a Theme, which is easy to configure, maintain, along with testing contrast.
 *      -> Revising and revisiting, taking inspiration from other theme
 *      -> being consistent toward, The Improvement around the theme
 *      -> Exploring and Experiementing So, that new idea and possiblities should not be left behind.
 *      -> Last, Believing that it will become better overtime,
 *
 * > Never best but just better than before, cut from the race but ahead of it's time.
 *
 * So, today is 7-8-2022
 *
 * But it's ready started, 3days ago.
 *
 * APP BACKGROUND is darkest
 *
 * Workbench ->
 *  Title Bar
 *  Activity Bar
 *  Side Bar
 *  Panel
 *  Editor Group
 *  Status Bar
 *  * Editor don't be here but will be here
 *
 * COMPONENTS ->
 *  Button control ✅
 *  Breadcrumbs colors
 *  Dropdown control
 *  Menu
 *  Menubar
 *  Banner colors
 *  Extensions colors
 *  Quick picker colors
 *  Keybinding label colors
 *  Input control
 *  Scrollbar control
 *  Badge
 *  Progress bar
 *  Lists and trees
 *
 * 👆
 *    shared background is important, to be consistent,
 *    where it can be without distrubing the user experience.
 *
 *    # Visual Properties, to take into consideration are
 *      1. Foreground
 *      2. Background
 *      3. Border
 *      Shadow but, sometimes only it's just static most of the time.
 *
 *
 *
 *
 *    States :- Default -> Hovered | Focused | Pressed -> Selected
 *              Selected -> Hovered | Focused | Pressed -> Default
 *
 *    Events Related to Editor :-
 *              Search -> Selection, ActiveSelection
 *              Editor Notifications - Warning, Info, Error
 *              Default (Current_Changing) ,Modified, Added, Deleted
 *
 *    After Analysing, I am thinking to confine the shades of colors to some extend without losing the flexiblity, over changing stuff to match level of satisfaction I want
 *
 *    So, For each visual property we want
 *                          high contrast -> Active
 *                          medium contrast -> Hover
 *                          medium contrast -> Show Dragging
 *                          low contrast -> InActive
 *    text can be defined in range of 50 to 400
 *
 *    selection highlight 300 to 500
 *
 *    border part 500 to 700
 *
 *    background part 700 to 1000
 *
 *    introduction to new colors keys,
 *
 *    $base $default $modified $added $deleted $error $warning $info $success $attention $highlight
 *
 */

/**
 *
 * @param {{
 * 	keys:string[]
 *  values:string[]
 *  startpoint:string
 *  endpoint:string
 *  filepath:string
 * }} param0
 */
async function updateFile({ keys, values, startpoint, endpoint, filepath }) {
	const file = await fs.readFile(filepath, "utf8")
	const lines = file.split("\n")
	let final_result = ``
	let current_line_number = 0
	while (!lines[current_line_number].includes(startpoint)) {
		final_result += lines[current_line_number] + "\n"
		current_line_number += 1
	}
	final_result += "\t" + startpoint + "\n"
	current_line_number += 1
	// result += `\t"workbench.colorCustomizations": { \n`
	final_result += lines[current_line_number] + "\n"
	current_line_number += 1

	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		const value = values[i]
		final_result += `\t\t"${key}":"${value}",\n`
	}

	while (!lines[current_line_number].includes(endpoint)) {
		current_line_number += 1
	}

	final_result += `\t},\n`
	final_result += "\t" + endpoint + "\n"

	current_line_number += 1

	while (lines[current_line_number] !== undefined) {
		final_result += lines[current_line_number] + "\n"
		current_line_number += 1
	}
	ensureWrite(filepath, final_result)
}

async function main() {
	// parser will remove the comments and manipulate stuff So, add some magic
	let inputDetails = parser(await fs.readFile(`./inputSettings.json`, "utf8"))
	/**
	 * @type {{ "colors":any }}
	 */
	const inputSettings = JSON.parse(inputDetails)
	kitchen(inputSettings)
	await updateFile({
		startpoint: constants.startpoint,
		endpoint: constants.endpoint,
		filepath: constants.pathToSettings,
		keys: Object.keys(inputSettings["colors"]),
		values: Object.values(inputSettings["colors"]),
	})
}

main()
