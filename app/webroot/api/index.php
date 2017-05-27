<?php
require "../../../bootstrap.php";
require_once APP . "api" . DS . "SteamBuddyApi.php";

use SteamBuddy\Api;
header('Content-Type: application/json');
$Api = new Api();

//print_r($Api->getAppList());
//exit();

//$steamIdRussell = '76561198078141319';
//$steamIdJamie = '76561197971282243';


if (!empty($_GET['steamId'])) {

	//$results = $Api->getOwnedGames($steamIdJamie);
	//print_r($results);
	try {
		$results = $Api->get($_GET['steamId']);
	} catch (\Exception $e) {
		print_r([$e->getMessage()]);
	}

	//$results = $results['applist']['apps'];
	//$results = array_slice($results, 0, 5);
	echo json_encode($results);
}

