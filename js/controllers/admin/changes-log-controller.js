e2gApp.controller('changesLogCtrl', ['$scope', '$stateParams',
  '$timeout', 'contactStatusUpdatedBy', 'changesLogService', 'ngDialog',
  function($scope, $stateParams, $timeout, contactStatusUpdatedBy,
           changesLogService, ngDialog) {
    $scope.contactStatusUpdatedBy = contactStatusUpdatedBy;
    $scope.gridOptions = {
      data: [],
      enableSorting: true,
      enableColumnMenus: false,
      enableFiltering: true,
      columnDefs: [{
        name: 'createdAt',
        displayName: 'Date',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        cellFilter: 'date:"HH:mm dd/MM/yyyy"'
      }, {
        name: 'contentId',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'contentType',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'action',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'updatedBy',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div>' +
        '{{grid.appScope.contactStatusUpdatedBy[COL_FIELD]}}</div>'
      }, {
        name: 'details',
        enableFiltering: false,
        width: 70,
        displayName: 'Details',
        cellClass: 'custom-cell text-center',
        headerCellClass: 'custom-header-cell',
        cellTemplate: '<div>' +
        '<a target="_blank" class="btn btn-sm btn-success"' +
        'ng-click="grid.appScope.openDetail(COL_FIELD)">' +
        '<i class="fa fa-eye"></i></a>' +
        '</div>'
      }],
      rowHeight: 80,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    changesLogService.getChangesLog(false, function(list) {
      refreshGridOptions(list);
    });
    $scope.openDetail = function(details) {
      $scope.details = JSON.parse(details);
      ngDialog.open({
        template: 'templates/admin/changes-log-details.html',
        scope: $scope,
        className: 'ngdialog-theme-default'
      });
    };

    function refreshGridOptions(data) {
      $timeout(function() {
        $scope.gridOptions.data = data;
        $scope.gridApi.core.refresh();
      }, 0);
    }

  }]);
