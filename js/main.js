/**
 * To work with the canvas features we need to get a reference to its context.
 * @type  {Object}
 */
var editor = document.getElementById("overlayEditor"),
	context = editor.getContext("2d"),
	/** create/load image */
	image = $("<img/>", {
		src: "images/graffiti.png",
		load: function() {
			context.drawImage(this, 0, 0);
		}
	});

/** toolbar functions  */
var tools = {
	save: function() {
	    var saveDialog = $("<div>").appendTo("body");
	    $("<img/>", {
	        src: editor.toDataURL()
	    }).appendTo(saveDialog);
	    saveDialog.dialog({
	        resizable: false,
	        modal: true,
	        title: "Right-click and choose 'Save Image As'",
	        width: editor.width + 35
	    });
	}
};

$("#editorToolbar").children().click(function(e) {
    e.preventDefault();
    /** call the relevant function */
    tools[this.id].call(this);
});