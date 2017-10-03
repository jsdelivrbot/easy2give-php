e2gApp.controller('mainCtrl', ['$rootScope', '$scope', '$state', 'adminAuth',
  function($rootScope, $scope, $state, adminAuth) {
    setUser();

    $scope.logOut = function() {
      adminAuth.logOut();
    };

    $rootScope.$on('userLoggedIn', function() {
      setUser();
    });

    $rootScope.$on('userLoggedOut', function() {
      setUser();
    });

    $scope.$watch('user', function() {
      redirect();
    });

    function setUser() {
      $scope.user = adminAuth.getUser();
    }

    function redirect() {
      if (!$scope.user) {
        $state.go('app');
      } else if ($state.current.name === 'app') {
        if ($scope.user.login === 'admin') {
          $state.go('app.eventList');
          return;
        }
        $state.go('app.callTeam');
      }
    }
  }]);
