import React, {Component} from "react";
import classNames from "classnames";


export default class TagList extends Component {
	constructor() {
		super(...arguments);
		this.state = {
			options: []
		};
	}

	static get defaultProps() {
		return {
			name: "",
			options: [],
			showOptions: [],
			hideOptions: [],
			onClick: function() {},
			label: ""
		}
	}

	handleClick(val, activeValue) {
		this.props.onClick(this.props.name, val, activeValue);
	}

	render() {
		let optionList = [];
		for (let i in this.props.options) {
			let status = 0;
			if (this.props.showOptions.indexOf(this.props.options[i].value) > -1) {
				status = 1;
			} else if (this.props.hideOptions.indexOf(this.props.options[i].value) > -1) {
				status = 2;
			}

			optionList.push(<TagListItem
				key={i}
				status={status}
				{...this.props.options[i]}
				onClick={this.handleClick.bind(this)}
			/>);
		}
		return <div>
			<h6>{this.props.label}</h6>
			<div>{optionList}</div>
		</div>
	}
}

class TagListItem extends Component {
	constructor(props) {
		super(...arguments);
		this.state = {status: props.status};
	}
	static get defaultProps() {
		return {
			name: "",
			value: "",
			status: 0,	// 0: Neutral, 1: Match, 2: Not Match
			onClick: function() {}
		}
	}

	handleClick(e) {
		e.preventDefault();
		let status = this.getNextStatusValue(this.state.status);
		this.setState({status: status}, () => {
			this.props.onClick(this.props.value, status);
		});
	}

	getNextStatusValue(currentValue) {
		if (isNaN(currentValue)) {
			currentValue = 0;
		}
		let newVal = parseInt(currentValue) + 1;
		if (newVal > 2) {
			newVal = 0;
		}
		return newVal;
	}

	render() {
		let className = classNames("TagListItem",
				{"TagListItem-match": this.state.status === 1},
				{"TagListItem-hide": this.state.status === 2}
			),
			title = "No filter";

		if (this.state.status === 1) {
			title = "Include any games with " + this.props.name;
		} else if (this.state.status === 2) {
			title = "Hide any games with " + this.props.name;
		}

		return <a 
			className={className}
			href="#" 
			onClick={this.handleClick.bind(this)}
			title={title}
		>{this.props.name}</a>;
	}
}