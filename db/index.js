var mongoose = require('mongoose');

var userSchema = require('../schemas/user_schema');
var sessionSchema = require('../schemas/session_schema');

exports.models;

exports.init = function (config) {
	var options = {
		user: config.DB_USER || undefined,
		pass: config.DB_PASS || undefined
	};
	mongoose.connect(config.DB_ADDR, options);

	registerModels();
};

function registerModels() {
	var models = {};
	models.User = mongoose.model('User', userSchema.UserSchema);
	models.Session = mongoose.model('Session', sessionSchema.SessionSchema);
	exports.models = models;
}