<?php namespace invite;

use Parse\ParseClient;
use Parse\ParseException;
use Parse\ParseObject;
use Parse\ParseQuery;

//set max execution time to 30 minutes
set_time_limit(1500);

include_once('cellact.api.php');
include_once('email.php');

/**
 * Create invite notifier instanse and run notifier
 */
$notify = new smsNotify();
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $notify->ajax();
} else {
    if (isset($_GET['test'])) {
        $notify->test();
    } else {
        $notify->run();
    }
}


/**
 * Class inviteNotify
 * @package inviteNotify
 */
class smsNotify
{

    /**
     * Contact status for notify
     */
    const STATUS_CONFIRMED = 0;
    const STATUS_MAYBE = 1;
    const STATUS_NOT_COMING = 2;
    const STATUS_NOT_RESPONDED = 3;

    const EVENT_STATUS_NEW_EVENT = 0;
    const EVENT_STATUS_FIRST_WAVE_DONE = 2;
    const EVENT_STATUS_SECOND_WAVE_DONE = 4;
    const EVENT_STATUS_IVR_DONE = 6;

    const SMS_GET_URL = 'http://la.cellactpro.com/http_req.asp';
    const SMS_POST_URL = 'http://la.cellactpro.com/unistart5.asp';

    const FIRST_WAVE_FIELD = 'firstWave';
    const SECOND_WAVE_FIELD = 'secondWave';

    const FIRST_WAVE_STARTED = 'First wave started';
    const FIRST_WAVE_DONE = 'First wave done';
    const SECOND_WAVE_STARTED = 'Second wave started';
    const SECOND_WAVE_DONE = 'Second wave done';
    const CALL_CENTER_STARTED = 'Call center started';
    const IVR_STARTED = 'IVR started';
    const IVR_DONE = 'IVR done';
    const NOT_PAID = 'Not paid';
    const PASSED = 'Passed';

    const SMS_STATUS_WAIT = 0;
    const SMS_STATUS_ERROR = 1;
    const SMS_STATUS_SENT = 2;

    protected $smsConfig;
    protected $confirmUrl;
    protected $smsStatusUrl;
    protected $config = [];
    protected $templateList = [
        'firstWave' => 'coupleFirstWaveStarted',
        'secondWave' => 'coupleSecondWaveStarted',
        'ivr' => 'coupleIVRStarted',
        'callCenter' => 'coupleCallCenterStarted',
        'eventApprovalFinished' => 'coupleEventApprovalFinished',
        'beforeStartingFirstWave' => 'coupleBeforeStartingFirstWave',
        'beforeStartingSecondWave' => 'coupleBeforeStartingSecondWave',
        'remindCallCenterStart' => 'coupleRemindCallCenterStart',
        'beforeStartingCallCenter' => 'coupleBeforeStartingCallCenter',
        'beforeNonPaymentEvent' => 'coupleBeforeNonPaymentEvent',
    ];

    /**
     * Init modules
     */
    public function __construct() {
        $this->config = include('config.php');
        $this->smsConfig = $this->config['cellact'];
        $this->confirmUrl = $this->config['confirmUrl'];
        $this->smsStatusUrl = $this->config['smsStatusUrl'];
        $this->eventStatusList = $this->config['eventStatusList'];
        $this->eventStatusListReverse = $this->config['eventStatusListReverse'];

        require 'vendor/autoload.php';

        $parseConfig = $this->config['parse'];

        ParseClient::initialize($parseConfig['appId'], $parseConfig['restKey'], $parseConfig['masterKey']);
    }

