var mongoose = require('mongoose');

var SessionSchema = exports.SessionSchema = new mongoose.Schema({
	_id: {type: String},
	session: {type: String},
	expires: {type: Date}
});
