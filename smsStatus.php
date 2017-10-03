<?php
namespace invite;

use Parse\ParseClient;
use Parse\ParseException;
use Parse\ParseObject;
use Parse\ParseQuery;


$status = new smsStatus();
$status->run();

class smsStatus {

    protected $smsEventStateMessage = [
        'mt_ok' => 'The message has arrived to the mobile operator gateway.',
        'mt_nok' => 'The message did not arrive to the mobile operator gateway; message was blocked.',
        'mt_del' => 'The message has arrived to the mobile handset.',
        'mt_rej' => 'The message did not arrive to the mobile handset and will never reach it.'
    ];

    protected $smsEventStateStatus = [
        'mt_ok' => '3',
        'mt_nok' => '4',
        'mt_del' => '5',
        'mt_rej' => '6',
    ];

    /**
     * configuration
     * @var array
     */
    protected $config = [];

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
     * Run the application
     */
    public function run()
    {
        $xmlData = $_REQUEST['CONFIRMATION'];

        $data = $this->parseXml($xmlData);

//        $data = [
//            'BLMJ' => 'f0464155-3d20-4bec-a10a-7304018f3bc8',
//            'EVT' => 'mt_ok',
//            'REASON' => '5000',
//        ];

        $info = date('Y-m-d H:i:s') . PHP_EOL . print_r($data, true);

        file_put_contents(__DIR__ . '/temp/sms-status.log', $info, FILE_APPEND | LOCK_EX);

        if (isset($data['BLMJ']) && isset($data['EVT'])) {
            $reason = isset($data['REASON']) ? $data['REASON'] : '';
            $this->updateStatus($data['BLMJ'], $data['EVT'], $reason);
        }

        die('done');
    }

    /**
     * Update SMS status
     * @param $session
     * @param $state
     * @param $reason
     * @return bool
     * @throws \Exception
     */
    protected function updateStatus($session, $state, $reason = '')
    {
        $query = new ParseQuery('SmsLog');
        $query->equalTo('session', $session);

        $log = $query->first();

        //don't change status if already delivered
        if (!$log || $log->get('status') == $this->smsEventStateStatus['mt_del']) {
            return false;
        }

        //don't save arrived to the mobile status
        if ($state == 'mt_ok') {
            return false;
        }

        $text = isset($this->smsEventStateMessage[$state]) ? $this->smsEventStateMessage[$state] : $state;
        $status = isset($this->smsEventStateStatus[$state]) ? $this->smsEventStateStatus[$state] : $state;

        $log->set('state', $text);
        $log->set('reason', $reason);
        $log->set('status', intVal($status));
        $log->save();
        return true;
    }

    /**
     * Parse XML to Array
     * @param $data
     * @return mixed
     */
    protected function parseXml($data)
    {
        $xml = simplexml_load_string($data);
        $response = unserialize(serialize(json_decode(json_encode((array)$xml), 1)));

        return $response;
    }
}
