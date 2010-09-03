module("fit test", { 
	setup: function(){
        S.open("//fit/fit.html");
	}
});

test("Copy Test", function(){
	equals(S("h1").text(), "Welcome to JavaScriptMVC 3.0!","welcome text");
});