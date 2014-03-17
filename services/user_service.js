var models = require('../db').models;

var User = models.User;
var Session = models.Session;

exports.signIn = function (username, password, sessionId, callback) {
	console.log('test');
	User.findOne({username: username}, function (err, user) {
		if (err || !user) return callback('user not found', 403);
		if (password !== user.password) return callback('incorrect password', 403);
		if ('inactive' === user.state) return callback('not active user', 403);
		if (user.sid !== sessionId) {
			Session.findOne({_id:user.sid}, function (err, session) {

				user.sid = sessionId;
				user.save(function (_err) {
					if (_err) { return callback(_err); }

					if (!session) {
						return callback(null, user);
					} else {
						session.remove(function (__err) {
							if (__err) { return callback(__err); }

							return callback(null, user);
						});
					}
				});
			});
		} else {
			return callback(null, user);
		}
	});
};

exports.createUser = function (userInfo, callback) {
	var user = new User(userInfo);

	user.save(callback);
};