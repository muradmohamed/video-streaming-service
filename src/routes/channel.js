const express = require('express'),
	{ findChannel, getVideosForChannel } = require('../utils/database'),
	en = require('javascript-time-ago/locale/en.json'),
	TimeAgo = require('javascript-time-ago'),
	router = express.Router();
// Configure time format to use en-US
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

// channel page (mainly just used for re-direct & 404-channel page)
router.get('/', (req, res) => {
	if (req.isAuthenticated()) return res.redirect(`/channel/${req.user}`);
	res
		.status(404)
		.render('error-pages/404', {
			user: req.isAuthenticated() ? req.user : null,
		});
});

// Channel page
router.get('/:channelID', async (req, res) => {
	// Get channel that the user is looking at
	const channel = await findChannel({ id: req.params.channelID });
	const videos = await getVideosForChannel(req.params.channelID, 10);
	if (channel) {
		res.render('channel', {
			user: req.isAuthenticated() ? req.user : null,
			channel, videos,
			timeAgo,
		});
	} else {
		res
			.status(404)
			.render('error-pages/404-channel', {
				user: req.isAuthenticated() ? req.user : null,
			});
	}
});

module.exports = router;