    /**
     * Run invite notificator
     * @throws \Exception
     */
    public function run()
    {

//        $date = new \DateTime('2015-11-17 11:01:00');
        $date = new \DateTime(date('Y-m-d H:i'));

//        $date->modify("-2 hours");

        try {

            //disable events
            $this->disableEvent($date);

            //get events for first and second Wave and notify them
            $firstWave = $this->getWaveEvent($date, self::FIRST_WAVE_FIELD);
            $secondWave = $this->getWaveEvent($date, self::SECOND_WAVE_FIELD);
            $this->notifyWave($firstWave, self::FIRST_WAVE_FIELD, self::FIRST_WAVE_STARTED, self::FIRST_WAVE_DONE);
            $this->notifyWave($secondWave, self::SECOND_WAVE_FIELD, self::SECOND_WAVE_STARTED, self::SECOND_WAVE_DONE);

            //send reminder about starting call center
            $callCenter = $this->getCoupleRemindCallCenter($date);
            $this->sendCoupleRemindCallCenter($callCenter);

            //send notify couple that Call Center started
            $callCenter = $this->getCoupleCallCenterStarted($date);
            $this->sendCoupleCallCenterStarted($callCenter);

            //get events for IVR
            $ivrEvent = $this->getIVREvent($date);
            $this->notifyIVR($ivrEvent);

            //get event for couple alert
            $alertEvent = $this->getCoupleAlertEvent($date);
            $this->sendAlert($alertEvent);

            //send event statuses
            $eventStatuses = $this->getStatusAlertEvent($date);
            $this->sendEventStatus($eventStatuses, $date);

            //send reminder to contacts
            $remindEvent = $this->getRemindEvent($date);
            $this->sendRemind($remindEvent);

            //send reminder about non-payment to couple
            $nonPaymentEvent = $this->getEventBeforeNonPayment($date);
            $this->sendNonPaymentEvent($nonPaymentEvent);

            //send instructions to couple
            $instructionEvent = $this->getInstructionEvent();
            $this->sendInstruction($instructionEvent);

        } catch (ParseException $e) {
            echo $e->getCode();
            echo $e->getMessage();
        }

        echo "<br>done";
    }

    public function test()
    {
        $text = 'Test message';
//        $phone = '+972526826262';
        $phone = '+972521111111';

        $param = $this->smsConfig;
        $param['CONTENT'] = $text;
        $param['TO'] = $phone;

        $result = $this->makePostRequest($param);

        print_r($result);

        die('the test');
    }

    /**
     * Write simple log to the file system
     * @param $fileName
     * @param $message
     */
    protected function log($fileName, $message)
    {
        $message = date('Y-m-d H:i:s') . ' ' . $message . PHP_EOL;
        file_put_contents(__DIR__ . '/temp/' . $fileName, $message, FILE_APPEND | LOCK_EX);
    }

    public function disableEvent($date)
    {
        //disable by expiration date
        $expirationDate = clone $date;
        $expirationDate->modify("-7 days");
        $this->disableEventByExpirationDate($expirationDate);

        //disable not paid
        $paidDate = clone $date;
        $paidDate->modify("-3 days");
        $this->disableNotPaidEvent($paidDate);

    }

    /**
     * Disable not paid events
     * @param $paidDate
     * @throws \Exception
     */
    public function disableNotPaidEvent($paidDate)
    {
        $query = new ParseQuery('Event');
        $query->lessThan('createdAt', $paidDate);
        $query->doesNotExist('disabledAt');
        $query->notEqualTo('paymentDone', true);

        $list = $query->find();

        foreach ($list as $event) {
            $event->set('disabledAt', new \DateTime(date('Y-m-d H:i')));
            $event->set('eventStatus', $this->eventStatusListReverse[self::NOT_PAID]);
            $event->save();
            $this->log('event.log', 'EventId: ' . $event->getObjectId() . ' CoupleId: ' . $event->get('coupleId') .
                '. Disabled. Event not payed.');
        }
    }

    /**
     * Disable events by expiration date
     * @param $expirationDate
     * @throws \Exception
     */
    public function disableEventByExpirationDate($expirationDate)
    {
        $query = new ParseQuery('Event');
        $query->lessThanOrEqualTo('date', $expirationDate);
        $query->doesNotExist('disabledAt');

        $list = $query->find();

        foreach ($list as $event) {
            $event->set('disabledAt', new \DateTime(date('Y-m-d H:i')));
            $event->set('eventStatus', $this->eventStatusListReverse[self::PASSED]);
            $event->save();
            $this->log('event.log', 'EventId: ' . $event->getObjectId() . ' CoupleId: ' . $event->get('coupleId') .
                '. Disabled by expiration date: ' . $event->get('date')->format('Y-m-d H:i:s'));
        }
    }

