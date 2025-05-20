export async function hostReactAppReady(
	selector = "#__next > div",
	timeout = 500,
) {
	return new Promise((resolve) => {
		const waiter = () => {
			const host_el = document.querySelector(selector);
			if (host_el?.getBoundingClientRect().height) {
				resolve();
			} else {
				setTimeout(waiter, timeout);
			}
		};
		waiter();
	});
}

export function mediaMatcher(size, callback) {
	const mobileWidthMediaQuery = window.matchMedia(`(max-width: ${size}px)`);
	callback(mobileWidthMediaQuery.matches);
	mobileWidthMediaQuery.addEventListener("change", (e) =>
		callback(e.matches),
	);
}

export function copyToClipboard(text) {
	try {
		navigator.clipboard.writeText(text);
	} catch {
		throw new Error(message);
	}
}

export function setYMTarget(selector, target_id, target) {
	selector.addEventListener("click", () => {
		ym(target_id, "reachGoal", target);
	});
}

export async function preloadScript(url, cb) {
	return new Promise(resolve => {
		const script_el = document.createElement('script');
		script_el.addEventListener('load', () => {
			script_el.remove();
			typeof cb === 'function' && cb();
			resolve();
		});
		script_el.src = url;
		document.head.append(script_el);
	});
}


export async function vimeoAutoPlay(observer_options = {}) {
	const vboxes = document.querySelectorAll('.vimeo-video-box [data-vimeo-vid]');
	if (vboxes.length) {
		await preloadScript('https://player.vimeo.com/api/player.js');
		const io = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				const target = entry.target;
				if (entry.isIntersecting) {
					if (!target['vimeo-player']) {
						target['vimeo-player'] = new Vimeo.Player(target, {
							id: target.dataset.vimeoVid,
							background: 1,
							playsinline: 1,
							autopause: 0,
							title: 0,
							byline: 0,
							portrait: 0,
							autoplay: 1,
							muted: 1,
						});
						target['vimeo-player'].on('play', function () {
							this.element.parentElement.classList.add('playback');
						});
					}
					target['vimeo-player'].play();
				} else {
					target['vimeo-player']?.pause();
				}
			});
		}, Object.assign({}, {threshold: .33}, observer_options));
		vboxes.forEach(box => io.observe(box));
	}
}


export async function asap(cb) {
	if (['complete', 'interactive'].includes(document.readyState)) {
		cb && cb();
		return Promise.resolve();
	}
	return new Promise(resolve => {
		document.addEventListener('DOMContentLoaded', () => {
			cb && cb();
			resolve();
		});
	});
}

export function queryParam(p, source) {
	source ||= location.href;
	let [url, query] = source.split('?');
	query ||= '';
	const params_kv = query.split('&');
	const params = {};
	for (const kv of params_kv) {
		let [k, v] = kv.split('=');
		try {
			v = decodeURIComponent(v);
			v = JSON.parse(v);
		} catch (ex) {
		}
		params[k] = v;
	}
	if (p) {
		return params[p];
	} else {
		return params;
	}
}

export function params2query(p) {
	const kv = [];
	for (let [k, v] of Object.entries(p)) {
		kv.push(`${k}=${encodeURIComponent(typeof v === 'object' ? JSON.stringify(v) : v)}`);
	}
	return kv.join('&');
}

export function getNextData() {
	const config_el = document.getElementById('__NEXT_DATA__');
	return config_el ? JSON.parse(config_el.textContent) : window.__NEXT_DATA__;
}

export function arrayOfNodesWith(what) {
	var nodes;
	if (what.jquery) {
		nodes = what.toArray();
	} else if (what instanceof Array) {
		nodes = what.map(item => arrayOfNodesWith(item)).flat(Infinity);
	} else if (what instanceof Node) {
		nodes = [what];
	} else if (what instanceof NodeList || what instanceof HTMLCollection) {
		nodes = Array.from(what);
	} else if (typeof what === 'string') {
		nodes = Array.from(document.querySelectorAll(what));
	} else {
		throw "*** arrayOfNodesWith: Got something unusable as 'what' param: " + what;
	}
	return nodes;
}

export function watchIntersection(targets, options, yes_handler, no_handler) {
	const io = new IntersectionObserver(function (entries, observer) {
		for (const entry of entries) {
			entry.isIntersecting ? yes_handler?.call(this, entry.target, observer) : no_handler?.call(this, entry.target, observer);
		}
	}, {
		threshold: 1,
		...options
	});
	for (const node of arrayOfNodesWith(targets)) {
		io.observe(node);
	}
	return io;
}