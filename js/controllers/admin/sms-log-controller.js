e2gApp.controller('smsLogCtrl', ['$scope', '$stateParams',
  '$timeout', '$filter', 'smsLogService', 'smsStatusList', 'eventService',
  'dateService', 'smsStatusListReverse',
  function($scope, $stateParams, $timeout, $filter, smsLogService,
           smsStatusList, eventService, dateService, smsStatusListReverse) {
    $scope.smsStatusList = smsStatusList;
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
        name: 'phone',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'waveType',
        displayName: 'Type',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'smsText',
        headerCellClass: 'custom-header-cell',
        width: '260',
        cellClass: 'custom-cell',
        cellTemplate: '<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
      }, {
        name: 'status',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div>{{grid.appScope.smsStatusList[COL_FIELD]}}</div>'
      }, {
        name: 'state',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
      }],
      rowHeight: 80,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;
      }
    };

    $scope.exportSmsLog = function() {
      var result = [];

      //prepare field list for export
      for (var i = 0; i < $scope.gridOptions.data.length; i++) {
        var log = $scope.gridOptions.data[i];

        result.push({
          'date': dateService.parseStringDate(log.createdAt),
          'phone': log.phone,
          'type': log.waveType,
          'status': smsStatusList[log.status],
          'sms text': log.smsText
        });
      }
      alasql('SELECT * INTO XLSX("sms-log-' + $stateParams.eventId +
        '.xlsx",{headers:true}) FROM ?',
        [result]);
    };

    eventService.getById($stateParams.eventId, function(event) {
      smsLogService.getForEvent(event, function(list) {
        refreshGridOptions(list);
      });
    });

    function updateSmsNumber() {
      var firstWaveTotalRows = $filter('filter')($scope.gridOptions.data,
        {
          waveType: 'firstWave'
        }).length;
      var firstWaveErrors = $filter('filter')($scope.gridOptions.data,
        {
          status: smsStatusListReverse.error,
          waveType: 'firstWave'
        }).length;
      var secondWaveTotalRows = $filter('filter')($scope.gridOptions.data,
        {
          waveType: 'secondWave'
        }).length;
      var secondWaveErrors = $filter('filter')($scope.gridOptions.data,
        {
          status: smsStatusListReverse.error,
          waveType: 'secondWave'
        }).length;

      $scope.smsNumber = {
        firstWave: {
          totalRows: firstWaveTotalRows,
          sentToService: firstWaveTotalRows - firstWaveErrors,
          errors: firstWaveErrors,
          delivered: $filter('filter')($scope.gridOptions.data,
            {
              status: smsStatusListReverse.delivered,
              waveType: 'firstWave'
            }).length
        }, secondWave: {
          totalRows: secondWaveTotalRows,
          sentToService: secondWaveTotalRows - secondWaveErrors,
          errors: secondWaveErrors,
          delivered: $filter('filter')($scope.gridOptions.data,
            {
              status: smsStatusListReverse.delivered,
              waveType: 'secondWave'
            }).length
        }
      };
    }

    function refreshGridOptions(data) {
      $timeout(function() {
        $scope.gridOptions.data = data;
        $scope.gridApi.core.refresh();
        updateSmsNumber();
      }, 0);
    }

  }]);