    /**
     * Prepare text for send
     * @param $alertText
     * @param $replaceParameters
     * @return mixed
     * @internal param $key
     * @internal param $value
     */
    public function prepareTextForSend($alertText, $replaceParameters)
    {
        $pattern = [];
        //prepare pattern for replacement
        foreach($replaceParameters as $key=>$value) {
            array_push($pattern, "/%".$key."%/");
        }
        $alertText = preg_replace($pattern, $replaceParameters, $alertText);
        return $alertText;
    }


    /**
     * Execute ajax methods
     * @POST action
     *
     */
    public function ajax()
    {
        $postData = file_get_contents("php://input");
        $request = (array)json_decode($postData);

        $action = isset($request['action']) ? $request['action'] : '';
        if($action == 'sendAlertTemplate') {
            $actionList = [
                'sendAlertTemplate' => true,
            ];
        } elseif($action == 'setEventStatus') {
            $actionList = [
                'setEventStatus' => true,
            ];
        }

        try {
            if (!$action || !isset($actionList[$action]) || !$actionList[$action]) {
                throw new \Exception('Wrong action');
            }

            $methodName = $action . 'Action';
            $this->$methodName($request);
        } catch (\Exception $e) {
            echo $e->getMessage();
        }
    }

    /**
     * Send alert with template action
     * @param $request
     * @throws ParseException
     * @throws \Exception
     */
    protected function sendAlertTemplateAction($request)
    {
        //send alert to couple
        $eventId = isset($request['eventId']) ? $request['eventId'] : '';
        $actionName = isset($request['actionName']) ? $request['actionName'] : '';
        if (!$eventId || !$actionName || !isset($this->templateList[$actionName])) {
            throw new \Exception('Parameters not sent!');
        }

        $query = new ParseQuery('Event');
        $event = $query->get($eventId);
        $this->sendAlertTemplate($actionName, $event);
    }

    /**
     * @param $request
     * @throws ParseException
     * @throws \Exception
     */
    protected function setEventStatusAction($request)
    {
        //change status of event
        $eventId = isset($request['eventId']) ? $request['eventId'] : '';
        $eventStatusId = isset($request['eventStatusId']) ? $request['eventStatusId'] : '';
        if (!$eventId || !$eventStatusId && $eventStatusId !== 0) {
            throw new \Exception('Parameters not sent!');
        }
        $query = new ParseQuery('Event');
        $event = $query->get($eventId);
        $event->set('eventStatus', $eventStatusId);
        $event->save();
    }

    /**
     * Get events for reminder
     * @param $date
     * @return \Parse\ParseObject[]
     */
    public function getRemindEvent($date)
    {
        $query = new ParseQuery('Event');
        $query->limit(1000);
        $query->equalTo('smsRemind', true);
        $query->equalTo('smsRemindDate', $date);
        $query->equalTo('smsAllowed', true);

        return $query->find();
    }

    /**
     * Get events with non-payment
     * @param $date
     * @return \Parse\ParseObject[]
     */
    public function getEventBeforeNonPayment($date)
    {
        $newDate = clone $date;
        $newDate->modify("-2 days");
        $less = clone $newDate;
        $less->modify("+1 minutes");

        $query = new ParseQuery('Event');
        $query->limit(1000);
        $query->lessThan("createdAt", $less);
        $query->greaterThanOrEqualTo("createdAt", $newDate);
        $query->doesNotExist('disabledAt');
        $query->notEqualTo('paymentDone', true);

        return $query->find();
    }

    /**
     * Send alert with non-payment events
     * @param $eventList
     * @throws \Exception
     */
    public function sendNonPaymentEvent($eventList)
    {
        foreach ($eventList as $event) {

            //send email
            $emailText = $this->getTemplate('templates/email/beforeNonPaymentEvent.php', []);
            $emailList = [
                $event->get('groomEmail'),
                $event->get('brideEmail'),
            ];

            $email = new \Email();
            $subject = 'No payment was done on your account';
            $email->send($emailText, $subject, 'info@easy2give.co.il', 'Easy2give', $emailList);

            //send sms
            $this->sendAlertTemplate('beforeNonPaymentEvent', $event);
        }
    }

    /**
     * Get events for reminding before starting call center
     * @param $date
     * @return \Parse\ParseObject[]
     */
    public function getCoupleRemindCallCenter($date)
    {
        $newDate = clone $date;
        $newDate->modify("-1 days");
        $query = new ParseQuery("Event");
        $query->limit(1000);
        $query->equalTo("secondWave", $newDate);
        $query->equalTo("callRSVP", true);
        $query->exists("callCenter");
        $query->notEqualTo("callCenter", NULL);
        return $query->find();
    }

