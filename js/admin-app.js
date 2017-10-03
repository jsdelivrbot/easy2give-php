Date.parseDate = function(input, format) {
  return moment(input, format).toDate();
};
Date.prototype.dateFormat = function(format) {
  return moment(this).format(format);
};

var e2gApp = angular.module('e2gApp', [
  'ngMessages',
  'ui.router',
  'ui.select2',
  'ui.grid',
  'ui.grid.edit',
  'ui.grid.cellNav',
  'ui.grid.exporter',
  'ui.grid.autoResize',
  'LocalStorageModule',
  'checklist-model',
  'systemMessage',
  'ngFileUpload',
  'connection',
  'e2gApp.date',
  'ngDialog'
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
    .constant('callTeamStatusList', {
      'confirmed': 0,
      'maybe': 1,
      'notComing': 2,
      'called1outOf5': 3,
      'called2outOf5': 4,
      'called3outOf5': 5,
      'called4outOf5': 6,
      'called5outOf5': 7,
      'invalid': 8
    })
    .constant('callTeamStatusListReverse', {
      0: 'אושר',
      1: 'אולי',
      2: 'לא מגיע',
      3: 'התקשרו 1 מ5 פעמים',
      4: 'התקשרו 2 מ5 פעמים',
      5: 'התקשרו 3 מ5 פעמים',
      6: 'התקשרו 4 מ5 פעמים',
      7: 'התקשרו 5 מ5 פעמים',
      8: 'מספר לא נכון'
    })
    .constant('callTeamStatusListHe', {
      'אושר': 0,
      'אולי': 1,
      'לא מגיע': 2,
      'התקשרו פעם': 3,
      'התקשרו פעמיים': 4,
      'מספר לא נכון': 5
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
    .constant('smsStatusListReverse', {
      'wait': 0,
      'error': 1,
      'sent to service': 2,
      'arrived to operator': 3,
      'blocked': 4,
      'delivered': 5,
      'did not arrive': 6
    })
    .constant('importColumns', {
      phone: 'טלפון',
      name: 'שם',
      whoFromName: 'מוזמן על ידי',
      numberOfGuests: 'אורחים',
      status: 'סטטוס',
      comments: 'הערות'
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
      'smsRemindText': 'אורחים יקרים, הערב תערך ' +
      'החתונה של %brideName% ו-%groomName% באולם/גן האירועים  %location%. ' +
      'להנחיות הגעה לחצו כאן - %locationLink% ' +
      'לנוחיותכם באירוע זה ניתן להעניק מתנה גם באמצעות ' +
      'כרטיס אשראי בכניסה לאולם או באתר easy2give.co.il/sms ' +
      'נשמח לראותכם :)'
    })
    .constant('userList', [
      {
        login: 'admin',
        password: 'zaqpoi123'
      }, {
        login: 'callTeam',
        password: 'test'
      }
    ])
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
    .config(function($stateProvider, $urlRouterProvider) {
      $urlRouterProvider.otherwise('/');

      $stateProvider
          .state('app', {
            url: '/',
            templateUrl: 'templates/admin.html',
            controller: 'mainCtrl'
          })
          .state('app.eventList', {
            url: 'event-list/',
            templateUrl: 'templates/admin/event-list.html',
            controller: 'eventListCtrl'
          })
          .state('app.numbersExportOnlyEventList', {
            url: 'numbers-export-only-event-list/',
            templateUrl: 'templates/admin/event-list.html',
            controller: 'eventListCtrl'
          })
          .state('app.editEvent', {
            url: 'edit-event/:eventId',
            templateUrl: 'templates/admin/edit-event.html',
            controller: 'editEventCtrl'
          })
          .state('app.eventPlacesList', {
            url: 'event-places-list/',
            templateUrl: 'templates/admin/event-places-list.html',
            controller: 'eventPlacesListCtrl'
          })
          .state('app.editEventPlace', {
            url: 'edit-event-place/:placeId',
            templateUrl: 'templates/admin/edit-event-place.html',
            controller: 'editEventPlaceCtrl'
          })
          .state('app.smsLog', {
            url: 'sms-log/:eventId',
            templateUrl: 'templates/admin/sms-log.html',
            controller: 'smsLogCtrl'
          })
          .state('app.contactStatusLog', {
            url: 'contact-status-log/:eventId',
            templateUrl: 'templates/admin/contact-status-log.html',
            controller: 'contactStatusLogCtrl'
          })
          .state('app.callTeam', {
            url: 'call-team/',
            templateUrl: 'templates/admin/call-team.html',
            controller: 'callTeamCtrl'
          })
          .state('app.callTeamGuestList', {
            url: 'call-team/guest-list/:eventId',
            templateUrl: 'templates/admin/call-team-guest-list.html',
            controller: 'callTeamGuestListCtrl'
          })
          .state('app.importProviderNumbers', {
            url: 'import-provider-numbers/',
            templateUrl: 'templates/admin/import-provider-numbers.html',
            controller: 'importProviderNumbersCtrl'
          })
          .state('app.errorLog', {
            url: 'error-log/',
            templateUrl: 'templates/admin/error-log.html',
            controller: 'errorLogCtrl'
          })
          .state('app.template', {
            url: 'template/',
            templateUrl: 'templates/admin/edit-template.html',
            controller: 'templateCtrl'
          })
          .state('app.changesLog', {
            url: 'changes-log/',
            templateUrl: 'templates/admin/changes-log.html',
            controller: 'changesLogCtrl'
          });
    })
    .filter('status', ['statusListReverse', function(statusListReverse) {
      return function(input) {
        return statusListReverse[input];
      };
    }])
    .filter('callTeamStatus', ['callTeamStatusListReverse',
      function(callTeamStatusListReverse) {
        return function(input) {
          return callTeamStatusListReverse[input];
        };
      }]);
