/**
 * @tag home
 * Keeps a div the width of the page.
 */
$.Controller.extend('Fit.Controllers.Resize',
{
    init: function(el, options){
		this.offset = this.element.offset();
        this.windowresize();
		
    },
    windowresize : function(){
        //if(!this.element) return;
        var offset = this.offset;

		
		if(this.options.bottom!= null){
			this.element.height(
                $(window).height() 
                - offset.top 
                - this.options.bottom
            );
		}
		
		if(this.options.right != null){
			setTimeout(this.callback('doRight'),20)
			
			this.element.width(
                $(window).width() 
                - offset.left 
                - this.options.right - 40
            );
		}
    },
	doRight : function(){
		var offset = this.offset;
		this.element.width(
	                $(window).width() 
	                - offset.left 
	                - this.options.right
	            );
	}
});
