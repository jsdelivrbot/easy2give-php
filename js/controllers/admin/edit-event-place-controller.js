e2gApp.controller('editEventPlaceCtrl', ['$rootScope', '$scope', '$stateParams',
  '$state', '$timeout', 'adminAuth', 'eventPlaceService',
  function($rootScope, $scope, $stateParams, $state, $timeout, adminAuth,
           eventPlaceService) {
    $scope.user = adminAuth.getUser();

    if ($scope.user && $scope.user.login === 'admin') {
      eventPlaceService.loadEventPlace($stateParams,
        function(eventPlaceObject, eventPlaceModel) {
          $timeout(function() {
            $scope.eventPlaceObject = eventPlaceObject;
            $scope.eventPlaceModel = eventPlaceModel;

            // update object and model after venueLogo changed
            $rootScope.$on($scope.eventPlaceModel.objectId + 'Updated',
              function(e, obj) {
                $timeout(function() {
                  $scope.eventPlaceModel.venueLogo = obj.toJSON().venueLogo;
                }, 0);
              });
          }, 0);
        });
    }

    $scope.saveEventPlace = function() {
      eventPlaceService.saveEventPlace($scope.eventPlaceObject,
        $scope.eventPlaceModel, function() {
          $state.go('app.eventPlacesList');
        });
    };

  }]);
