// dependecies
const express = require('express'),
	app = express(),
	favicon = require('serve-favicon'),
	{ port } = require('./config.js'),
	{ logger } = require('./utils'),
	http = require('http'),
	compression = require('compression');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
	const allUsers = await prisma.user.findMany();
	console.log(allUsers);
}

main()
	.catch((e) => {
		throw e;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});

// normal configuration
app
	.use(compression())
	.use(function(req, res, next) {
		if (req.originalUrl !== '/favicon.ico') logger.connection(req, res);
		next();
	})
	.engine('html', require('ejs').renderFile)
	.set('view engine', 'ejs')
	.set('views', './src/views')
	.use(express.static('./src/public'))
	.use(favicon('./src/assets/favicon.ico'))
	.use('/', require('./routes'))
	.use('/video', require('./routes/videos'))
// eslint-disable-next-line no-unused-vars
	.use(function(error, req, res, next) {
		logger.log(error.message, 'error');
		res.status(500);
		res.render('500-page');
	})
	.get('*', function(req, res) {
		res
			.status(404)
			.render('404-page');
	});

// Create an HTTP service.
http
	.createServer(app)
	.listen(port, () => logger.log(`HTTP server online (port: ${port})`, 'ready'));
