/**
 * @tag home
 * Handles the login page.  Keeps servers stored in a cookie
 */
$.Controller.extend('Fit.Controllers.Login',{onDocument: true},{
   /**
    * Gets all servers from the cookie model.  Places the first one in the form, and the rest as links.
    */
   ready: function(){
       var servers = Server.find("all");
   
       if(servers.length > 0){
           $('#url').val(servers[0].url);
           $('#port').val(servers[0].port);
           $('#username').val(servers[0].username);
           $('#password').val(servers[0].password);
           $('#remember').val(servers[0].remember);
       }
       if(servers.length > 1){
           var links = [];
           for(var i = 1; i < 3 && i < servers.length ; i++){
               links.push("<a href='javascript: void(0)' class='"+servers[i].identity()+"'>"+servers[i].url+"</a>");
               $('#examples').html( links.join(', ') );
           }
       }
       
   },
   /**
    * Make the port big
    * @param {Object} el
    */
   '#port focus': function(el){

       $("#url").animate({width: "170px"}, 500)
       $('#port').animate({width: "80px"}, 500);
       el.val( el.val() == '21' ? '' : el.val() );
   },
   /**
    * Return the port value
    * @param {Object} el
    */
   '#port blur': function(el){
       el.val( el.val() ? el.val()  : '21' );
   },
   /**
    * Make the url big
    * @param {Object} params
    */
   '#url focus': function(params){
       $("#url").animate({width: "230px"}, 500)
       $('#port').animate({width: "20px"}, 500);
   },
   /**
    * Save or update the instance.
    * @param {Object} el
    * @param {Object} ev
    */
   submit: function(el, ev){
       //ev.preventDefault();
       if(el[0].remember.value){ //we've checked remember me
           var fp =  el.formParams();
           var inst = Server.findOne(fp.url) 
           if( inst ){
               inst.attrs(fp);
           }else{
               inst = new Server(fp)
           }
           inst.save();
       }
   },
   /**
    * Clicks an example
    * @param {Object} el
    * @param {Object} ev
    */
   '#examples a click' : function(el, ev){
       var fp = $('#login').formParams(),
           model = el.model();
       
       el.animate({opacity: 0}, 500);
       $('#url').animate({color: '#FFFFFF'}, 500);
       $('username').animate({color: '#FFFFFF'}, 500);
       $('#password').animate({color: '#FFFFFF'}, 500);
       $('#port').animate({color: '#FFFFFF'}, 500, null, this.callback('switchftp', fp, el))
   },
   switchftp : function(fp, el){
       
       
       $('#url').css('color','#000000');
       $('#username').css('color','#000000');
       $('#password').css('color','#000000');
       $('#port').css('color','#000000');
       var model = el.model(), swapping;
       if(fp.url && (swapping = Server.store.findOne(fp.url) )  ){
           var a = document.createElement('a');
           a.href= "javascript: void(0)";
           a.className = swapping.identity();
           a.innerHTML = fp.url;
           el.replaceWith( a )
       }

       $('#url').val( model.url);
       $('#port').val( model.port);
       $('#username').val( model.username);
       $('#password').val( model.password);
       $('#remember')[0].checked = model.remember;
   }
});