const express = require('express'),
	router = express.Router(),
	{ ensureAuthenticated } = require('../utils'),
	{ getVideo, findChannel, likeVideo, getCountsForVideo, getLikesForVideo, dislikeVideo, viewVideo, createComment, fetchComments } = require('../utils/database'),
	en = require('javascript-time-ago/locale/en.json'),
	TimeAgo = require('javascript-time-ago'),
	fs = require('fs');

// get list of video
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');
router.get('/', async (req, res) => {
	if (fs.existsSync(process.cwd() + `/src/uploads/videos/${req.query.v}.webm`)) {
		// Fetch all data from database
		const video = await getVideo({ id: req.query.v }),
			owner = await findChannel({ id: video.ownerId }),
			videoData = await getCountsForVideo(req.query.v),
			comments = await fetchComments(req.query.v),
			likeUser = await getLikesForVideo(req.query.v);
		console.log(comments);
		// Display page
		res.render('video', {
			user: req.isAuthenticated() ? req.user : null,
			ID: req.query.v,
			video, owner, videoData, likeUser, comments,
			timeAgo,
		});
	} else {
		res
			.status(404)
			.render('404-page');
	}
});

router.post('/like/:videoID', ensureAuthenticated, async (req, res) => {
	try {
		const video = await getVideo({ id: req.params.videoID });
		await likeVideo({
			videoId: req.params.videoID,
			channelId: video.ownerId,
		});
		res.json({ success: 'Success' });
	} catch (e) {
		console.log(e);
		res.json({ error: 'error' });
	}
});

router.post('/dislike/:videoID', ensureAuthenticated, async (req, res) => {
	try {
		const video = await getVideo({ id: req.params.videoID });
		await dislikeVideo({
			videoId: req.params.videoID,
			channelId: video.ownerId,
		});
		res.json({ success: 'Success' });
	} catch (e) {
		console.log(e);
		res.json({ error: 'error' });
	}
});

router.post('/view/:videoID', ensureAuthenticated, async (req, res) => {
	try {
		const video = await getVideo({ id: req.params.videoID });
		await viewVideo({
			videoId: req.params.videoID,
			channelId: video.ownerId,
		});
		res.json({ success: 'Success' });
	} catch (e) {
		console.log(e);
		res.json({ error: 'error' });
	}
});

router.post('/comment/:videoID', ensureAuthenticated, async (req, res) => {
	const { content } = req.body;
	console.log({
		videoId: req.params.videoID,
		content: content,
		channelId: req.user,
	});
	try {
		await createComment({
			videoId: req.params.videoID,
			content: content,
			channelId: req.user,
		});
		res.json({ success: 'Success' });
	} catch (e) {
		console.log(e);
		res.json({ error: 'error' });
	}
});
// streaming route
router.get('/data/:id', (req, res) => {
	const videoPath = process.cwd() + `/src/uploads/videos/${req.params.id}.webm`,
		fileSize = fs.statSync(videoPath).size,
		videoRange = req.headers.range;

	if (videoRange) {
		const parts = videoRange.replace(/bytes=/, '').split('-'),
			start = parseInt(parts[0], 10),
			end = parts[1] ? parseInt(parts[1], 10)	: fileSize - 1,
			chunksize = (end - start) + 1,
			file = fs.createReadStream(videoPath, { start, end });

		res.writeHead(206, {
			'Content-Range': `bytes ${start}-${end}/${fileSize}`,
			'Accept-Ranges': 'bytes',
			'Content-Length': chunksize,
			'Content-Type': 'video/webm',
		});
		file.pipe(res);
	} else {
		res.writeHead(200, {
			'Content-Length': fileSize,
			'Content-Type': 'video/webm',
		});
		fs.createReadStream(videoPath).pipe(res);
	}
});

router.get('/video/:id/caption', (req, res) => {
	res.sendFile(`assets/captions/${req.params.id}.vtt`);
});

module.exports = router;
