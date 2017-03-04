/**
 * To work with the canvas features we need to get a reference to its context.
 * @type  {Object}
 */
var editor = document.getElementById("overlayEditor"),
	context = editor.getContext("2d"),
	/** create/load image */
	image = $("<img/>", {
		src: "img/graffiti.png",
		load: function() {
			context.drawImage(this, 0, 0);
		}
	});