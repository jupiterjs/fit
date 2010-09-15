//steal/js fit/list/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/clean',function(){
	steal.clean('fit/list/list.html',{indent_size: 1, indent_char: '\t'});
});
