
steal.plugins('jquery/controller',
'jquery/event/drop',
'jquery/model',
'jquery/view/ejs',
'jquery/event/drag/scroll',
'jquery/event/hover',
'jquery/lang/json',

'jquery/dom/fixture'
)
.then('fixtures/findAll')

.css('fit','resources/uploadify')

.resources('edit_area/edit_area_loader',"editarea_init",'swfobject',"jquery.uploadify.v2.1.0")



.models('entry')
.controllers('entries','main','resize','position','contextmenu','selectable','entry_contextmenu').then(
function(){
	$("#EDITAREA_TEXTAREA").val("")
})



	 