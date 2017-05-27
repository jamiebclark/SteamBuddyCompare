import React, {Component} from "react";
import ReactDOM from "react-dom";
import SteamBuddyCompare from "./components/SteamBuddyCompare.jsx";

var el = document.getElementById("root");

ReactDOM.render(<SteamBuddyCompare 
	baseUrl={el.getAttribute("data-base")}
	steamIds={el.getAttribute("data-steamids")}
/>, el);
