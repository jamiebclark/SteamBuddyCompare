<?php
if (!defined('ROOT')) {
	define('ROOT', dirname(__FILE__));
}
if (!defined('DS')) {
	define('DS', DIRECTORY_SEPARATOR);
}
if (!defined('APP')) {
	define('APP', ROOT . DS . 'app' . DS);
}

require_once ROOT . DS . "config.php";
require_once ROOT . DS . "vendor/autoload.php";