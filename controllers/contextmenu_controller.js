/**
 * @tag home
 * Creates a context menu
 */
// this should be positionable, be handed a list
Fit.Controllers.Position.extend("Fit.Controllers.Contextmenu",{
    setup : function( ){
        this._super.apply(this,arguments)
		this.backgroundDiv = $("<div></div>").css({position: "absolute", display: "none"})
			.addClass("context_background")
		$(document.body).append(this.backgroundDiv)
    },
    mouseleave : function(){
        this.close();
        this.list = null;
        //this.callbacks = null;
    },
    show : function(list, callbacks, event){
        this.list =  list;
        this.callbacks = callbacks;
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
        this._super(event);
		var offset = this.element.offset();
		this.backgroundDiv.css({left: (offset.left+2)+"px", top: (offset.top+2)+"px"}).
			width(this.element.width()).
			height(this.element.height()).show()
    },
    runCallbacks : function(match){
        var res = true;
        //check ballbacks then list
        
        var args = $.makeArray(arguments).slice(1)
        if(typeof this.callbacks[match] == "function"){
			res = this.callbacks[match].apply(this.callbacks, args.concat([this.list])) 
		}else if(typeof this.list[match] == "function"){
			res = this.list[match].apply(this.list, args.concat([this.list]))  //(el, ev)
		}else if(typeof this.callbacks == "function"){
			res = this.callbacks.apply(null, $.makeArray(arguments).concat( [match, this.list] ))  
		}
        return res;
    },
    "li click" : function(el, ev){
        var match = "context"+$.String.classize(el[0].className.match(/do_(\w+)/)[1]);
		if(!this.runCallbacks(match, el, ev)) this.close();
    },
	close : function(){
        this.element.css({top: "10000px", left: "10000px"});
		this.backgroundDiv.css({top: "10000px", left: "10000px"});
		$().unbind("click", this.closeCallback)
	},
	destroy : function(){
		this.list =  null;
        this.callbacks = null;
		this._super();
		this.backgroundDiv.remove();
	}
})