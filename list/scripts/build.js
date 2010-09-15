//steal/js fit/list/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('fit/list/list.html',{to: 'fit/list'});
});
