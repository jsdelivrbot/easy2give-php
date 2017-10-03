angular.module('connection', [])
  .constant('connect', {
    production: {
      applicationID: 'AafRRhim98ludlVVZbcW9E2QAr9omrDXUNXWAqdN',
      javaScriptKey: 'dKXRVjj6jWYAMlmSpnAVcDdvF6vdZsdirAPhDCY1'
    },
    test: {
      applicationID: '7ehy8Gq7XaBZxNVmBAq4VmD2JfLDq8g9OXInYaWJ',
      javaScriptKey: 'rVCqBDRNtRB9ByqZQ2ppBUK1AhiRc30XBIdo9YLP'
    }
  })
  .run(['$location', 'connect', function($location, connect) {
    (function() {
      //init connection to production database
      if ($location.$$host.match(/sms\.easy2give\.co\.il/g)) {
        Parse.initialize(connect.production.applicationID, connect.production.javaScriptKey);
        return;
      }
      //init connection to test database
      Parse.initialize(connect.test.applicationID, connect.test.javaScriptKey);
    })();
  }]);
