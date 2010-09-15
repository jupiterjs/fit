module("fit");

test("connect", function(){
	stop();
	Fit.Entry.connect({
		url : "stealjs.com",
		username: "stealjs",
		password: "Jupiter2IT06"
	},
	function(){
		ok(true, "connected")
		Fit.Entry.findAll({
			path: "/"
		},
		function(entries){
			ok(entries, "got content")
			console.log(entries);
			start();
		})
	})
});

test("createFile and destroyFile", function(){
	stop();
	var destroy =  function(){
		ok(true, "created");
		
		Fit.Entry.destroy(
			{ path: "/hello.txt", type: "file"}, 
			function(){
				ok(true, "destroyed")
				start();
		})
	}
	
	Fit.Entry.createFile("/hello.txt",destroy)
});


