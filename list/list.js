steal
	.plugins(
		'jquery/controller',
		'jquery/view/ejs',
		'phui/selectable',
		'jquery/event/drop',
		'jquery/event/drag/scroll')
	.css('list')
	.then('//fit/models/entry',

function($){

/**
 * A List of files
 */
$.Controller.extend("Fit.List",{
	defaults : {
		path : "/",
		model : Fit.Entry,
		indent : 0
	},
	listensTo : ["show"]
},{
	init : function(){
		if(this.options.select){
			this.element.phui_selectable({selectableClassName : 'entry',
				multiActivate : true});
		}
	},
	add : function(entries){
		this.element.append(this.view("show",entries));
	},
	set : function(entries){
		this.element.html(this.view("show",entries));
	},
	".directory dblclick" : function(el, ev){
		el.next().fit_list({
			path: el.model().path
		}).triggerHandler("show");
		ev.stopPropagation();
	},
	/**
	 * Opens
	 * @param {Object} el
	 * @param {Object} ev
	 * @param {Object} callback
	 */
	"show" : function(el, ev, callback){
		
        if(this.element.children().length ){
            this.element['toggle']();
            if(callback) callback();
        }
        else{
            this.options.model.findAll({path: this.options.path }, this.callback('set'))
            this.element.show().html("loading ...")
        }
		ev.stopPropagation();
	},
	fill : function(el){
		
	},
	/**
     * Sets up the drag to scroll the window, and revert when done
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} drag
     */
    ".entry draginit" : function(el, ev, drag){
        el.trigger('activate')
		//$("#entries").fit_selectable("select",el, true);
        el.css("opacity",0.2)
        drag.scrolls($('#entries'));
        //drag.ghost(true);
        drag.revert(true);
        drag.movingElement.data("dragList", new EntriesList( el.models() ))
    },
    ".entry dragend" : function(el){
        el.css("opacity",1)
    },
    /**
     * Show that you can drop
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} drop
     * @param {Object} drag
     */
    ".entry dropover" : function(el, ev, drop, drag){
        var dragList = drag.movingElement.data("dragList");
        if( dragList.canMoveTo(el.model()) ){
            el.addClass('canmove')
        }
    },
    /**
     * Move file or folder.
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} drop
     * @param {Object} drag
     */
    ".entry dropon" : function(el, ev, drop, drag){
        var dragList = drag.movingElement.data("dragList");
        if( dragList.canMoveTo(el.model()) ){
            var p = el.model().path
            dragList[0].move( p+(p == "/" ? "" : "/")+ dragList[0].name, this.callback("moved", p, dragList, dragList[0].path) )
            drag.revert(false);
            drag.movingElement.html("moving ...");
            ev.preventDefault();
            el.removeClass('selected');
        }
        el.removeClass('canmove');
        
    },
	moved : function(container, dragList, oldPath, entry, entries){
        var el = this.getEl( oldPath );
        if(entry.type == 'directory')
            el.next().remove();
        el.remove();
        this.show( this.getEl(container), entries, {new_file: entry});
    }
})
	
});