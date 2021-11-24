const express = require('express'),
	router = express.Router(),
	fs = require('fs');

// get list of video
router.get('/', (req, res) => {
	if (fs.existsSync(process.cwd() + `/src/uploads/videos/${req.query.v}.webm`)) {
		res.render('video', {
			user: req.isAuthenticated() ? req.user : null,
			ID: req.query.v,
		});
	} else {
		res
			.status(404)
			.render('404-page');
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
