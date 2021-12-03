module.exports.GenVideoID = () => {
	const length = 16,
		charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
	let result = '';

	for (let i = length; i > 0; --i) {
		result += charset[Math.floor(Math.random() * charset.length)];
	}
	return result;
};

// Make sure the user is logged in
module.exports.ensureAuthenticated = (req, res, next) => {
	if (req.isAuthenticated()) return next();
	res
		.status(302)
		.redirect('/login');
};

module.exports.partition = (array, predicate) => {
	const partitionOne = [];
	const partitionTwo = [];

	for (let i = 0; i < array.length; i++) {
		if (predicate(array[i], i)) {
			partitionOne.push(array[i]);
		} else {
			partitionTwo.push(array[i]);
		}
	}

	return [partitionOne, partitionTwo];
};
const en = require('javascript-time-ago/locale/en.json'),
	TimeAgo = require('javascript-time-ago');
// Configure time format to use en-US
TimeAgo.addDefaultLocale(en);
const timeAgo = new TimeAgo('en-US');

module.exports.time = (date) => {
	// if video was upload morethan 2 weeks ago use different format
	if (new Date() - date >= 2 * 604800000) {
		const months = ['Jan', 'Feb', 'March', 'April', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
		return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
	} else {
		return timeAgo.format(date);
	}
};


module.exports.commentMapper = (comment) => {
	const [likes, dislikes] = this.partition(comment.ratings, (c) => c.type === 'LIKE');
	const replies = comment._count.replies;

	Reflect.deleteProperty(comment, 'ratings');
	Reflect.deleteProperty(comment, '_count');

	return {
		...comment,
		replies,
		likes:
		likes.length,
		dislikes:
		dislikes.length,
	};
};
