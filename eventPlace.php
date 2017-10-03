<?php namespace invite;

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseQuery;

$eventPlace = new EventPlace();

//if request method GET - show page
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $eventPlace->showPage();
}

class EventPlace {

    /**
     * configuration
     * @var array
     */
    protected $config = [];

    protected $showBanner = false;

    /**
     * Init modules
     */
    public function __construct() {
        $this->config = include('config.php');
        $parseConfig = $this->config['parse'];

        require 'vendor/autoload.php';
        ParseClient::initialize($parseConfig['appId'], $parseConfig['restKey'], $parseConfig['masterKey']);
    }

    /**
     * Display confirmation landing page.
     */
    public function showPage() {

        try {
            $eventPlaceId = isset($_GET['p']) ? htmlspecialchars(strip_tags($_GET['p'])) : null;
            if (!$eventPlaceId) {
                throw new \Exception('Link ID is not set!');
            }

            $this->showBanner = isset($_GET['banner']) ? true : false;

            $this->showEventPlacePage($eventPlaceId);

        } catch(\Exception $e) {
            $this->showError($e->getMessage());
        }

    }


    /**
     * Get event place method
     * @param $eventPlaceId
     * @return array|\Parse\ParseObject
     * @throws \Exception
     * @throws \Parse\ParseException
     */
    protected function getEventPlace($eventPlaceId) {
        $query = new ParseQuery('EventPlace');
        $eventPlace = $query->get($eventPlaceId);

        if (!$eventPlace) {
            throw new \Exception('Event not found');
        }

        return $eventPlace;
    }

    /**
     * Show Event Place page
     * @param $eventPlaceId
     */
    public function showEventPlacePage($eventPlaceId)
    {
        $eventPlace = $this->getEventPlace($eventPlaceId);
        $this->displayEventPlacePage($eventPlace);
    }

    /**
     * Show errors
     * @param $message
     */
    protected function showError($message) {
        $error = date('Y-m-d H:i:s') . ' eventPlace.php ' . $message . ' URL: "' . "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]".'"' . PHP_EOL;
        file_put_contents(__DIR__ . '/temp/error.log', $error, FILE_APPEND | LOCK_EX);
        die($message);
    }

    /**
     * Display html page from template
     * @param $eventPlace
     * @return bool
     */
    protected function displayEventPlacePage($eventPlace) {

        $data = [
            'objectId' => $eventPlace->getObjectId(),
            'venueAddress' => $eventPlace->venueAddress,
            'venueLocationLatitude' => $eventPlace->venueLocation->getLatitude(),
            'venueLocationLongitude' => $eventPlace->venueLocation->getLongitude(),
            'venueLogo' => $eventPlace->venueLogo ? $eventPlace->venueLogo->getUrl() : '',
            'venueName' => $eventPlace->venueName,
            'venuePhone' => $eventPlace->venuePhone,
            'showBanner' => $this->showBanner,
        ];

        include('templates/event-place.php');
        return true;
    }
}