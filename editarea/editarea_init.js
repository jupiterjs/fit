editAreaLoader.init({
	id : "EDITAREA_TEXTAREA"		// textarea id
	,syntax: "js"			// syntax to be uses for highgliting
	,start_highlight: true		// to display with highlight mode on start-up
	,allow_resize: 'no'
	,allow_toggle: false
	,save_callback: 'Fit.Controllers.Main.editAreaSaved'
	,EA_load_callback: "Fit.Controllers.Main.editAreaLoaded"
	,EA_file_close_callback: 'Fit.Controllers.Main.editAreaFileClosed'
	,toolbar: "save, search, go_to_line, fullscreen, undo, redo,  select_font, change_smooth_selection, highlight, reset_highlight, syntax_selection"
	,is_multi_files: true
	,syntax_selection_allow: 'c,cpp,python,xml,js,jst,html,css,php'
});