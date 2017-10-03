angular.module('exceptionOverride', [])
  .factory('$exceptionHandler', ['$log', function($log) {
    function saveErrorToLog(error, type) {
      var ErrorLog = Parse.Object.extend('ErrorLog');
      var newErrorLog = new ErrorLog();
      var errorType = type ? type : error.name;

      newErrorLog.set('message', error.message);
      newErrorLog.set('type', errorType);

      newErrorLog.save();
    }

    return function(error, type) {
      $log.error(error);
      saveErrorToLog(error, type);
    };
  }]);
