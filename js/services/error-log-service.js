e2gApp.factory('errorLogService', [function() {

  function getLog(callback) {
    var Log = Parse.Object.extend('ErrorLog');
    var logQuery = new Parse.Query(Log);
    logQuery.limit(1000);

    logQuery.find({
      success: function(respondObj) {
        var list = [];
        var i = 0;
        for (key in respondObj) {
          list[i] = respondObj[key].toJSON();
          i++;
        }
        if (callback) {
          callback(list);
        };
      }
    });
  }

  return {
    getLog: getLog
  };
}]);
