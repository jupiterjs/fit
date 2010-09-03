/**
 * @tag home
 * Creates a hierarchial list of entries
 * 
 */
$.Controller.extend("Fit.Controllers.Entries",{onDocument: true},{
    /**
     * Finds the element for an entry by escaping for jQuery correctly.
     * @param {Entry} entry
     */
    getEl : function(entry){
        var r = /[#;\&,\.\+\*~':"!\^\$\[\]\(\)=>\|\/%]/g
        return $("#entries").find("."+(
           typeof entry == "string" ? "entry_"+ encodeURIComponent( entry ) :  entry.identity() ).replace(r, function(s){return "\\"+s}));
    },
    /**
     * Loads the root entries.
     */
    ready : function(){
        //get context menu ready

        $(this.view('contextmenu',{})).attr('id','contextmenu').fit_entry_contextmenu({top: 15, left: 15}, true)
        
        var e = new Entry({path: "/", type: "directory"})
        var el = this.getEl(e);
        e.name = el.html();
        e.open(this.callback('show',  el));
        $("#entries").disableSelection().fit_selectable(true);
    },
    /**
     * Adds a list of entries to the dom.  This cheats a little by checking the response data
     * to see if we added a new file or folder
     * @param {Object} openel
     * @param {Object} entries
     * @param {Object} data
     */
    show : function(openel, entries, data, append){
        var container = openel.next();
        if(container.children().length){
            openel.html(openel.model().name)
            if(append){
                if(entries[0].type == 'directory')
                    container.prepend(this.view("show",entries))
                else
                    container.append(this.view("show",entries))
            }else{
                container.html(this.view("show",entries))
            }
            
            if(data.new_file)
                this.getEl(data.new_file)[0].focus();
        }else{
            var self = this;
            container.hide().html("").append(this.view("show",entries)).slideDown(function(){
                if(data.new_file)
                    self.getEl(data.new_file)[0].focus();
            });
        }
        container.removeClass('creating')
        openel.removeClass('creating')
        return entries;
    },
    /**
     * Fixes a problem with FF scrolling.
     * @param {Object} el
     * @param {Object} ev
     */
    ".selectable keypress" : function(el, ev){
        //only if we aren't scrollable
        if((ev.keyCode == 40 || ev.keyCode == 38)) 
            ev.preventDefault();
        //make sure we can scroll later
    },
    /**
     * 
     * @param {Object} entry
     * @param {Object} openOnly
     * @param {Object} callback
     */
    openFolder : function(entry, openOnly, callback){
        var el = this.getEl(entry), n = el.next()
        if(n.children().length ){
            n[openOnly ? "show" : 'toggle']();
            if(callback) callback();
        }
        else{
            entry.open(this.callback(['show',callback], el));
            n.show().html("loading ...")
        }
    },
    /**
     * Opens an entry
     * @param {Object} el
     * @param {Object} ev
     */
    ".entry dblclick" : function(el, ev){
        ev.preventDefault()
        var entry = el.model();
        if(entry.type == "directory"){
            this.openFolder(entry)
        }else{
            //a file
            el.html("opening ...")
            entry.open(this.callback('opened', entry, el))
        }
    },
    opened : function(entry, el, data){
        el.html(entry.name)
        var new_file= {id: entry.path, 
                       text: data.text, 
                       syntax: entry.extension().toLowerCase(), 
                       title:  entry.fileAndExtension() };
        editAreaLoader.openFile('EDITAREA_TEXTAREA', new_file);
    },
    selected : [],
    //".entry mousedown" : function(el, ev){ev.preventDefault()},
    /**
     * Saves an entry.
     * @param {Object} called
     * @param {Object} data
     */
    "editarea.save subscribe" : function(called, data){
        var entry = Entry.store.findOne(data.path);
        var els = this.getEl(entry).html("saving ...")
        entry.text(data.text, this.callback("saved", els, data.edit_area_id) );
        
    },
    saved : function(els, edit_area_id, entry){
        els.html(entry.name);
        editAreaLoader.setFileEditedMode(edit_area_id, entry.path, false)
    },
    fileClosed : function(f){
        return f.compare_edited_text == f.text || confirm("The file hasn't been saved."+
            "Are you sure you want to close the file?")
    },
    /**
     * Opens the context menu
     * @param {Object} el
     * @param {Object} ev
     */
    ".entry contextmenu" : function(el, ev){
        $("#entries").selectable_controller()[0].select(el, true)
        var cmenu = $("#contextmenu").controller();
        var list = new EntriesList( el.models() );
        this.contextUpload(list);
        cmenu.show( list, this, ev );
        cmenu.element.find('.download').attr("href", "/ftp/download"+el.models()[0].path  )
        ev.preventDefault(); 
    },
    /**
     * Sets up the drag to scroll the window, and revert when done
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} drag
     */
    ".entry draginit" : function(el, ev, drag){
        $("#entries").selectable_controller()[0].select(el, true);
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
    },
    ".entry dropout" : function(el, ev, drop, drag){
        el.removeClass('canmove')
    },
    ".entry dropend" : function(el){
        el.removeClass('canmove')
    },
    /**
     * Create a new file
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} list
     */
    contextNewFile : function(el, ev, list){
        this.makeNew('file', el, ev, list[0])
    },
    /**
     * Create a new directory
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} list
     */
    contextNewFolder : function(el, ev, list){
        this.makeNew('directory', el, ev, list[0])
    },
    makeNew : function(type, el, ev, entry){
        var el = this.getEl(entry);
        this.openFolder(entry, true, this.callback('putNew', type, entry))
    },
    putNew : function(type,parentEntry){
        var entry = parentEntry.firstFile();
        var nf = $(this.view('new'+$.String.capitalize(type)))
        if(type == "directory"){
            this.getEl(parentEntry).next().prepend(nf)
        }else if(entry){
            this.getEl(entry).before(nf)
        }else{
            this.getEl(parentEntry).next().append(nf)
        }
        $("#entries").enableSelection();
        nf.find('input').select();
    },
    "input.newEntry blur" : function(el, ev){
        el.closest('.entry').remove()
        $("#entries").disableSelection()
    },
    getFolderEntry : function(el){
        return el.parent().prev().model()
    },
    /**
     * Creates a new entry when the new entry form is submitted
     * @param {Object} el
     * @param {Object} ev
     */
    "form.newEntry submit" : function(el, ev){
        ev.preventDefault();
        ev.stopAll();
        var entEl = el.closest(".entry").html("creating ..."),
            name = el.find('input').val(),
            folder = this.getFolderEntry(entEl),
            path = folder.pathSlash()+name,
            type = entEl.hasClass('directory') ? 'directory' : 'file';
        
        Entry["create"+$.String.capitalize(type)](path, 
                         this.callback("created", entEl, {name: name, path: path, type: type}, folder))
        
    },
    created : function(el, d, folder){
        el.remove();
        var e = new Entry(d);
        this.show(this.getEl(folder), [e], {new_file: e} , true)
    },
    /*contextNewFolder : function(el, ev, list){
        var el = this.getEl(list[0])
        el.html('creating ...').next().addClass('creating')
        
        list[0].newFolder( this.callback('show', el)  );
    },*/
    /**
     * Deletes an entry
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} list
     */
    contextDelete : function(el, ev, list){
         var el = this.getEl(list[0])
         if(confirm("Are you sure you want to delete?")){
             el.html("removing ...").addClass("removing")
             list.destroy( this.callback('remove', el), this.callback('deleteError', el)  );
         }
    },
    deleteError : function(el, xhr){
        alert(  eval("("+xhr.responseText+")").error  )
        el.html( el.model().fileAndExtension() );
    },
    remove : function(el, entries, data){
        el.slideUp(function(){
            el.remove()
        })
    },
    /**
     * renames an entry
     * @param {Object} el
     * @param {Object} ev
     * @param {Object} list
     */
    contextRename : function(el, ev, list){
        var el = this.getEl(list[0])
        el.html(this.view('rename',list[0]));
        $("#entries").enableSelection();
        el.find('input').select();
    },
    "input.renameEntry blur" : function(el, ev){
        var e = el.closest(".entry");
        e.html(e.model().name)
        $("#entries").disableSelection()
    },
    "form.renameEntry submit" : function(el, ev){
        ev.preventDefault();
        ev.stopAll();
        $("#entries").disableSelection()
        var ent = el.closest(".entry"), model = ent.model();
        model.rename(el.find('input').val(), this.callback('renamed', ent, model.path))
    },
    "renamed" : function(el, oldPath, entry){
        el.html(entry.name).removeClass("entry_"+oldPath).addClass(entry.identity())[0].focus();
        editAreaLoader.getRenameFile('EDITAREA_TEXTAREA', oldPath, entry.path, entry.name);
    },
    ".entry input mousedown" : function(el, ev){
        ev.stopDelegation();
		ev.stopPropagation(); 
    },
    /**
     * Uploads an entry
     * @param {Object} list
     */
    contextUpload : function(list){
        if(!list.isFolder()) return;
        UPLOADPATH = list[0].path;
        this.uploading = list[0]
        this.openFolder(list[0], true)
        $("#upload_form_folder_name").text(list[0].name)
    },
    setSettings : function(){
        
    },
    contextUploadSelect : function(event, queueID, fileObj, list){
        var entry = new Entry({name: fileObj.name,
                              path: this.uploading.path+"/"+fileObj.name,
                              uploading: true,
                              queueID: queueID,
                              type: "file"});
        this.show(this.getEl(this.uploading), [entry], {new_file: entry} , true)
    },
    /**
     * shows the percentage of the upload
     * @param {Object} ev
     * @param {Object} queueID
     * @param {Object} fileObj
     * @param {Object} data
     */
    contextUploadProgress : function(ev,queueID, fileObj, data ){

        $("#"+queueID).find(".percent").html(data.percentage+"%")
    },
    /**
     * removes the upload percentage
     * @param {Object} ev
     * @param {Object} queueID
     * @param {Object} fileObj
     * @param {Object} data
     */
    contextUploadComplete : function(ev,queueID, fileObj, data){

        $("#"+queueID).find(".percent").fadeTo("slow", 0, function(){
            $(this).remove();
        });
    }
})



jQuery.fn.extend({ 
        disableSelection : function() { 
                this.each(function() { 
                        this.onselectstart = function() { return false; }; 
                        this.unselectable = "on"; 
                        jQuery(this).css('-moz-user-select', 'none'); 
                }); 
                return this;
        },
        enableSelection : function() { 
                this.each(function() { 
                        this.onselectstart = function() {}; 
                        this.unselectable = "off"; 
                        jQuery(this).css('-moz-user-select', ''); 
                }); 
                return this;
        }
}); 
