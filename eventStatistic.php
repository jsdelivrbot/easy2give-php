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
        $date = new \DateTime(date('Y-m-d'));

        try {
            //Check sms log
            $smsStatic = $this->countStatusSmsLog($date);
            $this->sendStatistic($smsStatic);

        }
        catch(\Exception $e) {
            echo $e->getCode();
            echo $e->getMessage();
        }

        echo "<br>done";
    }

    /**
     * Count status of sms log
     * @return \Parse\ParseObject[]
     */
    public function countStatusSmsLog($date) {
        $less  = clone $date;
        $date->modify("-1 days");
        $paramList = [];
        $statuses = [];
        $query = new ParseQuery('SmsLog');
        $query->limit(1000);
        $query->lessThan('createdAt', $less);
        $query->greaterThan('createdAt', $date);
        $total = $query->count();
        foreach($this->smsStatusList as $key=>$value) {
            $query->equalTo('status', $key);
            $num = $query->count();
            $statuses[$this->smsStatusList[$key]] = $num;
        }
        $paramList['total'] = $total;
        $paramList['date'] = $date->format('Y-m-d');
        $paramList['statuses'] = $statuses;

        return $paramList;
    }

    /**
     * Sending statistic to admin
     * @param $paramList
     */
    public function sendStatistic($paramList) {
        $template = new \Template();
        $emailText = $template->getTemplate('templates/email/statistic.php', $paramList);
        $emailList = $this->config['adminEmail'];

        $email = new \Email();
        $subject = "Statistic of sms sending.";
        $email->send($emailText, $subject, 'info@easy2give.co.il', 'Easy2give', $emailList);
    }

}