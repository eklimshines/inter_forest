var express = require('express');
var http = require('http');
var path = require('path');
var i18n = require('i18n');
var MongoStore = require('connect-mongo')(express);

var config = require('./config');
var db = require('./db');
var express_util = require('./utils/express_util');

var app = express();

(function initApplication(app) {
	db.init(config);
	console.log('db_init');
	i18n.configure({
		locales: ['en', 'ko'],
		directory: path.join(__dirname, 'locales')
	});

	// all environments
	app.set('port', config.SERVER_PORT);
	app.set('views', __dirname + '/views');
	app.set('view engine', 'jade');

	app.configure(function () {
		app.use(express.favicon());
		app.use(express.logger('dev'));
		app.use(i18n.init);

		app.use(express.bodyParser());
		app.use(express.cookieParser('zaiwan is wodhks'));
		app.use(express.methodOverride());

		app.use(express.static(path.join(__dirname, 'public')));

		app.use(express.session({
			key: 'wiki.sid',
			secret: config.SESSION_SECRET,
			cookie: {
				maxAge: 60 * 60 * 1000,
			},
			store: new MongoStore({
				host: config.DB_HOST,
				port: config.DB_PORT,
				db: config.DB_DB,
				username: config.DB_USER || undefined,
				password: config.DB_PASS || undefined,
				collection: config.SESSION_COLLECTION
			})
		}));

		app.use(function (req, res, next) {
			res.locals.require = require;
			res.locals.req = req;
			res.locals.session = req.session;

			res.locals.config = {
			};
			next();
		});

		app.use(app.router);
		app.use(express_util.errorHandler());
	});
	

	require('./controllers').delegate(app);

	http.createServer(app).listen(app.get('port'), function(){
	  console.log('Server listening on port ' + app.get('port'));
	});
}(app));