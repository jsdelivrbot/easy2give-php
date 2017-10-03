e2gApp.directive('login', [function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'templates/login-dialog.html',
    controller: [
      '$rootScope',
      '$scope',
      '$location',
      'eventService',
      'userService',
      '$timeout',
      'localStorageService',
      'userTypes',
      function($rootScope,
               $scope,
               $location,
               eventService,
               userService,
               $timeout,
               localStorageService,
               userTypes) {

        var paramCoupleId = $location.search().coupleId;

        $scope.loginForm = {
          password: localStorageService.get('password'),
          coupleId: localStorageService.get('coupleId')
        };

        if (paramCoupleId) {
          // show event to admin
          checkEvent($location.search().coupleId, null, true);
        } else if ($scope.loginForm.coupleId &&
          $scope.loginForm.password && !paramCoupleId) {

          // if not admin check event by coupleId and by password
          checkEvent($scope.loginForm.coupleId, $scope.loginForm.password);
        } else {
          // if coupleId and password don't exist show login form
          $scope.autoOpen = true;
        }

        $scope.doLogin = function() {
          $timeout(function() {
            $scope.loginForm.submitted = true;
          }, 0);
          if ($scope.formLogin.$valid) {
            checkEvent($scope.loginForm.coupleId, $scope.loginForm.password);
          }
        };

        function checkEvent(coupleId, password, admin) {

          var options = {
            coupleId: coupleId
          };

          // check event with password if not admin
          if (!admin) {
            options.password = password;
            localStorageService.set('userType', userTypes.couple);
          } else {
            localStorageService.set('userType', userTypes.admin);
          }

          eventService.loadEvent(options, function(eventObject) {
            if (eventObject && (!eventObject.get('disabledAt') || admin)) {

              // set coupleId and password to localStorage
              localStorageService.set('coupleId', coupleId);
              localStorageService.set('password', password);

              $scope.closeDialog();
              $rootScope.$broadcast('loginSuccess');
            } else {
              $scope.autoOpen = true;
              $scope.openDialog();
              $scope.showError();
            }
          }, function() {
            $scope.autoOpen = true;
            $scope.openDialog();
            $scope.showError();
          });
        }
      }],

    link: function(scope, element) {
      element.on('dialogopen', function(e, ui) {
        var bottomText = '<div class="bottom-text">' +
          'שירות לקוחות 5055 *' +
          '</div>';
        angular.element(e.target).parent().append(bottomText);
      });

      element.dialog({
        dialogClass: 'no-close',
        autoOpen: (scope.autoOpen) ? scope.autoOpen : false,
        height: 'auto',
        width: 348,
        modal: true,
        buttons: {
          'כניסה': scope.doLogin
        }
      });

      scope.openDialog = function() {
        element.dialog('open');
      };

      scope.closeDialog = function() {
        element.dialog('close');
      };
      scope.showError = function() {
        angular.element('.login-error').fadeIn().delay(2000).fadeOut();
      };
    }
  };
}]);
