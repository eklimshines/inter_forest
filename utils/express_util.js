exports.errorHandler = function () {
	return function (reason, req, res, next) {
		if (!Array.isArray(reason)) {
			reason = [reason];
		}
		reason.forEach(function (reason) {
			if (reason instanceof Error) {
				console.error(reason.stack || reason);
			} else {
				console.error(reason);
			}
		});
		reason = reason.join('\n\n');

		if (req.xhr) {
			res.send(500, {result: false, reason: reason});
		} else {
			res.render('error', {reason: reason});
		}
	};
};

exports.responseHelpers = function () {
	return function (req, res, next) {
		res.ok = function (body) {
			if (!body) body = {};
			body.result = true;
			return res.send(body);
		};

		next();
	};
};

exports.sessionChecker = function () {
	return function (req, res, next) {
		var path = req.path;
		if (['/signin', '/user/signup'].indexOf(path) >= 0) return next();
		if (req.session && req.session.user) return next();

		var redirectUrl = '/signin';
		if (req.url && req.url !== '/') {
			redirectUrl += '?redirect=' + encodeURIComponent(req.url);
		}
		res.redirect(redirectUrl);
	};
};

exports.requirePermission = function (role, level) {
	return function (req, res, next) {
		var user = req.session.user;
		if (!user) {
			return res.redirect('/signin');
		}

		var roles = Object.keys(user.roles);
		var hasPermission = roles.some(function (r) {
			if (r === role && (!level || (level && user.roles[r] <= level))) {
				return true;
			}
		});
		if (!hasPermission) {
			return next('permission denied', 403);
		}

		next();
	};
};

exports.requireAdminPermission = function (level) {
	return exports.requirePermission('ADMIN', level);
};

exports.paginationHelper = function () {
	return function (req, res, next) {
		var page = req.query.page ? parseInt(req.query.page, 10) : 1;
		var perPage = req.query.perPage ? parseInt(req.query.perPage, 10) : 20;
		var sortField = req.query.sort;
		var sortOrder = (req.query.order === '1' ? 1 : -1);

		var sort;
		if (sortField) {
			sort = {};
			sort[sortField] = sortOrder;
		}

		var pagination = {
			page: page,
			perPage: perPage,
			skip: Math.max(0, page - 1) * perPage
		};
		if (sort) {
			pagination.sort = sort;
			pagination.order = sortOrder;
		}
		req.pagination = pagination;

		next();
	};
};
