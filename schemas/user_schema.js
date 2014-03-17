var mongoose = require('mongoose');

var schemautil = require('./util');

var UserSchema = exports.UserSchema = new mongoose.Schema({
	username: {type: String, required: true, unique: true},
	password: {type: String, required: true},
	salt: {type: String},

	roles: {
		type: mongoose.Schema.Types.Mixed,
		'default': schemautil.makeDefault({})
	},
	regions: {type: [String], 'default': schemautil.makeDefault([])},
	lang: {type: String},

	createdt: {type: Date, required: true, 'default': new Date},
	state: {type: String, required: true, 'default': 'active'},
	statedt: {type: Date},

	sid: {type: String}
});

UserSchema.index({username: 1}, {background: false});