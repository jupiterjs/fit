steal.then(function(){

$.Controller.extend("Fit.Controllers.Main",
{
	onDocument: true,
	editAreaLoaded : function(){
		$(window).trigger("resize")
		$('#frame_EDITAREA_TEXTAREA').fit_resize({bottom: 0, right: 0});
	},
    editAreaFileClosed : function(file){
        return $(document.documentElement).fit_entries("fileClosed",file)
    },
    editAreaSaved : function(edit_area_id, text){
        var file_id = editAreaLoader.getCurrentFile(edit_area_id).id; 
        OpenAjax.hub.publish("editarea.save",{path: file_id, text: text, edit_area_id: edit_area_id})
    }
},
{
	ready : function(){
		$('#entries').fit_resize({bottom: 0});
		$("#container").fit_resize({bottom: 0});

        
	},
    "#cancel_upload click" : function(){
        $("#Upload").slideUp();
        var rc = $("#entries").controller();
        rc.options.bottom = 0;
        rc.windowresize();
    }/*,
    "#doUpload click" : function(){
        
    }*/
});

})
