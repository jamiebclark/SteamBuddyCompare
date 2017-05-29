import React, {Component} from "react";
import TagList from "./TagList.jsx";
import fetch from "node-fetch";
import classNames from "classnames";

export default class SteamBuddyCompare extends Component {
	constructor(props) {
		super(...arguments);
		this.state = {
			steamIds: [],
			data: {},
			idCount: 2,
			loading: false,
			filters: {}
		};

		if (props.steamIds) {
			if (typeof props.steamIds === "string") {
				this.state.steamIds = props.steamIds.split(',');
			} else {
				this.state.steamIds = props.steamIds;
			}
			this.state.idCount = this.state.steamIds.length;
		}
	}

	static get defaultProps() {
		return {
			baseUrl: "",
			steamIds: []
		};
	}

	hasFilter(propName) {
		return this.state.filters[propName] && this.state.filters[propName][1];
	}

	isFilterShown(propName, values) {
		return this.isInFilter(propName, values, 1);
	}

	isFilterHidden(propName, values) {
		return this.isInFilter(propName, values, 2);
	}

	isInFilter(propName, values, activeValue) {
		var filters = this.state.filters;
		if (!filters[propName] || !filters[propName][activeValue] || !Object.keys(filters[propName][activeValue]).length) {
			return null;
		}
		for (let i in values) {
			i = parseInt(i);
			if (filters[propName][activeValue][i]) {
				return true;
			}
		}
		return false;
	}

	setData() {
		var url = this.props.baseUrl + "api?";
		for (let i in this.state.steamIds) {
			url += "steamId[" + i + "]=" + this.state.steamIds[i] + "&";
		}
		this.setState({loading: true}, () => {
			console.log(["FETCHING", url]);
			fetch(url)
				.then((response) => {
					return response.json();
				})
				.then((data) => {
					console.log(data);
					this.setState({
						loading: false,
						data: data
					});
				})
				.catch((err) => {
					console.error(err);
				});
		});
	}

	// Click Filter
	handleClickFilter(propName, value, activeValue) {
		let filters = this.state.filters;
		if (!filters[propName]) {
			filters[propName] = {1: {}, 2: {}};
		} else {
			// Remove instances elsewhere
			for (let i in filters[propName]) {
				if (i !== activeValue) {
					if (typeof filters[propName][i][value] !== "undefined") {
						delete filters[propName][i][value];
					}
				}
			}
		}
		if (activeValue > 0) {
			filters[propName][activeValue][value] = value;
		}
		this.setState({filters: filters});
	}

	handleInputChange(i, e) {
		let steamIds = this.state.steamIds,
			val = e.target.value.replace(/[^0-9]/, '');
		if (val != "") {
			steamIds[i] = val;
			this.setState({steamIds: steamIds});
		}
	}

	handleSubmit(e) {
		e.preventDefault();
		this.setData();
	}

	handleAddInputClick(e) {
		e.preventDefault();
		this.setState({
			idCount: this.state.idCount + 1
		});
	}

	renderForm() {
		var inputs = [];
		for (let i = 0; i < this.state.idCount; i++) {
			inputs.push(<input
				key={i}
				type="text"
				name="steamId[]"
				onChange={this.handleInputChange.bind(this, i)}
				value={this.state.steamIds[i]}
			/>)
		}
		inputs.push(<button 
			key="plus"
			onClick={this.handleAddInputClick.bind(this)}
			type="button"
		>+</button>);

		return <form className="id-search-form" onSubmit={this.handleSubmit.bind(this)} >
			<header>
				<h2>Steam IDs:</h2>
			</header>
			<div className="input-list">
				{inputs}
			</div>
			<div className="search">
				<button type="submit">Submit</button>
			</div>
		</form>
	}

