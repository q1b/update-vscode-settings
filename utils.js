import chroma from "chroma-js"
import colors from "./assets/colors.json" assert { type: "json" }

/**
 *
 * @param {number} x
 * @param {number} decimals
 * @returns
 */
function roundTo(x, decimals) {
	const p = Math.pow(10, decimals)
	return Math.round(x * p) / p
}

// const deciToHex = (number) => number.toString(16)

// console.log("colors.slate".match(reg)?.groups.color)
// console.log("colors.slate.900".match(reg)?.groups.shade)
// console.log("4-glow->colors.slate".match(reg).groups.effect)
// console.log("mix->colors.slate".match(reg).groups.effect)

/**
 *  playground https://stackblitz.com/edit/github-gjbrd5?file=index.mjs
 * 	colors.white
 *	colors.black/10
 *	colors.slate.300
 *	colors.slate.300/10
 *	4-glow->colors.slate.300/10
 *	3-dim->colors.slate.300/10
 * 	mix->colors.slate.300/10&colors.slate.400
 */

const apply = {
	/**
	 *
	 * @param {{color:string;alpha?:number;degree:number;}} param0
	 * @returns {string}
	 */
	glow: ({ color, alpha, degree }) =>
		alpha
			? chroma(color).alpha(alpha).brighten(degree).hex()
			: chroma(color).brighten(degree).hex(),
	/**
	 *
	 * @param {{color:string;alpha?:number;degree:number;}} param0
	 * @returns {string}
	 */
	dim: ({ color, alpha, degree }) =>
		alpha
			? chroma(color).alpha(alpha).darken(degree).hex()
			: chroma(color).darken(degree).hex(),
}

/**
 *
 * @param {string} str
 * @returns {string}
 */
function parser(str) {
	let hex = extractHex(str)
	if (hex !== null) return hex[0]
	const extract_reg =
		/(?<degree>[\d\.\/]+(?=-))?-?(?<effect>\w+(?=->))?(->)?\$(?<color>\w+)\.?(?<shade>\d+)?\/?(?<alpha>\d+)?(&?\$(?<second_color>\w+)\.?(?<second_shade>\d+)?\/?(?<second_alpha>\d+)?)?/
	const extractedData = str.match(extract_reg)?.groups
	let {
		effect = undefined,
		color,
		shade = undefined,
		degree = "1",
		alpha = undefined,
		second_color = undefined,
		second_shade = undefined,
		second_alpha = undefined,
	} = extractedData
	const hex_color = shade ? colors[color][shade] : colors[color]
	if (degree?.includes("/")) {
		const [a, b] = degree.split("/")
		degree = parseInt(a) / parseInt(b)
	} else degree = parseInt(degree)

	alpha = alpha ? parseInt(alpha) / 100 : alpha
	second_alpha = second_alpha ? parseInt(second_alpha) / 100 : second_alpha

	if (effect === "mix") {
		if (second_color === undefined) {
			console.error("Define Second Color to apply mix effect")
			return "#ff0000"
		}
		degree = degree === 1 ? (degree = 1 / 2) : degree
		const hex_color_2 = second_shade
			? colors[second_color][second_shade]
			: colors[second_color]
		const h = (c, a) => (a ? chroma(c).alpha(a).hex() : chroma(c).hex())
		const hex1 = h(hex_color, alpha)
		const hex2 = h(hex_color_2, second_alpha)
		return chroma.mix(hex1, hex2, degree).hex()
	} else if (effect !== undefined && degree !== undefined) {
		return apply[effect]({ color: hex_color, degree: degree, alpha })
	}
	return alpha === undefined
		? hex_color
		: chroma(hex_color).alpha(alpha).hex()
}

let HEX = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i
let SHORT_HEX = /^#([a-f\d])([a-f\d])([a-f\d])([a-f\d])?$/i
/**
 *
 * @param {string} str
 * @returns {string | null}
 */
const extractHex = (str) =>
	str
		.replace(SHORT_HEX, (_, r, g, b, a) =>
			["#", r, r, g, g, b, b, a ? a + a : ""].join("")
		)
		.match(HEX)

export function replaceColorWithHex(obj) {
	const keys = Object.keys(obj)
	for (let i = 0; i < keys.length; i++) {
		const key = keys[i]
		const tokens = Object.keys(obj[key])
		if (typeof obj[key] !== "string") {
			for (let j = 0; j < tokens.length; j++) {
				const token = tokens[j]
				const value = obj[key][token]
				obj[key][token] = parser(value)
			}
		}
	}
}
/**
 *
 * @param {string} str
 *
 */
export function removeComments(str) {
	return str
		.split("\n")
		.filter((line) => {
			if (!!!line.includes("//")) return line
		})
		.join("\n")
}
