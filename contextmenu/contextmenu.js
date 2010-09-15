steal.plugins('phui/positionable','jquery/view/ejs','jquery/lang','phui/selectable')
	.css('contextmenu')
	.then("//fit/models/entry",function($){

/**
 * An ACL singleton ContextMenu
 */
Phui.Positionable.extend("Fit.Contextmenu",{
	defaults : {
		my : "left top",
		at : "left bottom"
	},
	init : function(){
		this._super.apply(this,arguments);
		
		this.menu = $("<div></div>").css({position: "absolute", display: "none"});
		this.menu.html("//fit/contextmenu/views/entry.ejs",{});
		this.menu.appendTo(document.body);
		new this(this.menu[0]);
	}
},{
	init : function(){
		this.element.phui_selectable({selectableClassName : 'active',
				multiActivate : false})
	},
	show : function(el, ev, location, list){
		this.list =  list;
        //this.callbacks = callbacks;
        var elements = this.find('li');
        
        for(var b = 0 ; b < elements.length; b++){
            var el = $(elements[b])
            var matches = el[0].className.match(/is_\w+/g)
            if(matches){
                var ok = true;
                for(var i =0; i < matches.length; i++){
                    var test = matches[i].match(/is_(\w+)/)[0];
                     ok = ok && this.list[$.String.camelize(test)]();
                }
                if(ok)
                    el.addClass('active').removeClass('inactive')
                else
                    el.removeClass('active').addClass('inactive')
            }else{
                el.addClass('active')
            }
        }
		this.element.css("opacity",0).show();
        this._super(el, ev, location);
		this.element.hide().css("opacity",1).slideDown("fast");
		clearTimeout(this._closeOnNextClickTimer);
		this._closeOnNextClickTimer = setTimeout(this.callback('closeOnNextClick'), 200);
		this.element.find(".active:first")[0].focus();
	},
	windowclick : function(){
		//hide
		if(this._closeOnNextClick ){
			this.element.hide();
			this._closeOnNextClick = false;
		}
	},
	closeOnNextClick : function(){
		this._closeOnNextClick = true;
	},
	click : function(el, ev){
		ev.stopPropagation();
	},
	"li activate" : function(el, ev){
		var funcName = el[0].className.match(/do_(\w+)/)[1];
		
		//this.list[funcName]();
		
		this.element.slideUp("fast", function(){
			$(this).find(".activated").removeClass("activated");
		});
		
	}
});

});