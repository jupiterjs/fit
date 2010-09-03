//steal/js fit/scripts/compress.js

load("steal/rhino/steal.js");
steal.plugins('steal/build','steal/build/scripts','steal/build/styles',function(){
	steal.build('fit/fit.html',{to: 'fit'});
});
