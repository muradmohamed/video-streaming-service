const { PrismaClient } = require('@prisma/client');
const { partition } = require('./functions');

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
	if (data.email) {
		return client.channel.findUnique({ where: { email: data.email } });
	} else if (data.id) {
		return client.channel.findUnique({ where: { id: data.id } });
	} else {
		return null;
	}
};

module.exports.createVideo = (data) => {
	return client.video.create({
		data: {
			id: data.id,
			title: data.title,
			type: data.type,
			attributes: data.attributes,
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

module.exports.getVideo = (data) => {
	return client.video.findUnique({ where: { id: data.id } });
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
			content: data.content,
			video: {
				connect: {
					id: data.videoId,
				},
			},
			owner: {
				connect: {
					id: data.channelId,
				},
			},
		},
	});
};

module.exports.fetchComments = (data) => {
	return client.comment.findMany({
		where: {
			id: {
				videoId: data.videoID,
			},
		},
		include: {
			owner:true,
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

module.exports.getVideosForChannel = async (channelId, take) => {
	const videos = await client.video.findMany({
		select: {
			id: true,
			title: true,
			type: true,
			description: true,
			attributes: true,
			uploadedAt: true,
			ratings: true,
			owner: {
				select: {
					id: true,
					name: true,
				},
			},
			_count: {
				select: {
					views: true,
				},
			},
		},
		where: {
			ownerId: channelId,
		},
		take,
	});

	const mapper = (video) => {
		const [likes, dislikes] = partition(video.ratings, (rating) => rating.type === 'LIKE');

		return {
			id: video.id,
			title: video.title,
			type: video.type,
			description: video.description,
			attributes: video.attributes.split(','),
			uploadedAt: video.uploadedAt,
			owner: video.owner,
			...video._count,
			likes: likes.length,
			dislikes: dislikes.length,
		};
	};


	return videos.map(mapper);
};


module.exports.getCountsForVideo = async (videoId) => {
	const video = await client.video.findUnique({
		select: {
			ratings: {
				select: {
					type: true,
				},
			},
			_count: {
				select: {
					comments: true,
					views: true,
				},
			},
		},
		where: {
			id: videoId,
		},
	});

	if (!video) return null;

	const [likes, dislikes] = partition(video.ratings, (rating) => rating.type === 'LIKE');

	return { ...video._count, likes: likes.length, dislikes: dislikes.length };
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
