e2gApp.controller('eventPlacesListCtrl', ['$scope', '$timeout',
  'eventPlaceService', function($scope, $timeout, eventPlaceService) {
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
        name: 'venueName',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'venueAddress',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'venuePhone',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'venueLogo',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }, {
        name: 'Edit',
        width: 70,
        cellClass: 'custom-cell text-center',
        headerCellClass: 'custom-header-cell',
        cellTemplate: '<div>' +
        '<a target="_blank" class="btn btn-sm btn-warning"' +
        'ui-sref="app.editEventPlace({placeId: row.entity.objectId})">' +
        'Edit</a>' +
        '</div>'
      }, {
        name: 'Delete',
        width: 70,
        headerCellClass: 'custom-header-cell header-display-none',
        cellClass: 'custom-cell text-center',
        enableCellEdit: false,
        cellTemplate: '/templates/cells/delete-cell.html'
      }],
      rowHeight: 40,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    $scope.deleteRow = function(row) {
      var conf = confirm('Are you sure you want to delete the place?');

      if (conf) {
        eventPlaceService.deleteEventPlace(row.entity.objectId);
        var index = $scope.gridOptions.data.indexOf(row.entity);
        $scope.gridOptions.data.splice(index, 1);

        refreshGridOptions($scope.gridOptions.data);
      }
    };

    if ($scope.user && $scope.user.login === 'admin') {
      eventPlaceService.getEventPlacesList(function(list) {
        refreshGridOptions(list);
      });
    }

    function refreshGridOptions(data) {
      $timeout(function() {
        if (data) {
          $scope.gridOptions.data = data;
        }
        $scope.gridApi.core.refresh();
      }, 0);
    }
  }]);
