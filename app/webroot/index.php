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

?>
<html>
	<head>
		<title>Steam Buddy Compare</title>
		<link rel="stylesheet" href="css/style.css" />
	</head>
	<body>
		<div id="root" data-base="<?= $baseUrl ?>" data-steamids="<?= DEFAULT_STEAM_IDS ?>"></div>
		<script type="text/javascript" src="js/dev/app.js" ></script>
	<body>
</body>