    /**
     * Send reminder before starting a call center to couple
     * @param $eventList
     * @throws \Exception
     */
    public function sendCoupleRemindCallCenter($eventList)
    {
        foreach ($eventList as $event) {
            $replaceParameters = array(
                'callCenter' => $event->callCenter->format('Y-m-d'),
                'callTeamLimit' => $event->callTeamLimit ? $event->callTeamLimit : 'all'
            );
            $this->sendAlertTemplate('remindCallCenterStart', $event, $replaceParameters);
        }
    }

    /**
     * Get events for reminding that call center started
     * @param $date
     * @return \Parse\ParseObject[]
     */
    public function getCoupleCallCenterStarted($date)
    {
        $query = new ParseQuery("Event");
        $query->limit(1000);
        $query->equalTo("callCenter", $date);
        $query->equalTo("callRSVP", true);
        return $query->find();
    }

    /**
     * Send reminder that call center started
     * @param $eventList
     * @throws \Exception
     */
    public function sendCoupleCallCenterStarted($eventList)
    {
        foreach ($eventList as $event) {
            $event->set('eventStatus', $this->eventStatusListReverse[self::CALL_CENTER_STARTED]);
            $event->save();
            $this->sendAlertTemplate('callCenter', $event);
        }
    }

    /**
     * Get events for send event status
     * @param $date
     * @return \Parse\ParseObject[]
     */
    public function getStatusAlertEvent($date)
    {
        $newDate = clone $date;
        $newDate->modify("+1 days");

        $firstWave = new ParseQuery("Event");
        $firstWave->equalTo("firstWave", $newDate);
        $firstWave->equalTo('smsAllowed', true);


        $secondWave = new ParseQuery("Event");
        $secondWave->equalTo("secondWave", $newDate);
        $secondWave->equalTo('smsAllowed', true);

        $callCenter = new ParseQuery("Event");
        $callCenter->equalTo("callCenter", $newDate);
        $callCenter->equalTo("callRSVP", true);

        $mainQuery = ParseQuery::orQueries([$firstWave, $secondWave, $callCenter]);
        $mainQuery->limit(1000);
        return $mainQuery->find();
    }

    /**
     * Send event status to couple
     * @param $eventList
     * @throws \Exception
     */
    public function sendEventStatus($eventList, $date)
    {
        $newDate = clone $date;
        $newDate->modify("+1 days");

        foreach ($eventList as $event) {
            //check ivrAllowed for initialize variable of checks event status
            $eventStatus = $event->ivrAllowed ? self::EVENT_STATUS_IVR_DONE : self::EVENT_STATUS_SECOND_WAVE_DONE;

            //sending alert before starting first wave
            if($event->eventStatus == self::EVENT_STATUS_NEW_EVENT && !strcmp($event->firstWave->format('Y-m-d H:i'), $newDate->format('Y-m-d H:i'))) {
                $this->sendAlertTemplate('beforeStartingFirstWave', $event);
            }
            //sending alert before starting second wave
            else if($event->eventStatus == self::EVENT_STATUS_FIRST_WAVE_DONE && !strcmp($event->secondWave->format('Y-m-d H:i'), $newDate->format('Y-m-d H:i'))) {
                $this->sendAlertTemplate('beforeStartingSecondWave', $event);
            }
            //sending alert before starting call center
            else if ($event->eventStatus == $eventStatus && !strcmp($event->callCenter->format('Y-m-d H:i'), $newDate->format('Y-m-d H:i'))) {
                $this->sendAlertTemplate('beforeStartingCallCenter', $event);
            }
        }
    }

    /**
     * Get events for instruction sending
     * @return \Parse\ParseObject[]
     */
    public function getInstructionEvent()
    {
        $query = new ParseQuery('Event');
        $query->limit(1000);
        $query->equalTo('isInstructionSent', false);

        return $query->find();
    }

