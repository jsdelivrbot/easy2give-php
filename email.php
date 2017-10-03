<?php

class Email {

    protected $config;
    protected $service;

    public function __construct()
    {
        $this->config = include('config.php');
        $this->service = new Mandrill($this->config['mandrillApiKey']);
    }

    /**
     * Send emails
     * @param $html
     * @param $subject
     * @param $fromEmail
     * @param $fromName
     * @param array $toList
     * @return bool
     */
    public function send($html, $subject, $fromEmail, $fromName, Array $toList)
    {
        $message = array(
            'html' => $html,
            'subject' => $subject,
            'from_email' => $fromEmail,
            'from_name' => $fromName,
        );

        //add email list
        foreach($toList as $to) {
            if (!$to) {
                continue;
            }
            $message['to'][] = array(
                'email' => $to,
                'type' => 'to',
            );
        }

        //stop if email list is empty
        if (!isset($message['to'])) {
            return false;
        }

        try {
            $result = $this->service->messages->send($message);
        } catch(Mandrill_Error $e) {
            // Mandrill errors are thrown as exceptions
            echo 'A mandrill error occurred: ' . get_class($e) . ' - ' . $e->getMessage();
            // A mandrill error occurred: Mandrill_Unknown_Subaccount - No subaccount exists with the id 'customer-123'
//            throw $e;
        }
    }
}