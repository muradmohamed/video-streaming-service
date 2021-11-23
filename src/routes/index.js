const express = require('express'),
	{ IncomingForm } = require('formidable'),
	{ GenVideoID } = require('../utils'),
	fs = require('fs'),
	{ readdir } = require('fs/promises'),
	{ spawn } = require('child_process'),
	router = express.Router();

// Home page
router.get('/', async (req, res) => {
	// render page
	res.render('index', {
		videos: await readdir(`${process.cwd()}/src/uploads/videos/`).then(dir => dir.filter(name => name.endsWith('.webm'))),
	});
});

router.get('/thumbnail', (req, res) => {
	if (fs.existsSync(`${process.cwd()}/src/uploads/thumbnails/${req.query.p}.png`)) {
		res.sendFile(`${process.cwd()}/src/uploads/thumbnails/${req.query.p}.png`);
	} else {
		res
			.status(404)
			.render('404-page');
	}

});
// Upload page
router.get('/upload', (req, res) => {
	res.render('upload');
});


router.post('/upload', async (req, res) => {
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

		const videoID = GenVideoID();

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
	});

	// log any errors that occur
	form.once('error', function(err) {
		console.log(err);
		res.redirect('/upload?error=Error occured');
	});

	// parse the incoming request containing the form data
	form.parse(req);
});

module.exports = router;
