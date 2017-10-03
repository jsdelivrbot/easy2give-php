e2gApp.factory('ivrService', ['$http', function($http) {

  function request(action, param, callback) {
    var fd = new FormData();
    for (var index in param) {
      fd.append(index, param[index]);
    }
    $http.post('/ivr.php?action=' + action, fd, {
        transformRequest: angular.identity,
        headers: {'Content-Type': undefined}
      })
      .success(function(response) {
        callback(response);
      });

  }

  function saveRecord(objectId, record) {
    request('save-record',
      {eventId: objectId, file: record}, function(response) {
        console.log(response);
      });
  }

  return {
    saveRecord: saveRecord
  };
}]);
