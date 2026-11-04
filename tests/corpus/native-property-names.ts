const glyphs = { ".": [1, 2], "_": [3, 4], "$": 5, "_x24_": 6, "é": 7, "_xe9_": 8 };
console.log(glyphs["."].join(","), glyphs["_"].join(","));
console.log(glyphs["$"], glyphs["_x24_"], glyphs["é"], glyphs["_xe9_"]);
glyphs["."][0] = 9;
glyphs["_x24_"] = 10;
console.log(glyphs["."][0], glyphs["_"][0], glyphs["$"], glyphs["_x24_"]);
console.log(JSON.stringify(glyphs));
