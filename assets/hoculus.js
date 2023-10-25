window.hoculus = window.hoculus || {};
if (console && console.log) {
	console.log(
		"Coded by %cHoculus srl %con %cShopify %c- %c" +
		Shopify.theme.name +
		" %c -> https://hoculus.com",
		"color: red; font-weight: bold",
		"color: unset",
		"color: green",
		"color: unset",
		"color: blue",
		"color: unset; font-weight: bold"
	);
}
hoculus.utils = class {
	getScript(source, callback) {
		hoculus.loadedScripts = hoculus.loadedScripts || [];
		if (hoculus.loadedScripts.includes(source)) {
			setTimeout(callback, 0);
		} else {
			var script = document.createElement("script");
			var prior = document.getElementsByTagName("script")[0];
			script.defer = 1;

			script.onload = script.onreadystatechange = function (_, isAbort) {
				if (
					isAbort ||
					!script.readyState ||
					/loaded|complete/.test(script.readyState)
				) {
					script.onload = script.onreadystatechange = null;
					script = undefined;

					if (!isAbort && callback) setTimeout(callback, 0);
				}
			};
			script.src = source;
			prior.parentNode.insertBefore(script, prior);
		}
	}
	async getScriptAsync(source) {
		return await new Promise(function (resolve, reject) {
			hoculus.loadedScripts = hoculus.loadedScripts || [];
			if (hoculus.loadedScripts.includes(source) || source == "") {
				resolve(true);
			} else {
				var script = document.createElement("script");
				var prior = document.getElementsByTagName("script")[0];
				script.defer = 1;

				script.onload = script.onreadystatechange = function (_, isAbort) {
					if (
						isAbort ||
						!script.readyState ||
						/complete/.test(script.readyState)
					) {
						script.onload = script.onreadystatechange = null;
						script = undefined;

						if (!isAbort) setTimeout(resolve(true), 50);
					}
				};

				script.src = source;
				prior.parentNode.insertBefore(script, prior);
			}
		});
	}
	addToCart(items) {
		return new Promise(function (resolve, reject) {
			if (hoculus.on_adding) resolve;
			var postData = JSON.stringify({ items: items })
			fetch('/cart/add.js', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: postData
			}).then(response => {
				return response.json();
			}).then(data => {
				if (data.status == 422) resolve(false)
				resolve(data);
			}).catch((error) => {
				console.error('Error:', error);
				reject(error)
			});
		})
	}
	insertScriptTag(html) {
		let script = document.createElement("script");
		let head = document.getElementsByTagName("head")[0];
		script.innerHTML = html;
		head.appendChild(script);
	}
	async insertCss(css) {
		return await new Promise(function (resolve, reject) {
			let link = document.createElement("link");
			link.setAttribute("rel", "stylesheet");
			link.setAttribute("href", css);
			document.head.appendChild(link);
			resolve(true);
		});
	}
	async waitFunction(wfunction) {
		let _this = this;
		this.check = function () {
			if (typeof wfunction == "function") {
				resolve(true);
			} else {
				setTimeout(_this.check(), 50);
			}
		};
		return await new Promise(function (resolve, reject) {
			_this.check();
		});
	}
	static onInteraction() {
		hoculus.interacted = hoculus.interacted || false;
		if (!hoculus.interacted) {
			new hoculus.whatsappWidget()
			hoculus.interacted = true;
		}
	}
	async waitElement(selector) {
		return await new Promise(function (resolve, reject) {
			var check = function () {
				if (document.querySelector(selector) !== null) {
					resolve(document.querySelector(selector));
				} else {
					setTimeout(check, 50);
				}
			};
			check();
		});
	}
	domready(callback) {
		if (document.readyState == "complete") callback();
		else document.addEventListener("DOMContentLoaded", callback);
	}
	static async domreadyState() {
		return await new Promise(function (resolve, reject) {
			document.onreadystatechange = () => {
				if (document.readyState === "complete") {
					resolve(true);
				}
			};
		});
	}
};


hoculus.whatsappWidget = class extends hoculus.utils {
	constructor(selectors = { widget: "#whatsapp-button", dataset: "whatsappSettings" }) {
		super();
		let _this = this;
		console.log(document.querySelector(selectors.widget))
		if (!document.querySelector(selectors.widget)) return;
		this.selectors = selectors
		Promise.allSettled([
			_this.getScriptAsync(hoculus.assets.js.jquery),
			_this.insertCss(hoculus.themeData.floatingWppCss),
		]).then(() => {
			_this.getScriptAsync(hoculus.themeData.floatingWppJs).then(() => {
				_this.init();
			})
		})
	}
	init() {
		this.node = $(this.selectors.widget);
		this.node.floatingWhatsApp(this.getOptions());
		this.node.show();
		this.node.css("style: block");
	}
	getOptions() {
		return this.node.data(this.selectors.dataset);
	}
}


hoculus.utils.domreadyState().then(async () => {
	// Promise.allSettled([
	// ]);
	["click", "scroll", "touchstart", "mousemove"].forEach(function (evt) {
		document.addEventListener(evt, hoculus.utils.onInteraction, { passive: false })
	})
});