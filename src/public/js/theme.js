function setCookie(cname, cvalue, exdays) {
	const d = new Date();
	d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
	const expires = 'expires=' + d.toUTCString();
	document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/';
}

function getCookie(cname) {
	const name = cname + '=';
	const decodedCookie = decodeURIComponent(document.cookie);
	const ca = decodedCookie.split(';');
	for(let i = 0; i < ca.length; i++) {
		let c = ca[i];
		while (c.charAt(0) == ' ') {
			c = c.substring(1);
		}
		if (c.indexOf(name) == 0) {
			return c.substring(name.length, c.length);
		}
	}
	return '';
}

function changeTheme() {
	if (getCookie('theme') === 'light') {
		document.getElementById('theme').href = `${document.location.origin}/css/theme-dark.css`;
		document.getElementById('themeSelect').innerHTML = 'Appearance: Dark';
		// apply custom classes
		setCookie('theme', 'dark', 1);
		console.log('Changed to dark theme');
	} else {
		document.getElementById('theme').href = `${document.location.origin}/css/theme-light.css`;
		document.getElementById('themeSelect').innerHTML = 'Appearance: Light';
		setCookie('theme', 'light', 1);
		console.log('Changed to light theme');
	}
}
