import fetch from "node-fetch";
import _ from "lodash";


var baseUrl = "./api/";
function getParams(args) {
	let i, out = "";
	for (i in args) {
		if (out !== "") {
			out += "&";
		}
		out += i + "=" + encodeURIComponent(args[i]);
	}
	return out;
}

function buildUrl(address, args) {
	if (typeof address == "object") {
		address = address.join('/');
	}
	if (typeof args !== "undefined") {
		if (typeof args == "object") {
			args = getParams(args);
		}
		address += "?" + args;
	}
	return address;
}

function buildApiUrl(method, args) {
	if (typeof args == "undefined") {
		args = {};
	}
	args.key = apiKey;
	args.format = "json";
	return buildUrl([baseUrl, method], args);
}

export default class SteamApi {
	getOwnedGames(playerId) {
		var url = buildApiUrl("", {
			steamid: playerId
		});
		return fetch(url)
			.then((response) => {
				return response.json();
			})
			.then((json) => {
				let games = [], i;
				for (i in json.response.games) {
					// NOTE: We are ignoring playtime_forever which may be helpful later
					games.push(json.response.games[i]);
				}
				return games;
			})
			.catch((err) => {
				console.error(err);
			});
	}

}