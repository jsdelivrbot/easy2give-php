e2gApp.controller('contactStatusLogCtrl', ['$scope', '$stateParams',
  '$timeout', 'contactService', 'contactStatusUpdatedBy', 'eventService',
  'dateService', 'statusListReverse',
  function($scope, $stateParams, $timeout, contactService,
           contactStatusUpdatedBy, eventService, dateService,
           statusListReverse) {
    $scope.statusListReverse = statusListReverse;
    $scope.contactStatusUpdatedBy = contactStatusUpdatedBy;
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
        name: 'createdAt',
        displayName: 'Date',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        cellFilter: 'date:"HH:mm dd/MM/yyyy"'
      }, {
        name: 'name',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'phone',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'nameOld',
        displayName: 'Name Old',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'nameNew',
        displayName: 'Name New',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      },{
        name: 'phoneOld',
        displayName: 'Phone Old',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      },{
        name: 'phoneNew',
        displayName: 'Phone New',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'statusOld',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div>' +
        '{{grid.appScope.statusListReverse[COL_FIELD]}}</div>'
      }, {
        name: 'statusNew',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div>' +
        '{{grid.appScope.statusListReverse[COL_FIELD]}}</div>'
      }, {
        name: 'numberOfGuestsOld',
        displayName: 'Guests Old',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'numberOfGuestsNew',
        displayName: 'Guests New',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'updatedBy',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div>' +
        '{{grid.appScope.contactStatusUpdatedBy[COL_FIELD]}}</div>'
      }],
      rowHeight: 80,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    $scope.exportLog = function() {
      var result = [];

      //prepare field list for export
      for (var i = 0; i < $scope.gridOptions.data.length; i++) {
        var log = $scope.gridOptions.data[i];

        result.push({
          'date': dateService.parseStringDate(log.createdAt),
          'phone': log.phone,
          'name': log.name,
          'statusOld': statusListReverse[log.statusOld],
          'statusNew': statusListReverse[log.statusNew],
          'numberOfGuestsOld': log.numberOfGuestsOld,
          'numberOfGuestsNew': log.numberOfGuestsNew,
          'updatedBy': contactStatusUpdatedBy[log.updatedBy]
        });
      }
      alasql('SELECT * INTO XLSX("contact-status-log-' + $stateParams.eventId +
        '.xlsx",{headers:true}) FROM ?',
        [result]);
    };

    eventService.getById($stateParams.eventId, function(event) {
      contactService.getContactStatusLogForEvent(event, function(list) {
        refreshGridOptions(list);
      });
    });

    function refreshGridOptions(data) {
      $timeout(function() {
        $scope.gridOptions.data = data;
        $scope.gridApi.core.refresh();
      }, 0);
    }

  }]);
