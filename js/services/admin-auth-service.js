e2gApp.service('adminAuth', ['$rootScope', 'localStorageService', 'userList',
  'userTypes',
  function($rootScope, localStorageService, userList, userTypes) {
    var self = this;
    var user = null;

    self.getUser = function() {
      return user;
    };

    self.checkUser = function(userObj, callback) {
      userList.forEach(function(u, i, arr) {
        if (JSON.stringify(userObj) === JSON.stringify(u)) {
          self.setUser(u);
        } else if (callback && i === (arr.length - 1)) {
          callback();
        }
      });
    };

    self.setUser = function(userObj) {
      user = userObj;
      if (user) {
        switch (user.login) {
          case 'admin':
            localStorageService.set('userType', userTypes.admin);
            break;
          case 'callTeam':
            localStorageService.set('userType', userTypes['call center']);
            break;
          default:
            return;
        }
        localStorageService.set('adminPanelLogin', userObj.login);
        localStorageService.set('adminPanelPassword', userObj.password);
        $rootScope.$broadcast('userLoggedIn');
      } else {
        localStorageService.remove('adminPanelLogin');
        localStorageService.remove('adminPanelPassword');
        $rootScope.$broadcast('userLoggedOut');
      }
    };

    self.logOut = function() {
      self.setUser(null);
    };

    // check localStorage for user
    (function() {
      var userObj = {
        login: localStorageService.get('adminPanelLogin') ?
          localStorageService.get('adminPanelLogin') : null,
        password: localStorageService.get('adminPanelPassword') ?
          localStorageService.get('adminPanelPassword').toString() :
          null
      };

      self.checkUser(userObj);
    })();

  }]);
