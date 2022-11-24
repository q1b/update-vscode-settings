import * as _colors from "./dark.js";

const colors = {
	transparent: "#fff0",
	black: "#000",
	white: "#fff",
	..._colors,
	base: _colors.sage,
	// can be used for special type of elements like command pallete
	hipe: _colors.sky,
	prime: _colors.blue,
};

export default colors;
