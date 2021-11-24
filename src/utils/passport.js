const	LocalStrategy = require('passport-local').Strategy,
	{ findChannel } = require('./database'),
	bcrypt = require('bcrypt');

module.exports = function(passport) {
	// For just general login (username + email + password)
	passport.use(new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
		try {
			// Check database for that email
			console.log(email);
			const user = await findChannel({ email: email });
			console.log(user);
			if (!user) return done(null, false, { message:'Email not registered!' });

			// Check if the password is correct
			bcrypt.compare(password, user.password, (err, isMatch) => {
				console.log(isMatch);
				if (err) throw err;
				if (isMatch) {
					return done(null, user);
				} else {
					return done(null, false, { message: 'Password incorrect!' });
				}
			});
		} catch (err) {
			console.log(err);
		}
	}));

	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(obj, done) {
		done(null, obj);
	});
};