    /**
     * Send instruction to couple to email and sms
     * @param $eventList
     */
    public function sendInstruction($eventList)
    {
        foreach ($eventList as $event) {

            //prepare params for template
            $paramList = [
                'url' => $this->config['url'],
                'bitlyUrl' => $this->config['bitlyUrl'],
                'coupleId' => $event->get('coupleId'),
                'password' => $event->get('password'),
            ];

            //send email
            $emailText = $this->getTemplate('templates/email/instruction.php', $paramList);
            $emailList = [
                $event->get('groomEmail'),
                $event->get('brideEmail'),
            ];
            $email = new \Email();
            $subject = 'Easy2Give מודה לכם שהצטרפתם לשירות וידואי הגעה לאירוע - להלן פרטי הכניסה שלכם';
            $email->send($emailText, $subject, 'info@easy2give.co.il', 'Easy2give', $emailList);

            //send sms
            $smsText = $this->getTemplate('templates/sms/instruction.php', $paramList);
            $phoneList = ['groomPhone', 'bridePhone'];

            foreach ($phoneList as $phoneItem) {
                $phone = $this->preparePhone($event->get($phoneItem));

                $response = $this->sendSms($phone, $smsText);

                $status = $response['success'] ? self::SMS_STATUS_SENT : self::SMS_STATUS_ERROR;

                $this->logSmsStatus($event, null, 'instruction', $phone, $smsText, $status, $response['errorText'], $response['session']);
            }

            $event->set('isInstructionSent', true);
            $event->save();
        }
    }

    /**
     * Get template for resource
     * @param $filename
     * @param $paramList
     * @return bool|string
     */
    protected function getTemplate($filename, Array $paramList)
    {
        if (is_file($filename)) {
            ob_start();
            extract($paramList);
            include $filename;
            $contents = ob_get_contents();
            ob_end_clean();
            return $contents;
        }
        return false;
    }

    /**
     * Send reminder to contacts
     * @param $eventList
     * @throws \Exception
     */
    public function sendRemind($eventList)
    {
        foreach ($eventList as $event) {

            $contactList = $this->getContactForRemind($event);

            $smsText = $event->get('smsRemindText');

            foreach ($contactList as $contact) {
                $phone = $this->preparePhone($contact->get('phone'));
                if ($phone) {

                    $response = $this->sendSms($phone, $smsText);

                    $status = $response['success'] ? self::SMS_STATUS_SENT : self::SMS_STATUS_ERROR;

                    $this->logSmsStatus($event, $contact, 'smsReminder', $phone, $smsText, $status, $response['errorText']);
                } else {
                    $this->logSmsStatus($event, $contact, 'smsReminder', $contact->get('phone'), '', self::SMS_STATUS_ERROR, 'Wrong phone number format.');
                }
            }
        }
    }

    /**
     * Get event for couples alert
     * @param $date
     * @return array
     * @throws \Exception
     */
    public function getCoupleAlertEvent($date)
    {
        $newDate = clone $date;
        $newDate->modify("+14 days");

        $query = new ParseQuery('Event');
        $query->limit(1000);
        $query->equalTo('date', $newDate);
        $query->equalTo('smsAllowed', true);

        $list = $query->find();

        $result = [];

        foreach ($list as $event) {
            if (!$event->get('firstWave') || !$event->get('secondWave')) {
                $result[] = $event;
            }
        }

        return $result;
    }

    /**
     * Send alert to couple
     * @param $eventList
     */
    public function sendAlert($eventList)
    {
        foreach ($eventList as $event) {
            $smsText = $event->get('coupleAlertText');

            $this->sendCoupleSms($smsText, $event, 'coupleAlert');
        }
    }

    /**
     * Send alert template to audience
     * @param $actionName
     * @param $event
     * @param array $replaceParameters
     * @return bool
     * @throws \Exception
     * @internal param null $replace
     */
    public function sendAlertTemplate($actionName, $event, $replaceParameters = [])
    {
        $template = $this->getAlertTemplate($actionName);
        if (!$template) {
            return false;
        }

        $alertText = $template->get('text');
        $alertText = $this->prepareTextForSend($alertText, $replaceParameters);
        //define send method name. For example "send+Couple+Sms"
        $methodName = 'send' . ucfirst($template->get('audience')) . ucfirst($template->get('type'));
        $this->$methodName($alertText, $event, $template->get('name'));
    }

