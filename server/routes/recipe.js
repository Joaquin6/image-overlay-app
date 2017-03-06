var Q = require("q");
var express = require('express');
var router = express.Router();

router.post('/', function(req, res) {
	console.log("Successfully Submitted Data");
	return res.status(200).send({
		message: "Successfully Submitted Data",
		data: req.body || {}
	});
});

module.exports = router;

