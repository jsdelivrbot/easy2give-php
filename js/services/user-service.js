e2gApp.factory('userService', [function() {

  var currentUser = {};

  function getCurrent() {
    return currentUser;
  }

  function getUserLogin(event, phoneNumber, callback) {

    var query = new Parse.Query(Parse.User);
    query.equalTo('phone_number', phoneNumber);
    query.equalTo('event', event);
    query.first({
      success: function(user) {
        if (user) {
          currentUser = user;
        }

        if (callback) {
          callback(user);
        }
      }
    });
  }

  return {
    getCurrent: getCurrent,
    getUserLogin: getUserLogin
  };
}]);
