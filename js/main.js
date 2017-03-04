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

/**
 * Toolbar functionality
 * We could just add a series of click handlers, one for each button that we wish to add but
 * it wouldn't be hugely efficient and wouldn't scale well. Normally, I add a single master
 * function that handles a click on any button and invokes the correct function.
 * @type  {Object}
 */
var tools = {
	/** Saving Images */
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
	},
	/**
	 * Rotation
	 * A common feature of image editors is the ability to rotate an element,
	 * and using built-in canvas functionality, it's pretty easy to implement this in our editor.
	 */
	rotate: function(conf) {
	    /** save current image before rotating */
	    $("<img/>", {
	        src: editor.toDataURL(),
	        load: function() {
	            /** rotate canvas */
	            context.clearRect(0, 0, editor.width, editor.height);
	            context.translate(conf.x, conf.y);
	            context.rotate(conf.r);
	            /** redraw saved image */
	            context.drawImage(this, 0, 0);
	        }
	    });
	},
	rotateL: function() {
	    var conf = {
	        x: 0,
	        y: editor.height,
	        r: -90 * Math.PI / 180
	    };
	    tools.rotate(conf);
	},
	rotateR: function() {
	    var conf = {
	        x: editor.width,
	        y: 0,
	        r: 90 * Math.PI / 180
	    };
	    tools.rotate(conf);
	}
};

$("#editorToolbar").children().click(function(e) {
    e.preventDefault();
    /** call the relevant function */
    tools[this.id].call(this);
});