<?php
require "../../bootstrap.php";
/**
 * Use the DS to separate the directories in other defines
 */
if (!defined('DS')) {
	define('DS', DIRECTORY_SEPARATOR);
}
/**
 * These defines should only be edited if you have cake installed in
 * a directory layout other than the way it is distributed.
 * When using custom settings be sure to use the DS and do not add a trailing DS.
 */

/**
 * The full path to the directory which holds "app", WITHOUT a trailing DS.
 *
 */
if (!defined('ROOT')) {
	define('ROOT', dirname(dirname(dirname(__FILE__))));
}
/**
 * The actual directory name for the "app".
 *
 */
if (!defined('APP_DIR')) {
	define('APP_DIR', basename(dirname(dirname(__FILE__))));
}

$baseUrl = sprintf(
	"%s://%s%s",
	isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] != 'off' ? 'https' : 'http',
	$_SERVER['SERVER_NAME'],
	$_SERVER['REQUEST_URI']
);
if (substr($baseUrl, -1) != '/') {
	$baseUrl .= '/';
}
list($baseUrl, $query) = explode('?', $baseUrl) + [null, null];

$defaultSteamIds = "";
if (!empty($_GET['ids'])) {
	$ids = $_GET['ids'];
	if (!is_array($ids)) {
		$ids = [$ids];
	}
	foreach ($ids as $id) {
		if (is_numeric($id)) {
			$defaultSteamIds .= $id . ',';
		}
	}
}
if (empty($defaultSteamIds) && defined('DEFAULT_STEAM_IDS')) {
	$defaultSteamIds = DEFAULT_STEAM_IDS;
}

?>
<html>
	<head>
		<title>Steam Buddy Compare</title>
		<link rel="stylesheet" href="css/style.css" />
		<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css" />
	</head>
	<body>
		<div id="root" data-base="<?= $baseUrl ?>" data-steamids="<?= $defaultSteamIds ?>"></div>
		<script type="text/javascript" src="js/dev/app.js" ></script>
	<body>
</body>