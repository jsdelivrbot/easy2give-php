e2gApp.factory('smsLogService', [function() {

  function getForEvent(event, callback) {
    var Log = Parse.Object.extend('SmsLog');
    var logQuery = new Parse.Query(Log);
    logQuery.limit(1000);

    logQuery.equalTo('event', event);

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
    getForEvent: getForEvent
  };
}]);
