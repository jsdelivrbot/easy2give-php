e2gApp.controller('errorLogCtrl', ['$scope', '$timeout', 'dateFormat',
  'errorLogService',
  function($scope, $timeout, dateFormat, errorLogService) {
    $scope.gridOptions = {
      data: [],
      enableSorting: true,
      enableColumnMenus: false,
      enableFiltering: true,
      columnDefs: [{
        name: 'Number',
        width: 75,
        cellTemplate: '<div class="ui-grid-cell-contents">' +
        '{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>'
      }, {
        name: 'type',
        cellClass: 'ltr'
      }, {
        name: 'message',
        displayName: 'Error',
        cellClass: 'ltr'
      }, {
        name: 'createdAt',
        type: 'date',
        enableSorting: true,
        width: 130,
        cellFilter: 'date:"HH:mm dd/MM/yyyy"'
      }],
      rowHeight: 100,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    errorLogService.getLog(function(list) {
      refreshGridOptions(list);
    });

    function refreshGridOptions(data) {
      $timeout(function() {
        $scope.gridOptions.data = data;
        $scope.gridApi.core.refresh();
      }, 0);
    }

  }]);
