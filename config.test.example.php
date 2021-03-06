<?php

/**
 * Invite application configuration file
 */

return array(
    'confirmUrl' => 'http://easy2give.xf0.ru/',
    'smsStatusUrl' => 'http://easy2give.xf0.ru//sms-status',
    'eventPlaceUrl' => 'http://easy2give.xf0.ru/p/',
    'parse' => array(
        'appId' => '7ehy8Gq7XaBZxNVmBAq4VmD2JfLDq8g9OXInYaWJ',
        'restKey' => 'gdU9WRDk8Tr5NLZVo7luCacNvTdr1BPFEddlNXU3',
        'masterKey' => 'qJoRLEHePbuhbv462Sh6XfhVEo3uLcdR9ACkGHkB'
    ),
    'cellact' => array(
        'FROM' => 'easy2give',
        'APP' => 'LA',
        'USER' => 'easy2give',
        'PASSWORD' => 'dsv5gT6f',
        'CMD' => 'sendtextmt',
        'SENDER' => 'easy2give',
    ),
    'eventStatusList' => array(
        0 => 'New event',
        1 => 'First wave started',
        2 => 'First wave done',
        3 => 'Second wave started',
        4 => 'Second wave done',
        5 => 'IVR started',
        6 => 'IVR done',
        7 => 'Call center started',
        8 => 'Call center done',
        99 => 'Not paid',
        100 => 'Passed'
    ),
    'eventStatusListReverse' => array(
        'New event' => 0,
        'First wave started' => 1,
        'First wave done' => 2,
        'Second wave started' => 3,
        'Second wave done' => 4,
        'IVR started' => 5,
        'IVR done' => 6,
        'Call center started' => 7,
        'Call center done' => 8,
        'Not paid' => 99,
        'Passed' => 100
    ),
    'smsStatusList' => array(
        0 => 'wait',
        1 => 'error',
        2 => 'sent to service',
        3 => 'arrived to operator',
        4 => 'blocked',
        5 => 'delivered',
        6 => 'did not arrive'
    ),
    'smsStatusListReverse' => array(
        'wait' => 0,
        'error' => 1,
        'sent to service' => 2,
        'arrived to operator' => 3,
        'blocked' => 4,
        'delivered' => 5,
        'did not arrive' => 6
    ),
    'mandrillApiKey' => '7NP3QVsNhHLKpwmv9oNvWg',
    'url' => [
        'appstore' => 'https://itunes.apple.com/il/app/easy2give/id1062335549',
        'googlePlay' => 'https://play.google.com/store/apps/details?id=app.com.itomych.easy2give',
        'youtube' => 'http://youtube.com',
        'guestTable' => 'http://easy2give.xf0.ru/',
    ],
    'bitlyUrl' => [
        'appstore' => 'http://apple.co/1R6V2yO',
        'googlePlay' => 'http://bit.ly/1QL6BpW',
        'youtube' => 'http://youtube.com',
        'guestTable' => 'http://bit.ly/221TeZG',
    ],
    'adminEmail' => [
        'serhiilarionov@gmail.com',
        'natalia@simpleidea.us'
    ],
    'clientEmail' => [
        'serhiilarionov@gmail.com',
        'natalia@simpleidea.us',
        'danit@easy2give.co.il',
        'natalia@simpleidea.us'
    ]
);