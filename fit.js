
steal.plugins('jquery/controller',
'jquery/event/drop',
'jquery/model',
'jquery/view/ejs',
'jquery/event/drag/scroll',
'jquery/event/hover',
'jquery/lang/json'
)
.plugins('fit/editarea')
//.then('fixtures/findAll')

.css('fit','resources/uploadify')

.resources('swfobject',"jquery.uploadify.v2.1.0")

.models('entry')
.controllers('entries','main',
'resize',

'position','contextmenu','selectable','entry_contextmenu').then(
function(){
	$("#EDITAREA_TEXTAREA").val("")
})



	 