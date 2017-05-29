<?php
namespace SteamBuddy;
require '../../../bootstrap.php';

define('API_DIR', dirname(__FILE__));
define('GAME_CACHE_DIR', APP. 'tmp' . DS . 'game_cache' . DS);

if (!defined('STEAM_API_KEY')) {
	throw new Exception("Your Steam API Key has not been set yet");
}
if (!is_dir(GAME_CACHE_DIR)) {
	mkdir(GAME_CACHE_DIR, 755, true);
}

/*
$namespaceDirs = [
	'Steam' => implode(DIRECTORY_SEPARATOR, [dirname(__FILE__), '..', 'vendor', 'da-mitchell', 'steam-api', 'src', 'Steam']),
	'GuzzleHttp' => implode(DIRECTORY_SEPARATOR, [dirname(__FILE__), '..', 'vendor', 'guzzlehttp', 'guzzle', 'src']),
];
$includePath = get_include_path();
foreach ($namespaceDirs as $dir) {
	$includePath .= PATH_SEPARATOR . $dir;
}
set_include_path($includePath);

require_once "functions.php";
spl_autoload_register(function ($class) {
	global $namespaceDirs;
	$parts = explode('\\', $class);
	$ns = array_shift($parts);
	if (!empty($namespaceDirs[$ns])) {
		array_unshift($parts, $namespaceDirs[$ns]);

	}
	$file = implode(DIRECTORY_SEPARATOR, $parts) . '.php';
	require $file;
});
*/



use GuzzleHttp\Client;
use Steam\Configuration;
use Steam\Runner\GuzzleRunner;
use Steam\Runner\DecodeJsonStringRunner;
use Steam\Steam;
use Steam\Utility\GuzzleUrlBuilder;

/**
 * Logging Class
 *
 **/
class Log {
	private static $logs = [];
	public static function set($msg) {
		self::$logs[] = $msg;
	}

	public static function get() {
		return self::$logs;
	}
}

/**
 * Timer class to track time
 *
 **/
class Timer {
	private static $_timestamp;
	public static function set() {
		self::$_timestamp = self::_getTime();
	}

	public static function get() {
		return self::_getTime() - self::$_timestamp;
	}

	private static function _getTime() {
		$time = microtime();
		$time = explode(' ', $time);
		return $time[1] + $time[0];
	}
}
Timer::set();


class Api {
	private $apiKey = STEAM_API_KEY;

	private $_steam;
	private $_store;

	private $_steamApiCount = 0;
	private $_storeApiCount = 0;

	private $_appCache = [];

	protected $_appFields = ['name', 'header_image', 'categories', 'genres'];
	protected $_appIdFields = ['categories', 'genres'];

	protected $_log = [];

	public function __construct() {
		$this->initSteamApi();
	}

/**
 * Stores all apps inside an app cache
 *
 **/
	public function get($steamIds) {
		set_time_limit(720);
		if (!is_array($steamIds)) {
			$steamIds = [$steamIds];
		}
		foreach ($steamIds as $k => $id) {
			if (!is_numeric($id)) {
				unset($steamIds[$k]);
			}
		}
		
		if (!empty($steamIds)) {
			return null;
		}

		$result = $this->_get($steamIds, [], 1);
		if (is_array($steamIds)) {
			$steamIdCount = count($steamIds);
			foreach ($result['games'] as $k => $game) {
				$result['games'][$k]['steamBuddy']['percent'] = $game['steamBuddy']['matches'] / $steamIdCount;
			}
		}
		usort($result['games'], function($a, $b) {
			if ($a['steamBuddy']['percent'] != $b['steamBuddy']['percent']) {
				return $b['steamBuddy']['percent'] > $a['steamBuddy']['percent'];
			} else {
				return $a['store']['name'] > $b['store']['name'];
			}
		});
		usort($result['genres'], function($a, $b) {
			return $b['name'] < $a['name'];
		});
		usort($result['categories'], function($a, $b) {
			return $b['name'] < $a['name'];
		});
		$result['steamBuddyLog'] = Log::get();
		return $result;
	}