	renderResults() {
		let headers = [],
			rows = [],
			cols = [],
			c = 0,
			r = 0,
			game;

		for (c in this.state.steamIds) {
			if (this.state.steamIds[c] != "") {
				headers.push(<th key={c}>
					<a 
						href={"http://steamcommunity.com/profiles/" + this.state.steamIds[c]}
						target="_blank"
					>{"Player " + c}</a>
				</th>);
			}
		}

		for (r in this.state.data.games) {
			game = this.state.data.games[r];
			cols = [];

			const filters = [
				{
					filter: "categories",
					ids: game.store.categoriesId,
				}, {
					filter: "genres",
					ids: game.store.genresId
				}
			];
			let isHidden = false;
			for (let k in filters) {
				if (
					(this.isFilterShown(filters[k].filter, filters[k].ids) === false) ||
					(this.isFilterHidden(filters[k].filter, filters[k].ids) === true)
				) {
					isHidden = true;
					break;
				}
			}

			if (isHidden) {
				continue;
			}

			for (c in this.state.steamIds) {
				if (this.state.steamIds[c] != "") {
					let isMatch = game.steamBuddy.steamIds.indexOf(this.state.steamIds[c]) != -1,
						cellClass = isMatch ? "cellmatch-yes" : "cellmatch-no",
						cellContent = isMatch ? "YES" : "NO";
					cols.push(<td key={c}>
						<span className={classNames("cellmatch", cellClass)}>
							{cellContent}
						</span>
					</td>);
				}
			}
			rows.push(<tr key={r}>
				<td>
					<a 
						href={"http://store.steampowered.com/app/" + game.appid} 
						target="_blank"
						className="game-link"
					>
							<img src={game.store.header_image} alt="Header image" />
							{game.store.name}
							
					</a>
				</td>
				{cols}
			</tr>);
		}

		return <div className="SteamBuddyCompare-results-content">
			<table className="SteamBuddyCompare-results-content-games">
				<thead>
					<tr>
						<th>Games</th>
						{headers}
					</tr>
				</thead>
				<tbody>
					{rows}
				</tbody>
			</table>
			<div className="SteamBuddyCompare-results-content-filters">
				<TagList 
					label="Categories" 
					name="categories" 
					options={this.state.data.categories}
					onClick={this.handleClickFilter.bind(this)}
				/>
				<TagList 
					label="Genres" 
					name="genres" 
					options={this.state.data.genres} 
					onClick={this.handleClickFilter.bind(this)}
				/>
			</div>
		</div>
	}

	renderLoading() {
		return <div className="SteamBuddyCompare-loading content-box">
			<div className="steam">
				<div className="steam-bar steam-bar-short">
					<div className="steam-pivot steam-pivot-lg steam-pivot-3"></div>
					<div className="steam-pivot steam-pivot-2"></div>
					<div className="steam-bar steam-bar-long">
						<div className="steam-pivot steam-pivot-1"></div>
					</div>
				</div>
				<div className="steam-text">LOADING</div>
			</div>
		</div>
	}

	renderInitial() {
		return <div className="SteamBuddyCompare-welcome content-box">
			<h1>Steam Buddy Compare</h1>
			<p><em>Steam Buddy Compare</em> is a way to view your game inventory compared to your friends' lists and find out what games you have in common. You can further filter that list to only find specific kinds of games based on Genre or Category</p>
			<p>In order to use the search function, you need to first find your Steam IDs. If you need help finding your ID, <a href="http://steamid.co/" target="_blank">use this website as a resource</a>.</p>
		</div>
	}

	render() {
		var body = [];
		if (this.state.loading) {
			body = this.renderLoading();
		} else if (!this.state.data.games) {
			body = this.renderInitial();
		} else {
			body = this.renderResults();
		}

		return <div className="SteamBuddyCompare">
			<header>
				<h1>Steam Buddy Compare</h1>
				<div className="SteamBuddyCompare-form">
					{this.renderForm()}
				</div>
			</header>
			<div className="SteamBuddyCompare-results">
				{body}
			</div>
		</div>
	}	
}

