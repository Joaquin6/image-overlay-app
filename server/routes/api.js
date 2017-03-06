var recipe = require('./recipe');

module.exports = {
	route : function(app) {
		app.use('/recipe', recipe);
	}
};
