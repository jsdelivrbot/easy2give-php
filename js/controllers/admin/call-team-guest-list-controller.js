e2gApp.controller('callTeamGuestListCtrl', ['$rootScope', '$scope', '$timeout',
  '$stateParams', 'eventService', 'dateService', 'adminAuth', 'contactService',
  'callTeamStatusList', 'callTeamStatusListReverse', 'statusList',
  'statusListReverse', 'uiGridConstants', 'ajaxService', 'eventStatusListReverse',
  function($rootScope, $scope, $timeout, $stateParams, eventService,
           dateService, adminAuth, contactService, callTeamStatusList,
           callTeamStatusListReverse, statusList, statusListReverse,
           uiGridConstants, ajaxService, eventStatusListReverse) {
    $scope.user = adminAuth.getUser();
    $scope.dateService = dateService;
    $scope.gridOptions = {
      data: [],
      enableSorting: true,
      enableColumnMenus: false,
      enableFiltering: true,
      enableCellEdit: false,
      columnDefs: [{
        name: 'Number',
        width: 75,
        cellTemplate: '<div class="ui-grid-cell-contents">' +
        '{{grid.renderContainers.body.visibleRowCache.indexOf(row)+1}}</div>'
      }, {
        name: 'name',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'phone',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell'
      }, {
        name: 'numberOfGuests',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        enableCellEdit: true,
        enableCellEditOnFocus: true,
        type: 'number'
      }, {
        name: 'callComments',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        enableCellEdit: true,
        enableCellEditOnFocus: true,
        cellTemplate: '<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>',
        editableCellTemplate: '<div class="comment-edit">' +
        '<textarea placeholder="Type comment"' +
        'ui-grid-editor ng-model="MODEL_COL_FIELD"></textarea>' +
        '</div>',
      }, {
        name: 'comments',
        displayName: 'Couple comments',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>'
      }, {
        name: 'status',
        headerCellClass: 'custom-header-cell',
        cellClass: statusCustomCellClass,
        cellFilter: 'status',
      }, {
        name: 'callTeamStatus',
        headerCellClass: 'custom-header-cell',
        cellClass: callTeamStatusCustomCellClass,
        enableCellEdit: true,
        enableCellEditOnFocus: true,
        editDropdownValueLabel: 'status',
        cellFilter: 'callTeamStatus',
        editableCellTemplate: 'ui-grid/dropdownEditor',
        editDropdownOptionsArray: [{
          id: 0,
          status: 'אושר'
        }, {
          id: 1,
          status: 'אולי'
        }, {
          id: 2,
          status: 'לא מגיע'
        }, {
          id: 3,
          status: 'התקשרו 1 מ5 פעמים'
        }, {
          id: 4,
          status: 'התקשרו 2 מ5 פעמים'
        }, {
          id: 5,
          status: 'התקשרו 3 מ5 פעמים'
        }, {
          id: 6,
          status: 'התקשרו 4 מ5 פעמים'
        }, {
          id: 7,
          status: 'התקשרו 5 מ5 פעמים'
        }, {
          id: 8,
          status: 'מספר לא נכון'
        }]
      }, {
        name: 'updatedAt',
        displayName: 'Last Update',
        headerCellClass: 'custom-header-cell',
        cellClass: 'custom-cell',
        cellTemplate: '<div class="custom-cell">' +
        '{{row.entity.updatedAt | date: "HH:mm dd/MM/yyyy"}}</div>'
      }],
      rowHeight: 40,
      onRegisterApi: function(gridApi) {
        $scope.gridApi = gridApi;

        //save cell's data after editing
        gridApi.edit.on.afterCellEdit($scope, function(rowEntity,
                                                       colDef,
                                                       newValue,
                                                       oldValue) {
          if (newValue !== oldValue) {
            if (colDef.name === 'callTeamStatus') {
              if (newValue !== callTeamStatusList.confirmed &&
                newValue !== callTeamStatusList.maybe &&
                newValue !== callTeamStatusList.notComing) {

                contactService.saveContact(rowEntity.objectId,
                  'status', statusList.notResponded);

                rowEntity.status = statusList.notResponded;
              } else {
                contactService.saveContact(rowEntity.objectId,
                  'status', newValue);

                rowEntity.status = newValue;
              }
              refreshGridOptions();
            }

            contactService.saveContact(rowEntity.objectId,
              colDef.name, newValue);
          }
        });
      }
    };

    $scope.toggleCallCenterDone = function() {
      $scope.eventModel.callCenterDone = !$scope.eventModel.callCenterDone;
      $scope.eventObject.set('callCenterDone',
        $scope.eventModel.callCenterDone);

      $scope.eventObject.save(null, {
        success: function() {

          //send sms to couple
          if ($scope.eventModel.callCenterDone) {
            ajaxService.sendAlertTemplate($scope.eventModel.objectId, 'eventApprovalFinished');
            ajaxService.setEventStatus($scope.eventModel.objectId, eventStatusListReverse['Call center done']);
          }

          updateEvent();
        }
      });
    };

    if ($scope.user) {
      updateEvent();
    }

    $scope.exportGuestList = function() {
      var result = [];

      //prepare field list for export
      for (var i = 0; i < $scope.gridOptions.data.length; i++) {
        // clone object
        var guest = JSON.parse(JSON.stringify($scope.gridOptions.data[i]));

        delete guest.objectId;
        delete guest.event;
        delete guest.callTeam;
        delete guest.createdAt;

        guest.callTeamStatus = callTeamStatusListReverse[guest.callTeamStatus];
        guest.status = statusListReverse[guest.status];
        guest.updatedAt = guest.updatedAt ?
          dateService.parseStringDate(guest.updatedAt) : '';

        result.push(guest);
      }
      alasql('SELECT * INTO XLSX("call-team-guest-list-' +
        $stateParams.eventId + '.xlsx",{headers:true}) FROM ?',
        [result]);
    };

    function updateEvent() {
      eventService.getById($stateParams.eventId,
        function(eventObject, eventModel) {
          $timeout(function() {
            $scope.eventObject = eventObject;
            $scope.eventModel = eventModel;
            contactService.getCallTeamContactList(eventObject, function(list) {
              refreshGridOptions(list);
            });
          }, 0);
        });
    }

    function statusCustomCellClass(grid, row, col, rowRenderIndex,
                                   colRenderIndex) {
      if (row.entity.status === statusList.confirmed) {
        return 'custom-cell confirmed';
      } else if (row.entity.status === statusList.maybe) {
        return 'custom-cell maybe';
      } else if (row.entity.status === statusList.notComing) {
        return 'custom-cell not-coming';
      } else if (row.entity.status === statusList.notResponded) {
        return 'custom-cell not-responded';
      }
    }

    function callTeamStatusCustomCellClass(grid, row, col, rowRenderIndex,
                                           colRenderIndex) {
      if (row.entity.status === callTeamStatusList.confirmed) {
        return 'custom-cell confirmed';
      } else if (row.entity.status === callTeamStatusList.maybe) {
        return 'custom-cell maybe';
      } else if (row.entity.status === callTeamStatusList.notComing) {
        return 'custom-cell not-coming';
      } else {
        return 'custom-cell not-responded';
      }
    }

    function refreshGridOptions(data) {
      if (data) {
        $scope.gridOptions.data = data;
      }
      $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
      $scope.gridApi.core.refresh();
    }
  }]);
