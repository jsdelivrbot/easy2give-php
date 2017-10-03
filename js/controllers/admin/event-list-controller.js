e2gApp.controller('eventListCtrl', ['$rootScope', '$scope', '$state', '$filter',
  'adminAuth', 'eventService', 'dateService', 'uiGridConstants',
  function($rootScope, $scope, $state, $filter, adminAuth, eventService, dateService,
           uiGridConstants) {
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
        '<a target="_blank" ' +
        'href="/#/?coupleId={{row.entity.coupleId}}">' +
        '{{row.entity.coupleId}}</a>' +
        '</div>'
      }, {
        name: 'managerName',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'brideName',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'groomName',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'password',
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
        cellFilter: 'date:"HH:mm dd/MM/yyyy"',
        filterCellFiltered: true
      }, {
        name: 'firstWave',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        field: 'firstWave.iso',
        cellFilter: 'date:"HH:mm dd/MM/yyyy"',
        filterCellFiltered: true
      }, {
        name: 'secondWave',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        field: 'secondWave.iso',
        cellFilter: 'date:"HH:mm dd/MM/yyyy"',
        filterCellFiltered: true
      }, {
        name: 'callCenter',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        type: 'date',
        enableSorting: true,
        width: 130,
        field: 'callCenter.iso',
        cellFilter: 'date:"HH:mm dd/MM/yyyy"',
        filterCellFiltered: true
      }, {
        name: 'eventStatus',
        displayName: 'Event Status',
        headerCellClass: 'custom-header-cell filter-select',
        editableCellTemplate: 'ui-grid/dropdownEditor',
        editDropdownValueLabel: 'eventStatus',
        cellClass: 'custom-cell',
        cellFilter: 'eventStatus',
        filter: {
          type: uiGridConstants.filter.SELECT,
          condition: function(searchTerm, cellValue) {
            return searchTerm === cellValue;
          },
          selectOptions: [{
            value: 0,
            label: 'New event'
          }, {
            value: 2,
            label: 'First wave done'
          }, {
            value: 4,
            label: 'Second wave done'
          }, {
            value: 6,
            label: 'IVR done'
          }, {
            value: 7,
            label: 'Call center started'
          }, {
            value: 8,
            label: 'Call center done'
          }, {
            value: 99,
            label: 'Not paid'
          }, {
            value: 100,
            label: 'Passed'
          }]
        },
        editDropdownOptionsArray: [{
          id: 0,
          eventStatus: 'New event'
        }, {
          id: 1,
          eventStatus: 'First wave started'
        }, {
          id: 2,
          eventStatus: 'First wave done'
        }, {
          id: 3,
          eventStatus: 'Second wave started'
        }, {
          id: 4,
          eventStatus: 'Second wave done'
        }, {
          id: 5,
          eventStatus: 'IVR started'
        }, {
          id: 6,
          eventStatus: 'IVR done'
        }, {
          id: 7,
          eventStatus: 'Call center started'
        }, {
          id: 8,
          eventStatus: 'Call center done'
        }, {
          id: 99,
          eventStatus: 'Not paid'
        }, {
          id: 100,
          eventStatus: 'Passed'
        }],
        width: 140
      }, {
        name: 'image',
        displayName: 'Photo',
        enableFiltering: false,
        width: 65,
        cellClass: 'custom-cell',
        headerCellClass: 'custom-header-cell',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }, {
        name: 'paymentDone',
        enableFiltering: false,
        width: 65,
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }, {
        name: 'showBanner',
        displayName: 'Banner',
        enableFiltering: false,
        width: 65,
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '/templates/cells/boolean-cell.html'
      }, {
        name: 'Edit',
        enableFiltering: false,
        width: 70,
        cellClass: 'custom-cell text-center',
        headerCellClass: 'custom-header-cell',
        cellTemplate: '<div>' +
        '<a target="_blank" class="btn btn-sm btn-warning"' +
        'ui-sref="app.editEvent({eventId: row.entity.objectId})">' +
        '<i class="fa fa-edit"></i></a>' +
        '</div>'
      }, {
        name: 'smsLog',
        enableFiltering: false,
        cellClass: 'custom-cell text-center',
        headerCellClass: 'custom-header-cell',
        cellTemplate: '<div>' +
        '<a target="_blank" class="btn btn-sm btn-info"' +
        'ui-sref="app.smsLog({eventId: row.entity.objectId})">' +
        '<i class="fa fa-eye"></i></a>' +
        '</div>'
      }, {
        name: 'contactStatusLog',
        enableFiltering: false,
        displayName: 'Statuses',
        cellClass: 'custom-cell text-center',
        headerCellClass: 'custom-header-cell',
        cellTemplate: '<div>' +
        '<a target="_blank" class="btn btn-sm btn-success"' +
        'ui-sref="app.contactStatusLog({eventId: row.entity.objectId})">' +
        '<i class="fa fa-eye"></i></a>' +
        '</div>'
      }, {
        name: 'Delete',
        enableFiltering: false,
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
      var conf = confirm('Are you sure you want to delete the event?');

      if (conf) {
        eventService.deleteEvent(row.entity.objectId);
        var index = $scope.gridOptions.data.indexOf(row.entity);
        $scope.gridOptions.data.splice(index, 1);

        refreshGridOptions($scope.gridOptions.data);
      }
    };

    $scope.exportEventList = function() {
      var result = [];

      //prepare field list for export
      for (var i = 0; i < $scope.gridOptions.data.length; i++) {
        var log = $scope.gridOptions.data[i];

        delete log.location;
        delete log.locationLink;
        delete log.createdAt;
        delete log.updatedAt;
        delete log.firstWaveSmsText;
        delete log.secondWaveSmsText;
        delete log.objectId;

        log.image = log.image ? 1 : 0;
        log.showBanner = log.showBanner ? 1 : 0;
        log.payment = log.payment ? 1 : 0;
        log.managerName = log.managerName;

        log.date = log.date ? dateService.parseStringDate(log.date.iso) : '';
        log.firstWave = log.firstWave ?
          dateService.parseStringDate(log.firstWave.iso) : '';
        log.secondWave = log.secondWave ?
          dateService.parseStringDate(log.secondWave.iso) : '';

        result.push(log);
      }
      alasql('SELECT * INTO XLSX("event-list.xlsx",{headers:true}) FROM ?',
        [result]);
    };

    if ($scope.user && $scope.user.login === 'admin') {
      var options;
      if ($state.current.name === 'app.eventList') {
        options = {
          notEqualTo: {
            numbersExportOnly: true
          }
        };
      } else {
        options = {
          equalTo: {
            numbersExportOnly: true
          }
        };
      }
      eventService.getEventList(options, function(list) {
        refreshGridOptions(list);
      });
    }

    function refreshGridOptions(data) {
      if (data) {
        $scope.gridOptions.data = $filter('orderBy')(data, 'date.iso', false);
      }
      $scope.gridApi.core.refresh();
    }
  }])
  .filter('eventStatus', ['eventStatusList', function(eventStatusListReverse) {
    return function(input) {
      return eventStatusListReverse[input];
    };
  }]);
