e2gApp.controller('templateCtrl', ['$scope', '$timeout', 'adminAuth', 'templateService', 'ajaxService',
  function ($scope, $timeout, adminAuth, templateService, ajaxService) {

    $scope.templateList = {};

    //init action
    init();

    function init() {
      //if (!$scope.user || $scope.user.login === 'admin') {
      //  return false;
      //}

      templateService.getList(function(templateList) {
        $timeout(function() {
          $scope.templateList = templateList;
        }, 0);
      })

    }

    $scope.save = function() {
      templateService.saveList($scope.templateList);
    };

  }]);
