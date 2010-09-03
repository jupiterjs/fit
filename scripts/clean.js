//steal/js fit/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/clean',function(){
	steal.clean('fit/fit.html',{indent_size: 1, indent_char: '\t'});
});
