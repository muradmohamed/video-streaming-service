const express = require('express'),
	{ fetchChannelHistory, findChannel } = require('../utils/database'),
	fetch = require('node-fetch'),
	router = express.Router();

router.get('/history', async (req, res) => {
	let history = await fetchChannelHistory({ id: req.user.id }).then(user => user.history);
	history = history.reduce((acc, current) => {
		const x = acc.find(item => item.videoId === current.videoId);
		if (!x) {
			return acc.concat([current]);
		} else {
			return acc;
		}
	}, []);
	res.render('feeds/history', {
		user: req.isAuthenticated() ? req.user : null,
		history,
	});
});

router.get('/livestreams', async (req, res) => {
	const livestreams = await fetch('http://127.0.0.1:8888/api/streams').then(data => data.json());
	const users = await fetchLivestreamers(livestreams);
	res.render('feeds/lives', {
		user: req.isAuthenticated() ? req.user : null,
		lives: livestreams.live,
		users,
	});
});

module.exports = router;

async function fetchLivestreamers(livestreams) {
	return Promise.all(Object.keys(livestreams.live).map(async (id) => await findChannel({ stream_key: id })));
}
