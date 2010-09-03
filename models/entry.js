/**
 * @tag home, model
 * Enables FTP manipulations through JSON-RPC style requests.  The server takes an array of commands
 * like:
@codestart
[
    {
        method: "voidcmd",
        params: ["CWD /resources"]
    },
    {
        method: "list",
        result: "files"
    }
 ]
@codeend
Each command has 3 parts:
<ul>
    <li>method - the method to call on the ruby [http://ruby-doc.org/stdlib/libdoc/net/ftp/rdoc/classes/Net/FTP.html Net::FTP] library.</li>
    <li>params - an array of params to pass to the method</li>
    <li>result - an optional parameter that tells where to put the data returned by the command in the JSON object returned to the client.</li>
</ul>
This allows multiple requests to be issued at one time.
 */
$.Model.extend('Entry',
/* @static */
{
	/**
	 * Gets a list of files in a folder, and calls back with new instances of Entry.
	 * @param {Object} params has a path attribute
	 * @param {Function} success
	 * @param {Function} error
	 */
	findAll: function(params, success, error){
		this.run(this.dirCMDS(params.path), this.callback(['foundAll', success], params.path), error)
	},
    dirCMDS : function(path){
        return [
            {
                method: "voidcmd",
                params: ["CWD "+( path || "/")]
            },
            {
                method: "list",
                result: "files"
            }
         ]
    },
    /**
     * Posts a JSON list of commands to the server, calls back success
     * @param {Object} commands
     * @param {Function} success
     * @param {Function} error
     */
    run : function(commands, success, error){
        $.ajax({
            type: "post",
            url : "/ftp/run",
            data : {commands: $.toJSON(commands)},
            success: success,
            error: error,
            dataType: "json",
			fixture: "~findAll"
            });  
    },
    foundAll : function(dir, data){
        var raw = [];
        LASTDATA = data
        for(var i =0; i < data.files.length; i++){
            var fileStr = data.files[i];
            var datas = $.String.rsplit(fileStr, /\s+/), name = datas.slice(16).join("");
            if(name != "." && name != "..")
                raw.push({
                    name : name,
                    path: dir+(dir == "/" ? "" : "/")+name,
                    permissions : datas[0],
                    type : datas[0][0] == "d" ? "directory" : "file"
                })
        }

        var wrapped = this.wrapMany(raw.sort(this.sortFn))
        /*if(data.new_file){
            data.new_file = this.store.findOne( data.directory+(data.directory == "/" ? "" : "/")+data.new_file )
        }*/
        return [wrapped, data];
    },
    sortFn : function(a,b){
        if(a.type == "directory" && b.type != "directory")
            return -1;
        if(a.type != "directory" && b.type == "directory")
            return 1;
        var an =  a.name.toLowerCase(), bn =  b.name.toLowerCase();
        return an > bn ? 1 : -1;
    },
    /**
     * Opens a file's text
     * @param {Object} params
     * @param {Function} success
     * @param {Function} error
     */
	open : function(params, success, error){
		this.run([{method: "retrlines", 
                   params: ["RETR "+params.path], 
                   result: "text"}], success, error)
	},
	id: 'path',
    /**
     * Saves a files text
     * @param {Object} params an object with the path and text to be saved.
     * @param {Function} success
     * @param {Function} error
     */
    save : function(params, success, error){
        this.run([{method: "storlines", 
                   params: ["STOR "+params.path, params.text]
                  }], success, error)
    },
    createFile : function(path, success, error){
        this.save({path: path, text: ""}, success, error)
    },
    createDirectory : function(path, success, error){
        this.run([{method: "mkdir", 
                   params: [path]
                  }], success, error)
    },
    /**
     * Renames or moves a folder or file to another location.  This will also get the moved folder's 
     * files.
     * @param {Object} params
     * @param {Object} folder
     * @param {Object} success
     * @param {Object} error
     */
    rename : function(params, folder, success, error){
        this.run([
            {
                method: "rename",
                params: [params.from_path, params.to_path]
            }].concat(this.dirCMDS(folder)),
            success, error)
    },
    escapeIdentity : true
},
/* @prototype */
{
	open : function(success, error){
		if(this.type == "directory"){
			this.Class.findAll({path: this.path}, success, error)
		}else{
			this.Class.open({path: this.path}, success, error)
		}
	},
	/**
	 * returns the extension of a file
	 */
    extension : function(){
		return this.name.match(/\.\w+$/)[0]
	},
    /**
     * returns the file and extension
     */
	fileAndExtension : function(){
		return this.name.match(/[^\/]+$/)[0]
	},
    /**
     * Saves the text of an entry.
     * @param {Object} text
     * @param {Object} success
     * @param {Object} error
     */
    text : function(text, success, error){
        this.Class.save({path: this.path, text: text}, this.callback('updated',success), error)
    },
    updated : function(success, data){
        success(this)
    },
	/*destroy : function(success, error){
        this.Class.destroy(this, this.callback(["destroyed",success]), error);
    },
    newFile : function(success, error){
        this.Class.newFile({path: this.path} ,success ,error );
    },
    newFolder : function(success, error){
        this.Class.newFolder({path: this.path} ,success ,error );
    },*/
    rename : function(newName, success, error){
        var newPath = this.path.replace(/[^\/]+$/, newName)
        var folder = newPath.replace(/\/[^\/]+$/,"") || "/"
        this.Class.rename({from_path: this.path, to_path: newPath}, 
                          folder,
                          this.callback("renamed",success, {path: newPath, name: newName}) ,error );
    },
    move : function(newPath, success, error){
        var folder = newPath.replace(/\/[^\/]+$/,"") || "/"
        this.Class.rename({from_path: this.path, to_path: newPath}, 
                          folder,
                          this.callback("renamed",success, {path: newPath} ) ,error );
    },
    renamed : function(success, attrs, data){
        this.attrs(attrs);
        if(success)
            success(this, this.Class.foundAll(this.parentPath(),data)[0])
        this.publish("renamed");
    },
    /**
     * Gets all children
     */
    children : function(){
        var path = this.path;
        return  this.Class.store.find(function(e){
            return e.path.indexOf(path) ==0 && ( e.path.lastIndexOf("/") == path.length || 
                    (path == "/" && e.path.lastIndexOf("/") == 0) )
        }).sort(this.Class.sortFn);
    },
    /**
     * gets the parent folder's path
     */
    parentPath : function(){
        return this.path.replace(/\/[^\/]+$/,"") || "/"
    },
    /**
     * gets the parent folder from the store
     */
    parent : function(){
        return this.Class.store.findOne(this.path.substr(0,this.path.length - this.name.length - 1) || "/")
    },
    /**
     * gets the first file
     */
    firstFile : function(){
        var children = this.children();
        for(var i =0; i < children.length; i++){
            if(children[i].type != 'directory') return children[i];
        }
        return null;
    },
    pathSlash : function(){
        return this.path + (this.path == "/" ? "" : "/")
    },
    destroyCMD : function(){
        return {
            method: this.type == "directory" ? "rmdir"  :"delete",
            params: [this.path]
        }
    },
    /**
     * overwrite identity to tell it to escape
     */
    identity : function(){
        return this._super(true)
    }
})

