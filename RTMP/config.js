const config = {
	server: {
		secret: 'kjVkuti2xAyF3JGCzSZTk0YWM5JhI9mgQW4rytXc',
	},
	rtmp_server: {
		rtmp: {
			port: 1935,
			chunk_size: 60000,
			gop_cache: true,
			ping: 60,
			ping_timeout: 30,
		},
		http: {
			port: 8888,
			mediaroot: './server/media',
			allow_origin: '*',
		},
		trans: {
			ffmpeg: 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
			tasks: [
				{
					app: 'live',
					mp4: true,
					mp4Flags: '[movflags=frag_keyframe+empty_moov]',
				},
			],
		},
	},
};

module.exports = config;
