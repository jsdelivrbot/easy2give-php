<?php namespace invite;

use FFMpeg\FFMpeg;
use FFMpeg\Format\Audio\Mp3;
use Parse\ParseClient;
use Parse\ParseException;
use Parse\ParseObject;
use Parse\ParseQuery;

$ivr = new Ivr();

$action = $_GET['action'];

switch ($action) {
    case 'save-record':
        $file = isset($_FILES['file']) ? $_FILES['file'] : null;
        $eventId = isset($_POST['eventId']) ? $_POST['eventId'] : null;

        $ivr->saveRecord($eventId, $file);
        break;

    case 'ivr-mp3':

        $contactId = isset($_GET['lastnum']) ? $_GET['lastnum'] : null;
        if (!$contactId) {
            die('Contact is not set');
        }

        $ivr->redirectToRecord($contactId);
        break;

    case 'ivr-responce':

        $contactId = isset($_GET['data1']) ? $_GET['data1'] : null;
        $response = isset($_GET['data2']) ? intval($_GET['data2']) : null;
        if (!$contactId || $response === null) {
            die('Contact or response is not set');
        }
        $ivr->saveResponse($contactId, $response);

        break;

    case 'convert-record':

        $eventId = 'MRRINCyn9P';
        $uploadPath = __DIR__ . '/ivr/mp3/' . $eventId;
        $ivr->convertRecord($uploadPath . '/record.m4a', $uploadPath . '/record.mp3');

        break;
}

class Ivr {

    protected $config = [];

    const RECORD_PATH = '/ivr/mp3/';
    const CONTACT_STATUS_UPDATED_BY = 3;
    const RECORD_NAME = 'record.mp3';

    /**
     * Contact status for notify
     */
    const STATUS_CONFIRMED = 0;
    const STATUS_NOT_COMING = 2;

    /**
     * Init modules
     */
    public function __construct() {
        $this->config = include('config.php');
        $parseConfig = $this->config['parse'];
        $this->smsConfig = $this->config['cellact'];
        $this->confirmUrl = $this->config['confirmUrl'];
        $this->smsStatusUrl = $this->config['smsStatusUrl'];

        require 'vendor/autoload.php';
        ParseClient::initialize($parseConfig['appId'], $parseConfig['restKey'], $parseConfig['masterKey']);
    }


    /**
     * Save response from IVR service
     * @param $contactId
     * @param $response
     * @throws ParseException
     * @throws \Exception
     */
    public function saveResponse($contactId, $response)
    {
        //event contact
        $query = new ParseQuery('Contact');
        $contact = $query->get($contactId);

        //transform ivr status to system status
        $numberOfGuests = 0;
        if ($response > 0) {
            $status = self::STATUS_CONFIRMED;
            $numberOfGuests = $response;
        } else {
            $status = self::STATUS_NOT_COMING;
        }

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

        if ($numberOfGuests && $contact->get('numberOfGuests') != $numberOfGuests) {
            $log->set('numberOfGuestsOld', $contact->get('numberOfGuests'));
            $log->set('numberOfGuestsNew', $numberOfGuests);
            $contact->set('numberOfGuests', $numberOfGuests);
        }

        $log->set('updatedBy', self::CONTACT_STATUS_UPDATED_BY);
        $log->save();

        //save contact
        $contact->set('status', $status);
        $contact->save();

    }

    /**
     * Get record and redirect request to record
     * @param $contactId
     * @throws ParseException
     * @throws \Exception
     */
    public function redirectToRecord($contactId)
    {
        //event contact
        $query = new ParseQuery('Contact');
        $contact = $query->get($contactId);

        $event = $contact->get('event');
        $event->fetch();

        //get record for event or default record
        if ($event->get('ivrRecordFile')) {
            $url = $this->config['confirmUrl'] . self::RECORD_PATH . $event->getObjectId() . '/' . self::RECORD_NAME;
        } else {
            $url = $this->config['confirmUrl'] . self::RECORD_PATH . self::RECORD_NAME;
        }

        //redirect to url
        header("Location: " . $url);
        die();

    }

    /**
     * Save mp3 record to the file system
     * @param $eventId
     * @param $file
     */
    public function saveRecord($eventId = null, $file = null)
    {
        try {

            if (!$eventId || !$file || !isset($file['size']) || !isset($file['name'])) {
                throw new \Exception('Data not sent');
            }

            //check file size in MB
            $maxSize = 10;
            if ($file['size'] > 1024 * 1024 * $maxSize) {
                throw new \Exception('File is too large. Max file size is ' . $maxSize . 'MB');
            }

            //check file extension
            $ext = pathinfo($file['name'], PATHINFO_EXTENSION);
            if ($ext != 'mp3' && $ext != 'm4a') {
                throw new \Exception("Error. File extension must be mp3 or m4a format");
            }

            if (!is_uploaded_file($file['tmp_name'])) {

                //get error message
                $message = 'Error uploading file';
                switch ($file['error']) {
                    case UPLOAD_ERR_INI_SIZE:
                    case UPLOAD_ERR_FORM_SIZE:
                        $message .= ' - file too large (limit of ' . ini_get('upload_max_filesize') . ' bytes).';
                        break;
                    case UPLOAD_ERR_PARTIAL:
                        $message .= ' - file upload was not completed.';
                        break;
                    case UPLOAD_ERR_NO_FILE:
                        $message .= ' - zero-length file uploaded.';
                        break;
                    case UPLOAD_ERR_CANT_WRITE:
                        $message .= " - can't write file to the disc.";
                        break;
                    default:
                        $message .= ' - internal error #'.$file['error'];
                        break;
                }
                throw new \Exception($message);
            }

            //get event
            $query = new ParseQuery('Event');
            $event = $query->get($eventId);

            //upload file
            $tmpPath = self::RECORD_PATH . $eventId . '/record.' . $ext;
            $uploadPath = __DIR__ . self::RECORD_PATH . $eventId;
            $filePath = __DIR__ . $tmpPath;

            if (!is_dir($uploadPath)) {
                mkdir($uploadPath, 0777, true);
            }

            if (!move_uploaded_file($file['tmp_name'], $filePath)) {
                throw new \Exception("File uploading error. Try again");
            }

            if (!file_exists($filePath)) {
                throw new \Exception("Can't save file. Try again");
            }

            //convert file if not mp3
            if ($ext != 'mp3') {
                $resultUploadPath = $uploadPath . '/' . self::RECORD_NAME;
                $this->convertRecord($filePath, $resultUploadPath);

                if (!file_exists($resultUploadPath)) {
                    throw new \Exception("Can't convert file. Try again");
                }
            }

            //save event status
            $event->set('ivrRecordFile', true);
            $event->save();

            echo $this->config['confirmUrl'] . self::RECORD_PATH . $eventId . '/' . self::RECORD_NAME;

        } catch (\Exception $e) {
            echo $e->getMessage();
            header('HTTP/1.1 400 Bad Request');
            exit(0);
        }
    }

    /**
     * Convert record to mp3 format
     * @param $recordFile
     * @param $outputFile
     * @return bool
     */
    public function convertRecord($recordFile, $outputFile)
    {
        $ffmpeg = FFMpeg::create();
        $audio = $ffmpeg->open($recordFile);

        $format = new Mp3();
        $format
            ->setAudioChannels(2)
            ->setAudioKiloBitrate(128);

        $audio->save($format, $outputFile);

        return true;
    }
}