    /**
     * Get alert template from DB
     * @param $actionName
     * @return array|bool|ParseObject
     */
    public function getAlertTemplate($actionName)
    {
        if (!isset($this->templateList)) {
            return false;
        }
        $templateName = $this->templateList[$actionName];

        $query = new ParseQuery('Template');
        $query->equalTo('name', $templateName);
        $template = $query->first();

        return $template;
    }

    /**
     * Send sms to couple (groom and bride)
     * @param $smsText
     * @param $event
     * @param $type
     */
    public function sendCoupleSms($smsText, $event, $type)
    {
        $phoneList = ['groomPhone', 'bridePhone'];

        foreach ($phoneList as $phoneItem) {
            $phone = $this->preparePhone($event->get($phoneItem));

            $response = $this->sendSms($phone, $smsText);

            $status = $response['success'] ? self::SMS_STATUS_SENT : self::SMS_STATUS_ERROR;

            $this->logSmsStatus($event, null, $type, $phone, $smsText, $status, $response['errorText'], $response['session']);
        }
    }

    /**
     * Get event list for a wave
     * @param \DateTime $date
     * @param $waveType
     * @return \Parse\ParseObject[]
     */
    public function getWaveEvent(\DateTime $date, $waveType)
    {
        $query = new ParseQuery('Event');
        $query->limit(1000);
        $query->equalTo($waveType, $date);
        $query->equalTo('smsAllowed', true);

        return $query->find();
    }

    /**
     * Get events for IVR notification
     * @param \DateTime $date
     * @return \Parse\ParseObject[]
     */
    public function getIVREvent(\DateTime $date)
    {
        $ivrDate = clone $date;
        $ivrDate->modify("-3 hours");
        $query = new ParseQuery('Event');
        $query->limit(1000);
        $query->equalTo('secondWave', $ivrDate);
        $query->equalTo('ivrAllowed', true);
        $query->equalTo('ivrRecordFile', true);

        return $query->find();
    }

    /**
     * Send IVR notify for each contact in event list
     * @param $eventList
     * @throws \Exception
     */
    public function notifyIVR($eventList)
    {
        foreach ($eventList as $event) {

            //change status that IVR started
            $event->set('eventStatus', $this->eventStatusListReverse[self::IVR_STARTED]);
            $event->save();

            //filter contact. send only for not sent contacts
            $contactList = $this->getContactForEvent($event);

            foreach ($contactList as $contact) {

                $phone = $this->preparePhone($contact->get('phone'));
                if ($phone) {

                    //send ivr
                    $response = $this->sendIVR($phone, $contact->getObjectId());

                    //update status
                    $status = $response['success'] ? self::SMS_STATUS_SENT : self::SMS_STATUS_ERROR;
                    $this->updateContactWaveStatus($contact, $status, 'ivr');

                    //write log
                    $this->logSmsStatus($event, $contact, 'IVR', $phone, '', $status, $response['errorText'], $response['session']);

                } else {

                }
            }

            //change status that IVR finished
            $event->set('eventStatus', $this->eventStatusListReverse[self::IVR_DONE]);
            $event->save();
        }
    }

    /**
     * Notify each contact for Wave
     * @param $eventList
     * @param $waveType
     * @param $waveStatusStart
     * @param $waveStatusEnd
     * @throws \Exception
     */
    public function notifyWave($eventList, $waveType, $waveStatusStart, $waveStatusEnd)
    {
        foreach ($eventList as $event) {

            //alert to couple that wave was started
            $this->sendAlertTemplate($waveType, $event);
            $event->set('eventStatus', $this->eventStatusListReverse[$waveStatusStart]);
            $event->save();
            //filter contact. send only for not sent contacts
            $contactList = $this->getContactForEvent($event);
            if ($event->get('isLimitWaves')) {
                $contactList = $this->filterContactListForWave($contactList, $event, $waveType);
            }

            foreach ($contactList as $contact) {
                $link = $this->getContactLink($contact->getObjectId());
                $phone = $this->preparePhone($contact->get('phone'));
//                $link = $this->getContactLink($contact->get('uniqueLinkId'));
                if ($link && $phone) {

                    if ($waveType == self::FIRST_WAVE_FIELD) {
                        $smsText = $event->get('firstWaveSmsText');
                    } else {
                        $smsText = $event->get('secondWaveSmsText');
                    }

                    $smsText .= ' ' . $link;

                    $response = $this->sendSms($phone, $smsText);

                    $status = $response['success'] ? self::SMS_STATUS_SENT : self::SMS_STATUS_ERROR;

                    $this->updateContactWaveStatus($contact, $status, $waveType);

                    $this->logSmsStatus($event, $contact, $waveType, $phone, $smsText, $status, $response['errorText'], $response['session']);
                } else {
                    if (!$phone) {
                        $this->logSmsStatus($event, $contact, $waveType, $contact->get('phone'), '', self::SMS_STATUS_ERROR, 'Wrong phone number format.');
                    } else if (!$link) {
                        $this->logSmsStatus($event, $contact, $waveType, $contact->get('phone'), '', self::SMS_STATUS_ERROR, 'Wrong sms link.');
                    }
                }
            }

            $event->set('eventStatus', $this->eventStatusListReverse[$waveStatusEnd]);
            $event->save();
        }
    }

