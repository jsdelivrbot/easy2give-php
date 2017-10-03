e2gApp.factory('ajaxService', ['$http', function($http) {

  function request(action, param, callback) {
    //param.push({action: action});
    param['action'] = action;
    $http.post('/ajax', param).success(function(response) {
      callback(response);
    });
  }

  function sendAlertTemplate(eventId, actionName) {
    request('sendAlertTemplate', {eventId: eventId, actionName: actionName}, function(response) {
      console.log(response);
    });
  }

  function setEventStatus(eventId, eventStatusId) {
    request('setEventStatus', {eventId: eventId, eventStatusId: eventStatusId}, function(response) {
      console.log(response);
    });
  }

  return {
    sendAlertTemplate: sendAlertTemplate,
    setEventStatus: setEventStatus
  };
}]);
