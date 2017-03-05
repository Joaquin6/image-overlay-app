"use strict";
const shortid = require("shortid");
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const express = require('express');
let router = express.Router();

// The tutorial page
router.get('/', (req, res, next) => {
	res.render('index');
});

router.post('/submit', (req, res, next) => {
	var data = req.body.toString('utf8').replace(/^data:image\/\w+;base64,/, "");
	var bitmap = new Buffer(data, 'base64');
	console.log("got the image bitmap", bitmap);
	imagemin.buffer(bitmap, {
		plugins: [
			imageminPngquant({
				quality: '0-100'
			})
		]
	}).then(file => {
		console.log("got the optimized bitmap", file);
		res.json({
			imagesource: file
		});
	}).catch(function(error) {
		console.log(error);
	});
});

module.exports = router;