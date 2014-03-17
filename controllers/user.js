var userService = require('../services/user_service');

exports.delegate = function (app) {
	app.get('/signin', signIn);
	app.post('/signin', postSignIn);

	app.get('/signup', signUp);
	app.post('/signup', postSignUp);

	app.get('/signout', signOut);
};

var signIn = function (req, res, handleError) {
	if (req.session.user) {
		return handleError('already signed');
	}
	res.render('user/signin');
};

var postSignIn = function (req, res, handleError) {
	var username = req.body.username;
	var password = req.body.password;

	if (!username && username.length <= 0) {
		return handleError('username is not valid');
	}
	if (!password && password.length <= 0) {
		return handleError('password is not valid');
	}

	userService.signIn(username, password, req.sessionID, function (err, user) {
		if (err) return handleError(err);

		req.session.user = user;
		req.session.save(function (err) {
			if (err) return handleError(err);

			return res.redirect('/');
		});
	});
};

var signUp = function (req, res, handleError) {
	res.render('user/signup');
};

var postSignUp = function (req, res, handleError) {
	var username = req.body.username;
	var password = req.body.password;

	if (!username && username.length <= 0) {
		return handleError('username is not valid');
	}
	if (!password && password.length <= 0) {
		return handleError('password is not valid');
	}

	var userInfo = {
		username: username,
		password: password
	};

	userService.createUser(userInfo, function (err) {
		if (err) return handleError(err);

		return res.redirect('/');
	});
};

var signOut = function (req, res, handleError) {
	req.session.user = null;
	req.session.save(function (err) {
		if (err) return handleError(err);

		res.redirect('/');
	});
}