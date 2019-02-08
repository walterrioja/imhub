<?php
session_start();
date_default_timezone_set('Europe/Berlin');
// require the Authentication Provider vor GIS Auth login credentials and the GIS wrapper main class
//require_once('/home/lstahl/shaping_exchange/48hr/gis-wrapper/AuthProviderUser.php');
//require_once('/home/lstahl/shaping_exchange/48hr/gis-wrapper/GIS.php');
require dirname(__DIR__) . '/tools/vendor/autoload.php';
//require __DIR__ . '/config.php';

//login to GIS and instantiate GIS wrapper
//$user = new \GIS\AuthProviderUser("laurin.stahl@aiesec.net", "nixgibts");
$user = new \GISwrapper\AuthProviderCombined("felix.hernandez09@aiesec.net", "Gaudis1964");
$gis = new \GISwrapper\GIS($user);

//$token = "e37cc2ca04824374070adb9bf6acf8e83cc37c54b9788786fad997fd57061a72";


$token = $user->getToken();
echo $token;

//$token = 
/*
foreach($gis->current_person as $p) {
  echo $p->person->full_name . "\n";
}

$gis->applications = [
	"filters" => [
		"created_at" => [
				["from" => "2017-04-01"],
				["to" => "2017-04-05"]
			],


	]
]*/