/**
 * Allows you to create an ACL for a bunch of models.
 */
$.Class.extend("jQuery.ModelList",{
    init : function(instances){
        this.length = 0;
        Array.prototype.push.apply( this, instances );
    },
    push: [].push,
	sort: [].sort,
	splice: [].splice,
    slice : function(){
        Array.prototype.slice.apply( this, arguments )
    },
    match : function(property, value){
        return this.grep(function(inst){
            return inst[property] == value;
        })
    },
    each : function(callback, args){
        return jQuery.each( this, callback, args );
    },
    grep : function(callback, args){
        return jQuery.grep( this, callback, args );
    },
    map : function(callback, args){
        return jQuery.map( this, callback, args );
    },
    isOne : function(){
        return this.length == 1;
    },
    destroy : function(success, error){
		Entry.run(this.map(function(inst){return inst.destroyCMD()}),
                  success, 
                  error
        )
		//[inst1, inst2, inst3] - > [{method: 'destroy',params:[1]}, {method: 'destroy',params:[2]},..]
    }
})
//$(".entry").models().destroy(this.callback('allDestroyed'))
/**
 * @tag home, model
 * An ACL for [Entry entries].
 */
$.ModelList.extend("EntriesList",
/* @prototype */
{
    /**
     * @return {Boolean} true if all directories
     */
    isFolder : function(){
        return this.match('type','directory').length == 1
    },
    /**
     * @return {Boolean} true if all files
     */
    isFile : function(){
        return this.match('type','file').length == 1
    },
    /**
     * @param {Entry} entry a folder to move current entries to
     * @return {Boolean} true if we can move the selected entries into the folder
     */
	canMoveTo : function(entry){
		if(entry.type == "directory"){
			//make sure entry is not in anything we have
			for(var i =0; i < this.length; i++){
				if(entry.path.indexOf(this[i].path) == 0) return false;
			}
			return true;
		}
		return false;
	}
    
})