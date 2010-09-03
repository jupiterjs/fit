/**
 * @tag home
 * Adds a flash upload to the context menu.  Does some special things to hide
 * and show the context menu so flash does't have to load each time.
 */
Fit.Controllers.Contextmenu.extend("Fit.Controllers.EntryContextmenu",{},{
    setup : function(){
        this._super.apply(this,arguments);
        //this.element.css({top: "500px", left: "500px"}).show();
        //make an element for permanent flash (we can't ever hide it
        this.upload = $("<div id='uploadContainer'><div id='upload'></div></div>")
             .appendTo(document.body)
            .css({top: "0px", left: "600px", position: "absolute", zIndex: 900})
        
        
        function readCookie(name) {
        	var nameEQ = name + "=";
        	var ca = document.cookie.split(';');
        	for(var i=0;i < ca.length;i++) {
        		var c = ca[i];
        		while (c.charAt(0)==' ') c = c.substring(1,c.length);
        		if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        	}
        	return null;
        }
        var self= this;
        var uploadifyOptions = {
            uploader: "/swf/uploadify.swf",
            script: "/upload?_ftp_session_id="+readCookie('_ftp_session_id'),
            scriptData : {},
            multi: true,
            sizeLimit : 10000000,
            simUploadLimit : 3,
            cancelImg :  "/images/cancel.png",
            buttonImg : "/images/uploadbutton.png",
            width: 109,
            height: 26,
            folder: "",
            onSelectOnce : function(ev){ //fire after small delay
                self.close();
                setTimeout(function(){
                     $("#upload").uploadifySettings("folder",self.list[0].path);
                     $("#upload").uploadifyUpload();
                },13)
            },
            rollover : true
        }
        
        $.each(["Select","Progress","Complete"],function(i, val){
            uploadifyOptions["on"+val] = function(){
                console.log("calling back")
                self.runCallbacks.apply(self, ["contextUpload"+val].concat($.makeArray(arguments)) );
                return false;
            }
        })        
        $("#upload").uploadify(uploadifyOptions)
        setTimeout(this.callback('close'),1200);
        //this.upload.click(function(ev){
        //    self.runCallbacks.call(self, "contextUpload", $(this), ev)
        //})
    },
    mouseleave : function(el, ev){
        var compare = this.upload.compare(ev.relatedTarget);
        if(compare===0 || compare & 17  ) return;
        //if(ev.relatedTarget)
        this.close();
        //this.list = null;
        //this.callbacks = null;
    },
    close : function(){
        this._super();
        this.upload.css({top: "10000px", left: "10000px"})
    },
    show : function(){
        this._super.apply(this, arguments);
        var myup = $("#myupload"), off = myup.offset();
        if(myup.height()){
            this.upload.css({top: off.top+"px", left: off.left+"px"})
        }else{
            this.upload.css({top: "10000px", left: "10000px"})
        }
        
    }
})