    /**
     * Filter contact list
     * @param $eventContact
     * @param $event
     * @param $waveType
     * @return array
     */
    protected function filterContactListForWave($eventContact, $event, $waveType)
    {
        //filter by sms log
        //send only for not sent users
        $query = new ParseQuery('SmsLog');
        $query->limit(1000);
        $query->equalTo('event', $event);
        $query->equalTo('waveType', $waveType);
        $query->notContainedIn('status', array(self::SMS_STATUS_WAIT, self::SMS_STATUS_ERROR));
        $logContact = $query->find();

        //save existing contacts
        $existsContact = array();
        foreach ($logContact as $log) {
            $existsContact[$log->get('contact')->getObjectId()] = true;
        }

        //prepare new contact list without existing contacts
        $resultContact = array();
        foreach ($eventContact as $contact) {
            if (!isset($existsContact[$contact->getObjectId()])) {
                $resultContact[] = $contact;
            }
        }

        return $resultContact;
    }

    /**
     * Get sms log for event
     * @param $event
     * @return \Parse\ParseObject[]
     */
    public function getSmsLogForEvent($event)
    {
        $query = new ParseQuery('Contact');
        $query->limit(1000);
        $query->equalTo('event', $event);
        $query->containedIn('status', array(self::STATUS_NOT_RESPONDED, self::STATUS_MAYBE, self::STATUS_CONFIRMED));

        return $query->find();
    }

    /**
     * Build contact link according to code
     * @param $linkCode
     * @return string
     */
    public function getContactLink($linkCode)
    {
        return $linkCode ? $this->confirmUrl . '/c/' . $linkCode : false;
    }

    /**
     * Prepare phone number to standart
     * @param $phone
     * @return bool|mixed
     */
    public function preparePhone($phone)
    {
        //remove symbols
        $phone = preg_replace('/\D/', '', $phone);

        //check if 0 not exists for 9 symbols numbers
        if (preg_match('/^.{9,9}$/i', $phone)) {
            $phone = '0' . $phone;
        }

        //replace first 0 or 972 to +972
        $phone = preg_replace('/^0|^972/i', '+972', $phone);

        //allow only 13 character number which must start from +972
        if (preg_match('/^\+972[0-9]{9,9}$/i', $phone)) {
            return $phone;
        } else {
            return false;
        }
    }

    /**
     * Get contact list for an event
     * @param $event
     * @return \Parse\ParseObject[]
     */
    public function getContactForEvent($event)
    {
        $query = new ParseQuery('Contact');
        $query->limit(1000);
        $query->equalTo('event', $event);
        $query->containedIn('status', array(self::STATUS_NOT_RESPONDED, self::STATUS_MAYBE));

        return $query->find();
    }

    /**
     * Get contact list for remind
     * @param $event
     * @return \Parse\ParseObject[]
     */
    public function getContactForRemind($event)
    {
        $query = new ParseQuery('Contact');
        $query->limit(1000);
        $query->equalTo('event', $event);
        $query->containedIn('status', $event->get('smsRemindStatusList'));

        return $query->find();
    }

    /**
     * Set Wave SMS Status for contact
     * @param ParseObject $contact
     * @param $status
     * @param $waveType
     * @throws \Exception
     */
    public function updateContactWaveStatus(ParseObject $contact, $status, $waveType)
    {
        $contact->set($waveType, $status);
        $contact->save();
    }

