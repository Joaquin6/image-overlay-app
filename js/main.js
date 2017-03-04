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
	},
	/**
	 * Resizing Images
	 * This is the most complex interaction,
	 * and the function required to do it is quite large,
	 * even though resizing the canvas itself is quite trivial
	 */
	resize: function() {
	    var coords = $(editor).offset(),
	        resizer = $("<div>", {
	            id: "resizer"
	        }).css({
	            position: "absolute",
	            left: coords.left,
	            top: coords.top,
	            width: editor.width - 1,
	            height: editor.height - 1
	        }).appendTo("body");

	        var resizeWidth = null,
	            resizeHeight = null,
	            xpos = editor.offsetLeft + 5,
	            ypos = editor.offsetTop + 5;

	        resizer.resizable({
	            aspectRatio: true,
	            maxWidth: editor.width - 1,
	            maxHeight: editor.height - 1,
	            resize: function(e, ui) {
	                resizeWidth = Math.round(ui.size.width);
	                resizeHeight = Math.round(ui.size.height);
	                /** tooltip to show new size */
	                var string = "New width: " + resizeWidth + "px,<br />new height: " + resizeHeight + "px";
	                if ($("#tip").length) {
	                    $("#tip").html(string);
	                } else {
	                    var tip = $("<p></p>", {
	                        id: "tip",
	                        html: string
	                    }).css({
	                        left: xpos,
	                        top: ypos
	                    }).appendTo("body");
	                }
	            },
	            stop: function(e, ui) {
	                /** confirm resize, then do it */
	                var confirmDialog = $("<div></div>", {
	                    html: "Image will be resized to " + resizeWidth + "px wide, and " + resizeHeight + "px high.<br />Proceed?"
	                });
	                /** init confirm dialog */
	                confirmDialog.dialog({
	                    resizable: false,
	                    modal: true,
	                    title: "Confirm resize?",
	                    buttons: {
	                        Cancel: function() {
	                            /** tidy up */
	                            $(this).dialog("close");
	                            resizer.remove();
	                            $("#tip").remove();
	                        },
	                    Yes: function() {
	                        /** tidy up */
	                        $(this).dialog("close");
	                        resizer.remove();
	                        $("#tip").remove();
	                        $("<img/>", {
	                            src: editor.toDataURL(),
	                            load: function() {
	                                /** remove old image */
	                                context.clearRect(0, 0, editor.width, editor.height);
	                                /** resize canvas */
	                                editor.width = resizeWidth;
	                                editor.height = resizeHeight;
	                                /** redraw saved image */
	                                context.drawImage(this, 0, 0, resizeWidth, resizeHeight);
	                            }
	                        });
	                    }
	                }
	            });
	        }
	    });
	},
	/** RGB Modification */
	greyscale: function() {
	    /** get image data */
	    var imgData = context.getImageData(0, 0, editor.width, editor.height),
	        pxData = imgData.data,
	        length = pxData.length;
	    for(var x = 0; x < length; x+=4) {
	        /** convert to grayscale */
	        var r = pxData[x],
	            g = pxData[x + 1],
	            b = pxData[x + 2],
	            grey = r * .3 + g * .59 + b * .11;
	        pxData[x] = grey;
	        pxData[x + 1] = grey;
	        pxData[x + 2] = grey;
	    }
	    /** paint grayscale image back */
	    context.putImageData(imgData, 0, 0);
	}
};

$("#editorToolbar").children().click(function(e) {
    e.preventDefault();
    /** call the relevant function */
    tools[this.id].call(this);
});