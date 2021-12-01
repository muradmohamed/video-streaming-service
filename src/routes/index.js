const express = require('express'),
	{ ensureAuthenticated } = require('../utils'),
	{ fetchVideos } = require('../utils/database'),
	en = require('javascript-time-ago/locale/en.json'),
	TimeAgo = require('javascript-time-ago'),
	router = express.Router();
// Configure time format to use en-US
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

// Home page
router.get('/', async (req, res) => {
	// render page
	const videos = await fetchVideos();
	res.render('index', {
		user: req.isAuthenticated() ? req.user : null,
		videos, timeAgo,
	});
});

// Sign up page
router.get('/signup', (req, res) => {
	// Only access page if user isn't signed in
	if (req.isAuthenticated()) return res.redirect('/');
	res.render('navbar/signup');
});

// Login page
router.get('/login', (req, res) => {
	// Only access page if user isn't signed in
	if (req.isAuthenticated()) return res.redirect('/');
	res.render('navbar/login');
});

router.get('/livestream/:channelId', (req, res) => {
	const liveURL = `http://127.0.0.1:8888/live/${req.params.channelId}/index.m3u8`;
	res.render('live', {
		user: req.isAuthenticated() ? req.user : null,
		liveURL,
	});
});
// Upload page
router.get('/upload', ensureAuthenticated, (req, res) => {
	res.render('navbar/upload', {
		user: req.user,
	});
});


module.exports = router;
