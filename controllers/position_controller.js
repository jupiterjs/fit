/**
 * @tag home
 * Can position a div so it is always on screen.
 */
$.Controller.extend("Fit.Controllers.Position",{
    /**
     * 
     * @param {Object} el
     * @param {Object} distance an object with top and left
     * @param {Boolean} keep cache position element for later
     * @param {Object} pos initial position
     */
    setup : function(el, distance, keep, pos){
        if(typeof el == "string"){ //handle passing in a rendered context menu
            var el = $(el)
        }
        if(el.jquery && el.length > 1){ //what if we don't have 1 top node
            el = $(document.createElement('div')).append(el);
        }
        this._super(el,{});
        //check if we are in the dom or not

        if(this.element.compare(document.documentElement) & 1 == 0){
            this.hasParentNode = true;
            this.element.show();
        }else{
            this.hasParentNode = keep || false;
            document.body.appendChild(this.element[0])
        }
        this.element.css({display: "block",position:"absolute"});
        this.element.hide();
        this.distance = distance || {top: 0, left: 0};
        if(pos){
            this.show(pos);
        }
    },
    /**
     * Shows the element at a specific location
     * @param {Object} pos an object like {pageX: x, pageY: y}
     */
    show : function(pos){
        if(this.closeCallback)
            $().unbind("click", this.closeCallback)
        if(pos.jquery){ //els
            pos = pos.offset();
        }else if(pos.pageX){ //evnt
            pos = {top: pos.pageY, left: pos.pageX}
        }
        //get the dimensions of the page
        var d = {}, x, y, de = document.documentElement;
		if( de && de.clientHeight ) {
			d.pageYOffset = de.scrollTop;
			d.pageXOffset = de.scrollLeft;
			d.innerHeight = de.clientHeight;
			d.innerWidth =  de.clientWidth;
		} else if( self.innerHeight ) {
			d.pageYOffset = self.pageYOffset;
			d.pageXOffset = self.pageXOffset;
			d.innerHeight = self.innerHeight;
			d.innerWidth = self.innerWidth;
		} else if( document.body ) {
			d.pageYOffset = document.body.scrollTop;
			d.pageXOffset = document.body.scrollLeft;
			d.innerHeight = document.body.clientHeight;
			d.innerWidth = document.body.clientWidth;
		}
						
        //position element off screen
        this.element.css({
            top: "-1000px",
            left: "-1000px"
            })
        this.element[0].style.display = "block";
        
        
        //get the dimensions of element
        var height = this.element.height(), width = this.element.width();
        
        //make sure dimensions allow entire menu to be on screen
        //is right ok?
		var rightOK  = pos.left+this.distance.left+width < d.innerWidth + d.pageXOffset,
		    bottomOK = pos.top+this.distance.top+height < d.pageYOffset + d.innerHeight,
			left     = rightOK ? pos.left+ this.distance.left : pos.left - this.distance.left -width,
			top      = bottomOK? pos.top+ this.distance.top : pos.top-  this.distance.top - height;
		

        this.element.css({
            top: top+"px",
            left: left +"px"
        })

         //listen for clicks on the document, close this guy, listen after this event
         setTimeout(this.callback('setClose'),10)
    },
    setClose : function(){
        if(this.closeCallback){
            $().unbind("click", this.closeCallback)
        }
        this.closeCallback = this.callback('close')
        $().bind("click",this.closeCallback)
    },
    /**
     * Hides and potentially removes the element.
     */
    close : function(){
        if(this.hasParentNode){
            this.element.hide()
        }else 
            this.element.remove();
        $().unbind("click", this.closeCallback)
    },
    click : function(el, ev){ //by default don't close
        ev.stopPropagation();
    }
})