    /**
     * Save Sms status to parse
     * @param ParseObject $event
     * @param ParseObject $contact
     * @param $waveType
     * @param $phone
     * @param $smsText
     * @param $status
     * @param $errorText
     * @param $session
     * @throws \Exception
     */
    public function logSmsStatus(
        ParseObject $event,
        $contact,
        $waveType,
        $phone,
        $smsText,
        $status,
        $errorText,
        $session = null
    ) {
        $smsLog = new ParseObject('SmsLog');
        $smsLog->set('event', $event);
        $smsLog->set('contact', $contact);
        $smsLog->set('phone', $phone);
        $smsLog->set('waveType', $waveType);
        $smsLog->set('smsText', $smsText);
        $smsLog->set('status', $status);
        $smsLog->set('state', $errorText);
        $smsLog->set('session', $session);

        try {
            $smsLog->save();
        } catch (ParseException $e) {
            $error = date('Y-m-d H:i:s') . ' ' . 'Failed to create new SMS LOG, with message: ' . $e->getMessage() . PHP_EOL;
            file_put_contents(__DIR__ . '/temp/error.log', $error, FILE_APPEND | LOCK_EX);
        }
    }

    /**
     * Send SMS to a contact
     * @param $phone
     * @param $text
     * @return boolean
     */
    public function sendSms($phone, $text)
    {

        //validate data
        if (!$phone || !$text) {
            return false;
        }

        $info = date('Y-m-d H:i:s') . ' - ' . $phone . ' ' . $text;

        $param = $this->smsConfig;
        $param['CONTENT'] = $text;
        $param['TO'] = $phone;

        //try send few times if parse xml error
        $attempt = 0;
        do {
            $attempt++;
            $result = $this->makePostRequest($param);
        } while ($result['errorText'] == 'Failed to parse xml' && $attempt <= 5);

        $info .= " Status: ";
        $info .= $result['success'] ? 'sent' : 'not sent. Error: ' . $result['errorText'];
        $info .= PHP_EOL;

        echo nl2br($info);

        file_put_contents(__DIR__ . '/temp/invite.log', $info, FILE_APPEND | LOCK_EX);

        return $result;
    }

    /**
     * Send request to IVR service
     * @param string $phone
     * @param string $contactId
     * @return array
     */
    public function sendIVR($phone = '', $contactId = '')
    {

        $url = 'http://www.micropay.co.il/ExtApi/ScheduleVms.php';

        $param = [
            'get' => 1,
            'uid' => 3590,
            'un' => 'mickey',
            'desc' => 'Test',
            'from' => '0722737082',
            'list' => $phone,
            'sid' => '38574',
            'retry' => 2,
            'retryint' => 1,
            'amd' => 3,
            'data' => $contactId,
        ];

        $data = $this->makeGetRequest($url, $param);

        echo 'IVR send: ' . $phone . '<br>';
        print_r($data);

        //prepare response
        $responce = ['success' => true, 'errorText' => null, 'session' => ''];

        return $responce;
    }

    /**
     * Make GET request to the service
     * @param url
     * @param $param
     * @return bool
     */
    public function makeGetRequest($url = null, $param = [])
    {
        if (!$url) {
            $url = self::SMS_GET_URL;
        }
        $url .= '?' . http_build_query($param);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        $data = curl_exec($ch);
        curl_close($ch);

        return $data;

    }

    /**
     * Make POST reque
     * @param $param
     * @return mixed
     */
    public function makePostRequest($param)
    {
        $cellact = new \Cellact($param['FROM'], $param['USER'], $param['PASSWORD']);
        $data = $cellact->sendRequest($param['SENDER'], $param['TO'], $param['CONTENT'], $this->smsStatusUrl);

        return $this->prepareResponse($data);
    }

    /**
     * Convert XML response to array
     * @param $data
     * @return array
     */
    protected function prepareResponse($data)
    {
        $xml = simplexml_load_string($data);
        $response = unserialize(serialize(json_decode(json_encode((array)$xml), 1)));

        if (isset($response['RESULT']) && $response['RESULT'] == 'True') {
            return ['success' => true, 'errorText' => null, 'session' => $response['SESSION']];
        } else {
            return ['success' => false, 'errorText' => isset($response['DESCRIPTION']) ? $response['DESCRIPTION'] : '', 'session' => null];
        }
    }
}