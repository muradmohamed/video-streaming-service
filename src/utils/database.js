const { PrismaClient } = require('@prisma/client');

const client = new PrismaClient({ errorFormat: 'pretty',
	log: [
		{ level: 'info', emit: 'event' },
		{ level: 'warn', emit: 'event' },
		{ level: 'error', emit: 'event' },
	] });

module.exports.createChannel = (data) => {
	return client.channel.create({
		data: {
			email: data.email,
			name: data.name,
			password: data.password,
		},
	});
};

module.exports.findChannel = (data) => {
	return client.channel.findUnique({ where: { email: data.email } });
};

module.exports.createVideo = (data) => {
	return client.video.create({
		data: {
			title: data.title,
			owner: {
				connect: {
					id: data.channelId,
				},
			},
		},
	});
};


module.exports.viewVideo = (data) => {
	return client.videoView.create({
		data: {
			videoId: data.videoId,
			channelId: data.channelId,
		},
	});
};

module.exports.likeVideo = (data) => {
	return client.videoRating.upsert({
		where: {
			id: {
				videoId: data.videoId,
				channelId: data.channelId,
			},
		},
		create: {
			type: 'LIKE',
			videoId: data.videoId,
			channelId: data.channelId,
		},
		update: {
			type: 'LIKE',
		},
	});
};

module.exports.dislikeVideo = (data) => {
	return client.videoRating.upsert({
		where: {
			id: {
				videoId: data.videoId,
				channelId: data.channelId,
			},
		},
		create: {
			type: 'DISLIKE',
			videoId: data.videoId,
			channelId: data.channelId,
		},
		update: {
			type: 'DISLIKE',
		},
	});
};

module.exports.createComment = (data) => {
	return client.comment.create({
		data: {
			videoId: data.videoId,
			content: data.content,
			ownerId: data.channelId,
		},
	});
};

module.exports.getLikesForVideo = (videoId) => {
	return client.videoRating.findMany({
		where: {
			videoId,
			type: 'LIKE',
		},
	});
};

module.exports.getLikeCountForVideo = (videoId) => {
	return client.videoRating.count({
		where: {
			videoId,
			type: 'LIKE',
		},
	});
};

module.exports.subscribe = (data) => {
	return client.channel.update({
		where: {
			id: data.channelId,
		},
		data: {
			subscribed: {
				connect: {
					id: data.subChannelId,
				},
			},
		},
	});
};


module.exports.getChannelWithJoins = (channelId) => {
	return client.channel.findUnique({
		include: {
			videos: {
				include: {
					comments: true,
					owner: true,
					ratings: true,
					views: true,
					_count: true,
				},
			},
			history: {
				include: {
					channel: true,
					video: true,
				},
			},
			ratings: {
				include: {
					channel: true,
					video: true,
				},
			},
			comments: {
				include: {
					owner: true,
					video: true,
				},
			},
			subscribed: {
				include: {
					comments: true,
					history: true,
					ratings: true,
					subscribed: true,
					subscribers: true,
					videos: true,
					_count: true,
				},
			},
			subscribers: {
				include: {
					comments: true,
					history: true,
					ratings: true,
					subscribed: true,
					subscribers: true,
					videos: true,
					_count: true,
				},
			},
		},
		where: {
			id: channelId,
		},
	});
};
