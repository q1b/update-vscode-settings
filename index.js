import { dirname } from "node:path"
import fs from "node:fs/promises"
import constants from "./constants.js"
import { removeComments, replaceColorWithHex } from "./utils.js"
import chroma from "chroma-js";

async function ensureWrite(file, text) {
	await fs.mkdir(dirname(file), { recursive: true })
	await fs.writeFile(file, text, "utf8")
}

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
async function updateFile({
	keys,
	values,
	startpoint,
	endpoint,
	filepath,
}) {
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
		const key = keys[i];
		const value = values[i];
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
	let inputDetails = await fs.readFile(`./inputSettings.json`, "utf8")
	inputDetails = removeComments(inputDetails)
	/**
	 * @type {{ "colors":any }}
	 */
	const inputSettings = JSON.parse(inputDetails)
	replaceColorWithHex(inputSettings)
	await updateFile({
		startpoint:constants.startpoint,
		endpoint:constants.endpoint,
		filepath:constants.pathToSettings,
		keys: Object.keys(inputSettings['colors']),
		values: Object.values(inputSettings['colors'])
	})
}

main()
