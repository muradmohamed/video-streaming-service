const express = require('express'),
	fs = require('fs'),
	{ IncomingForm } = require('formidable'),
	{ GenVideoID, ensureAuthenticated } = require('../utils'),
	{ createVideo, findChannel, updateVideo } = require('../utils/database'),
	{ spawn } = require('child_process'),
	router = express.Router();

// get Thumbnail of video
router.get('/thumbnail', (req, res) => {
	if (fs.existsSync(`${process.cwd()}/src/uploads/thumbnails/${req.query.p}.png`)) {
		res.sendFile(`${process.cwd()}/src/uploads/thumbnails/${req.query.p}.png`);
	} else {
		res
			.status(404)
			.render('404-page');
	}
});

// Get avatar of channel
router.get('/avatar/:channelID', async (req, res) => {
	const path = `${process.cwd()}/src/uploads/avatars/${req.params.channelID}.png`;
	if (fs.existsSync(path)) {
		res.sendFile(path);
	} else {
		const channel = await findChannel({ id: req.params.channelID });
		if (!channel) {
			return res
				.status(404)
				.render('404-page');
		}
		res.redirect(`/img/${channel.name[0]}-icon-min.png`);
	}
});

// Upload video
router.post('/upload', ensureAuthenticated, async (req, res) => {
	const form = new IncomingForm({
		multiples: false,
		allowEmptyFiles: false,
		uploadDir: './src/uploads/temp',
		filter: function({ mimetype }) {
			// keep only images
			return mimetype && mimetype.includes('video');
		},
	});

	// File has been uploaded (create folders if neccessary)
	form.on('file', async function(field, file) {
		if (file.mimetype.split('/')[0] !== 'video') {
			return res
				.status(400)
				.json({ error: 'Not a video' });
		}

		try {
			const videoID = GenVideoID();
			res.json({
				id: videoID,
				title: file.originalFilename,
			});

			await createVideo({
				id: videoID,
				title: file.originalFilename,
				channelId: req.user.id,
				type: 'PUBLIC',
				attributes: '',
			});
			const args = [
				'-i', file._writeStream.path,
				'-c:v', 'libvpx',
				'-crf', '10',
				'-b:v', '1M',
				'-c:a', 'libvorbis',
				'-cpu-used', '-5',
				'-deadline', 'realtime',
				`${process.cwd()}/src/uploads/videos/${videoID}.webm`,
			];

			const proc = spawn('ffmpeg', args);

			proc.stdout.on('data', function(data) {
				console.log(data);
			});

			proc.stderr.setEncoding('utf8');
			proc.stderr.on('data', function(data) {
				console.log(data);
			});

			proc.on('close', function() {
				console.log('finished');
				// create thumbnail
				spawn('ffmpeg', ['-i', `${process.cwd()}/src/uploads/videos/${videoID}.webm`, '-ss', '00:00:01.000', '-vframes', '1', `${process.cwd()}/src/uploads/thumbnails/${videoID}.png`]);
			});
		} catch (e) {
			console.log(e);
		}
	});

	// log any errors that occur
	form.once('error', function(err) {
		console.log(err);
		res.redirect('/upload?error=Error occured');
	});

	// parse the incoming request containing the form data
	form.parse(req);
});

router.post('/upload/update/:videoID', ensureAuthenticated, async (req, res) => {
	const { title, description } = req.body;
	console.log(req.body);
	return;
	try {
		await updateVideo({
			id: req.params.videoID,
			title, description,
		});
		res.json({ success: 'complete' });
	} catch (e) {
		console.log(e);
		res.json({ error: e.message });
	}
});

// // NOTE: Should add 'caching' so thumbnail only updates every x minutes
router.get('/lives/thumbnail/:streamKey', (req, res) => {
	const stream_key = req.params.streamKey,
		path = `${process.cwd()}/server/thumbnails/${stream_key}.png`;
	// Only generate a thumbnail if a thumbnail doesn't exist or was created within the last 5 minutes
	if (!(fs.existsSync(path) && (new Date() - fs.statSync(path).birthtime) <= 5 * 60 * 1000)) {
		res.sendFile(`${process.cwd()}/server/thumbnails/${stream_key}.png`);
	} else {
		console.log('generating new thumbnail');
		const args = [
			'-y',
			'-i', 'http://127.0.0.1:8888/live/' + stream_key + '/index.m3u8',
			'-ss', '00:00:01',
			'-vframes', '1',
			'-vf', 'scale=-2:300',
			`${process.cwd()}/server/thumbnails/${stream_key}.png`,
		];

		// Create thumbnail and send back to user
		const proc = spawn('ffmpeg', args);

		proc.on('close', function() {
			res.sendFile(`${process.cwd()}/server/thumbnails/${stream_key}.png`);
		});
	}
});


module.exports = router;