	protected function _get($steamId, $result = [], $steamIdCount = 1) {
		if (is_array($steamId)) {
			foreach ($steamId as $id) {
				$result = $this->_get($id, $result, $steamIdCount + 1);
			}
		} else {
			$games = [];
			$genres = [];
			$categories = [];

			$maxGames = 0;
			$maxGamesIndex = 0;

			$ownedGames = $this->getOwnedGames($steamId);
			if (!empty($ownedGames['response']['games'])) {
				foreach ($ownedGames['response']['games'] as $game) {

					if ($maxGames && $maxGamesIndex++ > $maxGames) {
						break;
					}

					$appId = $game['appid'];
					$errorMessage = null;

					try {
						$this->_storeApiCount++;
						$storeDetails = $this->getApp($appId);
						$success = true;
					} catch (\Exception $e) {
						$storeDetails = null;
						$success = false;
						$errorMessage = sprintf('%s and Store API Call #%s',
							$e->getMessage(),
							number_format($this->_storeApiCount)
						);
					}

					if ($success) {
						if (empty($result['games'][$appId])) {
							$result['games'][$appId] = [
								'appid' => $appId,
								'success' => $success,
								'errorMessage' => $errorMessage,
								'steamBuddy' => [
									'matches' => 1,
									'percent' => 1,
									'steamIds' => [$steamId],
								],
								'store' => $storeDetails
							];
							
							if ($success) {
								if (!empty($storeDetails['genres'])) {
									foreach ($storeDetails['genres'] as $genre) {
										$genre = (array) $genre;
										$result['genres'][$genre['id']] = [
											'name' => $genre['description'],
											'value' => $genre['id']
										];
									}
								}
								if (!empty($storeDetails['categories'])) {
									foreach ($storeDetails['categories'] as $category) {
										$category = (array) $category;
										$result['categories'][$category['id']] = [
											'name' => $category['description'],
											'value' => $category['id']
										];
									}
								}
							}
						} else {
							$result['games'][$appId]['steamBuddy']['matches']++;
							$result['games'][$appId]['steamBuddy']['percent'] = $result['games'][$appId]['steamBuddy']['matches'] / $steamIdCount;
							$result['games'][$appId]['steamBuddy']['steamIds'][] = $steamId;
						}
					}
				}
			}
		}
		return $result;
	}

	public function getAppList() {
		return $this->run(new \Steam\Command\Apps\GetAppList());
	}

	public function getOwnedGames($steamId, $params = []) {
		return $this->run(new \Steam\Command\PlayerService\GetOwnedGames($steamId, $params));
	}

	protected function getCachedApp($appId) {
		$filename = GAME_CACHE_DIR . $appId . '.json';
		if (is_file($filename)) {
			$content = file_get_contents($filename);
			if (($content = json_decode($content)) && !empty($content)) {
				return (array) $content;
			}
		}
		return false;
	}

	protected function setCachedApp($appId, $data) {
		$filename = GAME_CACHE_DIR . $appId . '.json';
		return file_put_contents($filename, json_encode($data));
	}

	protected function getApp($appId) {
		if (empty($this->_appCache[$appId])) {
			if (!($tmpApp = $this->getCachedApp($appId))) {
				try {
					$storeDetails = $this->_store->getAppDetails($appId);
				} catch(\Exception $e) {
					throw new \Exception(sprintf(
						'Error fetching app details from store: %s on AppID: %s',
							$e->getMessage(),
							$appId
						));
				}
				if (empty($storeDetails->{$appId}->success)) {
					throw new \Exception("Information from AppID: $appId failed to load");
				}
				$app = $storeDetails->{$appId}->data;
				$tmpApp = [];
				foreach ($this->_appFields as $field) {
					$tmpApp[$field] = !empty($app->{$field}) ? $app->{$field} : null;
				}
				foreach ($this->_appIdFields as $field) {
					$idField = $field . 'Id';
					$tmpApp[$idField] = [];
					if (!empty($app->{$field})) {
						foreach ($app->{$field} as $row) {
							$tmpApp[$idField][$row->id] = $row->id;
						}
					}
				}
				$this->setCachedApp($appId, $tmpApp);
			}
			$this->_appCache[$appId] = $tmpApp;
		}
		return $this->_appCache[$appId];
	}

	protected function run($command) {
		Timer::set();
		Log::set("Fetching command on " . get_class($command));
		$return = $this->_steam->run($command);
		Log::set("Finished fetching in " . (Timer::get()));
		return $return;
	}

	protected function initSteamApi() {
		$this->_store = new StoreApi();

		$this->_steam = new Steam(new Configuration([
			Configuration::STEAM_KEY => $this->apiKey,
		]));
		$this->_steam->addRunner(new GuzzleRunner(new Client(), new GuzzleUrlBuilder()));
		$this->_steam->addRunner(new DecodeJsonStringRunner());
	}
}

class StoreApi {
	protected $baseUrl = 'http://store.steampowered.com/api/';

	public function getAppDetails($appId) {
		return $this->run('appdetails', ['appids' => $appId]);
	}

	private function run($command, $params = []) {
		Timer::set();
		$url = $this->baseUrl . $command;
		if (!empty($params)) {
			$url .= '?' . http_build_query($params);
		}
		try {
			$content = $this->fetch($url);
		} catch (\Exception $e) {
			throw new \Exception("Could not load url: $url " . $e->getMessage());
		}
		return json_decode($content);
	}

	private function fetch($url) {
		Log::set("Fetching url: $url");
		if (!($content = @file_get_contents($url))) {
			throw new \Exception("Could not fetch $url");
		}
		Log::set("Finished fetching in " . (Timer::get() / 1000));
		return $content;
	}

}