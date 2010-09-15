//steal/js fit/contextmenu/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/clean',function(){
	steal.clean('fit/contextmenu/contextmenu.html',{indent_size: 1, indent_char: '\t'});
});
