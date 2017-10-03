<?php namespace invite;

use Parse\ParseClient;
use Parse\ParseObject;
use Parse\ParseQuery;

$confirm = new Confirm();

//if request method GET - show confirmation page
if ($_SERVER['REQUEST_METHOD'] == 'GET') {
    $confirm->showPage();
} else {
    //if POST run change action method
    $confirm->changeStatus();
}

class Confirm {

    /**
     * configuration
     * @var array
     */
    protected $config = [];

    //updated from confirm page
    const CONTACT_STATUS_UPDATED_BY = 1;

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
            $code = isset($_GET['c']) ? htmlspecialchars(strip_tags($_GET['c'])) : null;
            $eventId = isset($_GET['e']) ? htmlspecialchars(strip_tags($_GET['e'])) : null;

            //select page type - preview or working page
            if ($code) {
                $this->showConfirmPage($code);
            } elseif ($eventId) {
                $this->showTestPage($eventId);
            } else {
                throw new \Exception('Link ID is not set!');
            }

        } catch(\Exception $e) {
            $this->showError($e->getMessage());
        }

    }

    /**
     * Show test confirmation page for couple in sms preview
     * @param $eventId
     * @throws \Exception
     */
    public function showTestPage($eventId)
    {
        $event = $this->getEvent($eventId);
        $this->displayTestPage($event);
    }

    /**
     * Show confirmation page for contacts
     * @param $code
     * @throws \Exception
     */
    public function showConfirmPage($code)
    {
        $contact = $this->getContact($code);
        $event = $this->getEvent($contact->get('event')->getObjectId());
        $this->displayConfirmPage($contact, $event);
    }

    /**
     * Change status ajax action.
     */
    public function changeStatus() {
        $status = isset($_POST['status']) ? (int)$_POST['status'] : null;
        $guest = isset($_POST['guest']) ? (int)$_POST['guest'] : null;
        $code = isset($_POST['contact']) ? $_POST['contact'] : null;

        try{
            if ($status === null || $status === '' || !$guest || !$code) {
                throw new \Exception('Required parameters not set');
            }

            $contact = $this->getContact($code);

            //save contact status log
            $log = new ParseObject('ContactStatusLog');
            $log->set('contact', $contact);
            $log->set('event', $contact->get('event'));
            $log->set('name', $contact->get('name'));
            $log->set('phone', $contact->get('phone'));

            if ($contact->get('status') != $status) {
                $log->set('statusOld', $contact->get('status'));
                $log->set('statusNew', $status);
            }

            if ($contact->get('numberOfGuests') != $guest) {
                $log->set('numberOfGuestsOld', $contact->get('numberOfGuests'));
                $log->set('numberOfGuestsNew', $guest);
            }

            $log->set('updatedBy', self::CONTACT_STATUS_UPDATED_BY);
            $log->save();

            //save contact
            $contact->set('status', $status);
            $contact->set('numberOfGuests', $guest);
            $contact->save();

        } catch(\Exception $e) {
            $this->showError($e->getMessage());
        }
    }

    /**
     * Get event method
     * @param $event
     * @return array|\Parse\ParseObject
     * @throws \Exception
     * @throws \Parse\ParseException
     */
    protected function getEvent($event) {
        $query = new ParseQuery('Event');
        $event = $query->get($event);

        if (!$event) {
            throw new \Exception('Event not found');
        }

        $event->date->setTimezone(new \DateTimeZone('Asia/Tel_Aviv'));
        return $event;
    }

    /**
     * Get contact method
     * @param $code
     * @return array|\Parse\ParseObject
     * @throws \Exception
     * @throws \Parse\ParseException
     */
    protected function getContact($code) {

        //get only 10 characters from the code
        $code = substr($code, 0, 10);

        $query = new ParseQuery('Contact');
        $contact = $query->get($code);

        if (!$contact) {
            throw new \Exception('Wrong link ID!');
        }

        return $contact;
    }

    /**
     * Show errors
     * @param $message
     */
    protected function showError($message) {
        $error = date('Y-m-d H:i:s') . ' ' . $message . ' URL: "' . "http://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]".'"' . PHP_EOL;
        file_put_contents(__DIR__ . '/temp/confirm.log', $error, FILE_APPEND | LOCK_EX);
        die($message);
    }

    /**
     * Display html page from template
     * @param $contact
     * @param $event
     * @return bool
     */
    protected function displayConfirmPage($contact, $event) {

        $eventPlace = $this->getEventPlace($event->eventPlace, $event->showBanner);

        $data = [
            'contactId' => $contact->getObjectId(),
            'contactName' => $contact->name,
            'brideName' => $event->brideName,
            'groomName' => $event->groomName,
            'image' => $event->image ? $event->image->getUrl() : '',
            'date' => $event->date->format('d/m/Y בשעה H:i'),
            'dateLink' => $this->getDateLink($event),
            'location' => $event->location,
            'locationLink' => $event->locationLink,
            'placeName' => $eventPlace['name'],
            'placeUrl' => $eventPlace['url'],
            'showBanner' => $event->showBanner,
            'maxNumberOfGuests' => $event->maxNumberOfGuests,
            'status' => $contact->status,
            'guest' => $contact->numberOfGuests,
        ];

        include('confirm-template.php');
        return true;
    }

    /**
     * Get event place url
     * @param ParseObject $eventPlace
     */
    protected function getEventPlace($eventPlace, $showBanner = false) {
        $result = [
            'name' => '',
            'url' => ''
        ];
        if (!$eventPlace || !$eventPlace instanceOf ParseObject) {
            return $result;
        }

        $eventPlace->fetch();

        $url = $this->config['eventPlaceUrl'] . $eventPlace->getObjectId();

        if ($showBanner) {
            $url .= '?banner';
        }

        $result['url'] = $url;

        $result['name'] = $eventPlace->get('venueName');
        
        return $result;
    }

    /**
     * Display a test html page from template
     * @param $event
     * @return bool
     */
    protected function displayTestPage($event) {

        $eventPlace = $this->getEventPlace($event->eventPlace, $event->showBanner);

        $data = [
            'contactId' => null,
            'contactName' => 'אורח',
            'brideName' => $event->brideName,
            'groomName' => $event->groomName,
            'image' => $event->image ? $event->image->getUrl() : '',
            'date' => $event->date->format('d/m/Y בשעה H:i'),
            'dateLink' => $this->getDateLink($event),
            'location' => $event->location,
            'locationLink' => $event->locationLink,
            'placeName' => $eventPlace['name'],
            'placeUrl' => $eventPlace['url'],
            'showBanner' => $event->showBanner,
            'status' => 3,
            'guest' => 1,
        ];

        include('confirm-template.php');
        return true;
    }

    /**
     * Prepare date link for google calendar
     * @param $event
     * @return string
     */
    protected function getDateLink($event) {
        $dateValue = $event->date->format('Ymd\THis');

        $dateLink = "https://www.google.com/calendar/event?" .
            "action=TEMPLATE" .
            "&text=" . "האירוע של " . $event->brideName . " ו-" . $event->groomName .
            "&dates=" . $dateValue . "/" . $dateValue .
            "&details=" . "האירוע של " . $event->brideName . " ו-" . $event->groomName .
            "&location=" . $event->location .
            "&trp=false" .
            "&sprop=" .
            "&sprop=name:";

        return $dateLink;
    }
}