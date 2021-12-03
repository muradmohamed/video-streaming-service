const NodeMediaServer = require('node-media-server'),
	{ findChannel } = require('../src/utils/database'),
	config = require('./config').rtmp_server;

const nms = new NodeMediaServer(config);

nms.on('prePublish', async (id, StreamPath, args) => {
	console.log(StreamPath);
	const stream_key = getStreamKeyFromStreamPath(StreamPath);
	console.log('[NodeEvent on prePublish]', `id=${id} StreamPath=${StreamPath} args=${JSON.stringify(args)}`);

	// Only accept logged in
	const channel = await findChannel({ stream_key: stream_key });
	if (!channel) {
		const session = nms.getSession(id);
		session.reject();
	}
});

const getStreamKeyFromStreamPath = (path) => {
	const parts = path.split('/');
	return parts[parts.length - 1];
};

module.exports = nms;
