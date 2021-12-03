const express = require('express'),
	{ ensureAuthenticated, time } = require('../utils'),
	{ fetchVideos } = require('../utils/database'),
	router = express.Router();

// Home page
router.get('/', async (req, res) => {
	// render page
	const videos = await fetchVideos();
	console.log(time);
	res.render('index', {
		user: req.isAuthenticated() ? req.user : null,
		videos, time,
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

router.post('/search', (req, res) => {
	res.redirect(`/results?search_query=${req.body.search}`);
});

router.get('/results', (req, res) => {
	res.render('navbar/search', {
		user: req.isAuthenticated() ? req.user : null,
		search: req.query.search_query,
	});
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
