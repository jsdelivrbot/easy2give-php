<?php namespace invite;

use Parse\ParseClient;
use Parse\ParseQuery;

include_once('email.php');
include_once('get-template.php');

$eventCheck = new EventCheck();
$eventCheck->checking();


class EventCheck {

    protected $config = [];
    protected $smsTextFields = [
        'coupleAlert' => 'coupleAlertText',
        'firstWaveSms' => 'firstWaveSmsText',
        'secondWaveSms' => 'secondWaveSmsText',
        'smsRemind' => 'smsRemindText',
    ];

    /**
     * Init modules
     */
    public function __construct() {
        $this->config = include('config.php');
        $parseConfig = $this->config['parse'];
        $this->smsStatusList = $this->config['smsStatusList'];
        $this->smsStatusListReverse = $this->config['smsStatusListReverse'];

        require 'vendor/autoload.php';
        ParseClient::initialize($parseConfig['appId'], $parseConfig['restKey'], $parseConfig['masterKey']);
    }

    /**
     * Checking active events
     */
    public function checking() {
        try {
            //Check events
            $activeEvents = $this->getActiveEvent();
            $this->checkSmsContent($activeEvents);
        }
        catch(\Exception $e) {
            echo $e->getCode();
            echo $e->getMessage();
        }

        echo "<br>done";
    }

    /**
     * Get active events
     * @return \Parse\ParseObject[]
     */
    public function getActiveEvent() {
        $query = new ParseQuery('Event');
        $query->doesNotExist('disabledAt');

        return $query->find();
    }

    /**
     * Checking sms content of event
     * @param $activeEvents
     */
    public function checkSmsContent($activeEvents) {
        foreach ($activeEvents as $event) {
            $errorLine = '';
            $errorLines = $this->checkOnEmptyContent($event);
            if($errorLines) {
                //prepare params for template
                $coupleId = $event->get('coupleId');
                foreach($errorLines as $error){
                    $errorLine = $errorLine ? $errorLine . ", " . $error : $error;
                }
                $paramList = [
                    'error' => 'יש תוכן ריק בסמס.',
                    'coupleId' => $coupleId,
                    'errorLine' => $errorLine,
                ];
                $this->sendEmail($paramList);
            }
        }
    }

    /**
     * Checking sms content of event on the void
     * @param $event
     * @return array
     */
    public function checkOnEmptyContent($event) {
        $errors = [];
        foreach($this->smsTextFields as $key => $value) {
            if(!$event->$value && $event->$value === '') {
                array_push($errors, $value);
            }
        }
        return $errors;
    }

    /**
     * Sending sms with errors to admin
     * @param $paramList
     * @internal param $error
     * @internal param $coupleId
     * @internal param $errorLine
     */
    public function sendEmail($paramList) {
        $template = new \Template();
        $emailText = $template->getTemplate('templates/email/event-error.php', $paramList);
        $emailList = $this->config['clientEmail'];

        $email = new \Email();
        $subject = "טעות נמצעה באירוע.";
        $email->send($emailText, $subject, 'info@easy2give.co.il', 'Easy2give', $emailList);
    }

}