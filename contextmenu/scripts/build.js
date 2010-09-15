//steal/js fit/contextmenu/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('fit/contextmenu/contextmenu.html',{to: 'fit/contextmenu'});
});
