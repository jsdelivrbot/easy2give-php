Date.parseDate = function(input, format) {
  return moment(input, format).toDate();
};
Date.prototype.dateFormat = function(format) {
  return moment(this).format(format);
};

var e2gApp = angular.module('e2gApp', [
  'ngRoute',
  'ngMessages',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.cellNav',
  'ui.grid.exporter',
  'ui.grid.autoResize',
  'ngFileUpload',
  'LocalStorageModule',
  'checklist-model',
  'angular-intro',
  'systemMessage',
  'exceptionOverride',
  'connection',
  'e2gApp.date',
  'ui.bootstrap'
]);

e2gApp
  .constant('statusList', {
    'confirmed': 0,
    'maybe': 1,
    'notComing': 2,
    'notResponded': 3
  })
  .constant('statusListReverse', {
    0: 'אושר',
    1: 'אולי',
    2: 'לא מגיע',
    3: 'לא ענה'
  })
  .constant('statusListHe', {
    'אושר': 0,
    'אולי': 1,
    'לא מגיע': 2,
    'לא ענה': 3
  })
  .constant('eventStatusList', {
    0: 'New event',
    1: 'First wave started',
    2: 'First wave done',
    3: 'Second wave started',
    4: 'Second wave done',
    5: 'IVR started',
    6: 'IVR done',
    7: 'Call center started',
    8: 'Call center done',
    99: 'Not paid',
    100: 'Passed'
  })
  .constant('eventStatusListReverse', {
    'New event': 0,
    'First wave started': 1,
    'First wave done': 2,
    'Second wave started': 3,
    'Second wave done': 4,
    'IVR started': 5,
    'IVR done': 6,
    'Call center started': 7,
    'Call center done': 8,
    'Not paid': 99,
    'Passed': 100
  })
  .constant('smsStatusList', {
    0: 'wait',
    1: 'error',
    2: 'sent to service',
    3: 'arrived to operator',
    4: 'blocked',
    5: 'delivered',
    6: 'did not arrive'
  })
  .constant('importColumns', {
    phone: 'טלפון',
    name: 'שם',
    whoFromName: 'מוזמן על ידי',
    numberOfGuests: 'אורחים',
    status: 'סטטוס',
    comments: 'הערות'
  })
  .constant('contactStatusUpdatedBy', {
    0: 'admin',
    1: 'SMS',
    2: 'couple',
    3: 'IVR',
    4: 'call center'
  })
  .constant('userTypes', {
    'admin': 0,
    'SMS': 1,
    'couple': 2,
    'IVR': 3,
    'call center': 4
  })
  .constant('settings', {
    'baseUrl': 'http://sms.easy2give.co.il',
    'firstWaveSmsText': 'שלום, הוזמנתם לחתונה של %brideName%' +
        ' ו- %groomName% בתאריך %date% לפרטים ואישור הגעה הכנסו לקישור:',
    'secondWaveSmsText': 'טרם עדכנת סטטוס הגעה לחתונה של %brideName%' +
        ' ו- %groomName% בתאריך %date%. לאישור הגעה הכנסו לקישור:',
    'coupleAlertText': 'טרם בחרתם את זמני שליחת הSMS לטובת אישורי ההגעה.' +
        ' לדיוק מירבי בתוצאות מומלץ לשלוח את הגל הראשון עשרה ימים לפני' +
        ' מועד האירוע ואת הגל השני 8-9 ימים לפני מועד האירוע.',
    'smsRemindText': 'אורחים יקרים, הערב תערך החתונה של %brideName% ו-%groomName% באולם/גן האירועים  %location%. ' +
        'להנחיות הגעה לחצו כאן - %locationLink% ' +
        'לנוחיותכם באירוע זה ניתן להעניק מתנה גם באמצעות כרטיס אשראי בכניסה לאולם או באתר easy2give.co.il/sms ' +
        'נשמח לראותכם :)'
  })
  .config(function($routeProvider) {
    $routeProvider
      .when('/', {
        controller: 'coupleCtrl',
        templateUrl: 'templates/couple.html'
      });
  });
