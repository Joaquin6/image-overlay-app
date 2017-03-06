/**
 * Canvas Stage Setup
 * let's think our stage virtual size will be 1000x1000px
 * but the real size will be different to fit user's page
 * so the stage will be 100% visible on any device
 */
var stageWidth = 1000;
var stageHeight = 750;
var stage = new Konva.Stage({
	container: 'editorOverlayContainer',
	width: stageWidth,
	height: stageHeight
});

function fitStageIntoParentContainer() {
	var sidebar = document.querySelector('#sidebar');
    var container = document.querySelector('#stage-parent');
    /** now we need to fit stage into parent */
    var containerWidth = container.offsetWidth;
    /** to do this we need to scale the stage */
    var scale = containerWidth / stageWidth;
    stage.width(stageWidth * scale);
    stage.height(stageHeight * scale);
    stage.scale({ x: scale, y: scale });
    stage.draw();
    /** Maintain the sidebar height */
    $(sidebar).height(stage.getHeight());
    refreshScrollspy();
}

fitStageIntoParentContainer();
/** adapt the stage on any window resize */
window.addEventListener('resize', fitStageIntoParentContainer);

var image;
var editor = layer = new Konva.Layer();
var imageObj = new Image();
imageObj.onload = function() {
	var imgWidth = this.naturalWidth;
	var imgHeight = this.naturalHeight;

	/** create/load image */
	image = new Konva.Image({
		x: 0,
		y: 0,
		image: imageObj,
		width: imgWidth,
		height: imgHeight,
		draggable: true
	});

	/** add the shape to the layer */
	layer.add(image);
	/** add the layer to the stage */
	stage.add(layer);
};
imageObj.src = 'images/graffiti.png';
var context = editor.getContext("2d");
var editorLogs = $("#editorInfo");

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
	    var dataURL = stage.toDataURL();
        window.open(dataURL);
	},
	/**
	 * Rotation
	 * A common feature of image editors is the ability to rotate an element,
	 * and using built-in canvas functionality, it's pretty easy to implement this in our editor.
	 */
	rotate: function(conf, node) {
		logDetails(node);
		editor.clear();

		/** rotate canvas */
		context.clearRect(0, 0, editor.getWidth(), editor.getHeight());
        context.translate(conf.x, conf.y);
        context.rotate(conf.r);
        /** redraw saved image */
        context.drawImage(node.image(), 0, 0);
	},
	rotateL: function() {
		console.log("\nRotate Left");
	    var conf = {
	        x: 0,
	        y: editor.getHeight(),
	        r: -90 * Math.PI / 180
	    };
	    if (!editor.children)
	    	return;
	    var node = editor.children[0];
	    tools.rotate(conf, node);
	},
	rotateR: function() {
		console.log("\nRotate Right");
	    var conf = {
	        x: editor.getWidth(),
	        y: 0,
	        r: 90 * Math.PI / 180
	    };
	    if (!editor.children)
	    	return;
	    var node = editor.children[0];
	    tools.rotate(conf, node);
	},
	/**
	 * Resizing Images
	 * This is the most complex interaction,
	 * and the function required to do it is quite large,
	 * even though resizing the canvas itself is quite trivial
	 */
	resize: function() {
	    var coords = $(editor).offset();
	    var resizer = $("<div>", {
            id: "resizer"
        }).css({
            position: "absolute",
            left: coords.left,
            top: coords.top,
            width: editor.getWidth() - 1,
            height: editor.getHeight() - 1
        }).appendTo("body");

        var resizeWidth = null,
            resizeHeight = null,
            xpos = editor.offsetLeft + 5,
            ypos = editor.offsetTop + 5;

        resizer.resizable({
            aspectRatio: true,
            maxWidth: editor.getWidth() - 1,
            maxHeight: editor.getHeight() - 1,
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
	                                context.clearRect(0, 0, editor.getWidth(), editor.getHeight());
	                                /** resize canvas */
	                                editor.getWidth() = resizeWidth;
	                                editor.getHeight() = resizeHeight;
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
	imageinfo: function() {
		logDetails(editor.children[0]);
	},
	canvasinfo: function() {
		logDetails(stage);
	}
};

$("#editorToolbar").children().click(function(e) {
    e.preventDefault();
    /** call the relevant function */
    tools[this.id].call(this);
});

function logDetails(node) {
	var count = getAlertCount();
	if (count > 3)
		removeAlertLog();

	var attr = node.getAttrs();
	var img = null;

	var log = "Log Results";
	if (attr.image) {
		log += "\nImage Node: true";
		img = attr.image;
		// log += "\nImage Src: " + img.src;
	} else
		log += "\nImage Node: false";
	if (attr.width)
		log += "\n\tWidth: " + attr.width;
	if (attr.height)
		log += "\n\tHeight: " + attr.height;
	if (attr.rotation)
		log += "\n\tRotation: " + attr.rotation;
	if (attr.draggable)
		log += "\n\tDraggable: " + attr.draggable;

	if (attr.x && attr.y) {
		log += "\nCoordinates";
		log += "\n\tX: " + attr.x;
		log += "\n\tY: " + attr.y;
	}

	if (attr.scaleX && attr.scaleY) {
		log += "\nScales";
		log += "\n\tX: " + attr.scaleX;
		log += "\n\tY: " + attr.scaleY;
	}

	console.log(log);
	addAlertLog(log);

	console.log("\nNode Attributes");
	console.log(attr);

	if (node.getContext) {
		var ctx = node.getContext();
		console.log("\nNode Context");
		console.log(ctx);
	}
}

function addAlertLog(log) {
	var timestampLog = $("<p/>", {
		style: "font-size: 12px;"
	}).text((new Date()).toLocaleString());
	var alertLog = $("<p/>").text(log);
    var dismisBtn = $("<button/>", {
		class: "close",
        type: "button",
        'data-dismiss': "alert",
        'aria-label': "Close"
    }).append('<span aria-hidden="true">×</span>');
    var alertContainer = $("<div/>", {
    	id: "alertLog-" + getAlertCount(),
		class: "alert alert-danger alert-dismissible fade in",
        role: "alert"
    }).append(dismisBtn).append(timestampLog).append(alertLog);
    alertContainer.appendTo(editorLogs);
    editAlertCount(true);
    refreshScrollspy();
}

function removeAlertLog() {
	var alerts = editorLogs.find("div[id^='alertLog-']");
	var alert = alerts[0];
	$(alert).alert('close');
	editAlertCount();
}

function getAlertCount() {
	var count = editorLogs.data("alertcount");
	return parseInt(count);
}

function editAlertCount(add) {
	var count = getAlertCount();
	if (add)
		count++;
	else
		count--;
	editorLogs.data("alertcount", count);
}

function refreshScrollspy() {
	$('[data-spy="scroll"]').each(function () {
		var $spy = $(this).scrollspy('refresh');
	});
}