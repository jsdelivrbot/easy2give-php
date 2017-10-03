e2gApp.controller('callTeamCtrl', ['$rootScope', '$scope', '$timeout',
  'adminAuth', 'eventService', function($rootScope, $scope, $timeout,
                                        adminAuth, eventService) {
    $scope.user = adminAuth.getUser();
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
        name: 'coupleId',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div class="custom-cell">' +
        '<a ui-sref="app.callTeamGuestList({eventId: row.entity.objectId})"' +
        'ng-bind="row.entity.coupleId"></a></div>'
      }, {
        name: 'brideName',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'groomName',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'date',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        field: 'date.iso',
        cellFilter: 'date:"HH:mm dd/MM/yyyy"'
      }, {
        name: 'callCenterDone',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'boolean',
        enableSorting: true,
        width: 130,
        field: 'callCenterDone',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }, {
        name: 'firstWave',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        field: 'firstWave.iso',
        cellFilter: 'date:"HH:mm dd/MM/yyyy"'
      }, {
        name: 'secondWave',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        field: 'secondWave.iso',
        cellFilter: 'date:"HH:mm dd/MM/yyyy"'
      }, {
        name: 'showBanner',
        width: 65,
        displayName: 'Banner',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }, {
        name: 'image',
        displayName: 'Photo',
        width: 65,
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }],
      rowHeight: 40,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    if ($scope.user) {
      eventService.getCallTeamEventList(function(list) {
        $timeout(function() {
          $scope.gridOptions.data = list;
        }, 0);
      });
    }
  }]);
