/**
 * @tag home
 * Keeps track of 'selectable' objects. Allows keypress between them.
 */
$.Controller.extend('Fit.Controllers.Selectable',{},{
    init : function(el, selectOne){ 

        //this.element[0].tabIndex = 0; /// this is so we can receive key events 
        this.selectOne = selectOne
    }, 
    selectedElements : function(){ return this.find('.selected') },
    
	".selectable focus" : function(el){
		 el.addClass('selected')
		 this.lastSelected = el;
	},
	".selectable blur" : function(el){
	     el.removeClass('selected')
	},
	".selectable mouseenter" : function(el){
         el.addClass('highlight')
	},
	".selectable mouseleave" : function(el){
         el.removeClass('highlight')
	},
	/*".selectable click" : function(el, ev){ 
       if(ev.shiftKey && this.lastSelected && !this.selectOne){ 
            //we need to get all entries between this an the other folder 
            var selectables = this.find('.selectable'), entries = $([]), clicked = el; 
            var start = clicked.compare(this.lastSelected) & 4 ? clicked : this.lastSelected 
            var end = start == clicked ? this.lastSelected : clicked; 
            var add = false; 
            //entries.push( start ) 
            selectables.each(function(){ 
                var entry = $(this); compare = start.compare(entry); 
                if(compare == 0 ) add = true; 
                if(compare & 4 ) add = true; 
                if(entry.compare( end) & 2 ) add = false; 
                if(entry.hasClass('selected')) add = true; 
                if(add) entry.addClass('selected') 
                add = false; 
            }); 
        } else if(ev.ctrlKey || ev.metaKey && this.selectOne){ // metaKey is for Mac computers! 
            if(el.hasClass('selected')) 
               el.removeClass('selected') 
            else 
               el.addClass('selected') 
        } else { 
            this.find('.selected').removeClass('selected') 
            el.addClass('selected') 
        }
		this.select(el)
        //this.lastSelected = el; 
		
    },
    //".selectable mousedown" : function(el, ev){
    //      ev.preventDefault();
    //},*/
    getCurrentLocation : function(){
        
        var selectables = this.find(".selectable:visible");
        if(!this.lastSelected) return [undefined,selectables ];
        for(var i=0; i < selectables.length; i++){
            if(selectables[i] === this.lastSelected[0]) return [i, selectables]
        }
        return [undefined,selectables ];
    },
    ".selectable keyup" : function(el, ev){ //start sudo code 
        //make sure we are coming from here
        if(ev.target != el[0]) return;
        var picked = el[0];

		if(ev.keyCode== 40){ //down
            
		    var where = this.getCurrentLocation()
            if(where[0] >= 0 && where[0]+1 < where[1].length ){
				picked = where[1][where[0]+1]
				picked.focus();
				ev.preventDefault();
            }
        }else if(ev.keyCode == 38){ //up
            var where = this.getCurrentLocation()
			if(where[0] > 0){
                picked = where[1][where[0]-1]
				picked.focus();
				ev.preventDefault();
            }
			
        }else if(ev.keyCode == 13){
		   el.trigger( ev.ctrlKey ? 'contextmenu' : 'dblclick')
		}
		
    },
    select : function(el, removeOthers){
		if(removeOthers) this.selectedElements().removeClass('selected')
        el.addClass('selected')
		el.trigger('selected');
		this.lastSelected = el;
    },
    deselect : function(el){
        el.removeClass('selected')
    }
})