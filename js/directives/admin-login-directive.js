e2gApp.directive('adminLogin', [function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'templates/admin/admin-login-dialog.html',
    controller: ['$rootScope', '$scope', '$timeout', 'adminAuth',
      function($rootScope, $scope, $timeout, adminAuth) {
        $scope.user = adminAuth.getUser();

        $rootScope.$on('userLoggedOut', function() {
          $scope.openDialog();
        });

        $rootScope.$on('userLoggedIn', function() {
          $scope.closeDialog();
        });

        $scope.doLogin = function() {
          $timeout(function() {
            $scope.loginForm.submitted = true;
          }, 0);
          if ($scope.formLogin.$valid) {
            var userObj = {
              login: $scope.loginForm.login,
              password: $scope.loginForm.password
            };
            adminAuth.checkUser(userObj, function() {
              $scope.showError();
            });
          }
        };
      }],
    link: function(scope, element) {
      element.dialog({
        dialogClass: 'no-close',
        autoOpen: (scope.user) ? false : true,
        height: 'auto',
        width: 348,
        modal: true,
        buttons: {
          'כניסה': scope.doLogin
        }
      });
      scope.closeDialog = function() {
        element.dialog('close');
      };
      scope.openDialog = function() {
        element.dialog('open');
      };
      scope.showError = function() {
        angular.element('.login-error').fadeIn().delay(2000).fadeOut();
      };
    }
  };
}]);
