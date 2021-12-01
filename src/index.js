// dependecies
const express = require('express'),
	app = express(),
	favicon = require('serve-favicon'),
	{ port } = require('./config.js'),
	{ logger } = require('./utils'),
	http = require('http'),
	session = require('express-session'),
	MemoryStore = require('memorystore'),
	passport = require('passport'),
	mStore = MemoryStore(session),
	bodyParser = require('body-parser'),
	flash = require('connect-flash'),
	compression = require('compression'),
	node_media_server = require('../RTMP');
require('./utils/passport')(passport);

// Run the RTMP server (for livestreaming)
node_media_server.run();

// normal configuration
app
	.use(compression())
	.use(bodyParser.urlencoded({ extended: true }))
	.use(bodyParser.json())
	.use(session({
		store:  new mStore({ checkPeriod: 86400000 }),
		secret: 'secret',
		resave: false,
		saveUninitialized: false,
	}))
	.use(passport.initialize())
	.use(passport.session())
	.use(function(req, res, next) {
		if (req.originalUrl !== '/favicon.ico') logger.connection(req, res);
		next();
	})
	.use(flash())
	.engine('html', require('ejs').renderFile)
	.set('view engine', 'ejs')
	.set('views', './src/views')
	.use(express.static('./src/public'))
	.use(favicon('./src/assets/favicon.ico'))
	.use('/', require('./routes'))
	.use('/video', require('./routes/videos'))
	.use('/user', require('./routes/user'))
	.use('/api', require('./routes/api'))
	.use('/channel', require('./routes/channel'))
	.use('/feed', require('./routes/feed'))
	.use(function(error, req, res, next) {
		logger.log(error.message, 'error');
		res.status(500);
		res.render('error-pages/500', {
			title:'500: Internal Server Error', error: error,
		});
	})
	.get('*', function(req, res) {
		res
			.status(404)
			.render('error-pages/404', {
				user: req.isAuthenticated() ? req.user : null,
			});
	});

// Create an HTTP service.
http
	.createServer(app)
	.listen(port, () => logger.log(`HTTP server online (port: ${port})`, 'ready'));
