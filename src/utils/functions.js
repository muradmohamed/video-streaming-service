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

module.exports.checkDev = (req, res, next) => {
	if (req.isAuthenticated()) {
		/*
		if (company.devs.includes(req.user._id.toString())) {
			return next();
		} else {
			res.status(403)
				.render('403-page.ejs', {
					user: req.isAuthenticated() ? req.user : null,
					company,
				});
		}
		*/
		next();
	} else {
		return res
			.status(302)
			.redirect('/login');
	}
};
