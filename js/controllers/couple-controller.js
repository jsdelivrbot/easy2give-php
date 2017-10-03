e2gApp.controller('coupleCtrl', ['$rootScope', '$scope', '$timeout',
    'uiGridConstants', 'uiGridExporterConstants', 'filterFilter', '$filter',
    'systemMessage', 'contactService', 'eventService', 'statusList',
    'statusListReverse', 'statusListHe', 'settings', 'importColumns',
    'localStorageService', 'dateService', 'eventStatusListReverse',
    'changesLogService',
    function($rootScope, $scope, $timeout, uiGridConstants,
             uiGridExporterConstants, filterFilter, $filter, systemMessage,
             contactService, eventService, statusList, statusListReverse,
             statusListHe, settings, importColumns, localStorageService,
             dateService, eventStatusListReverse, changesLogService) {
      $scope.dir = 'rtl';
      $scope.eventStatusListReverse = eventStatusListReverse;
      $scope.statusList = statusList;
      $scope.contactList = [];
      $scope.event = {};
      $scope.eventObject = {};
      $scope.dateService = dateService;
      $scope.tableHeight = '';
      $scope.contentType = 'Event';
      $scope.gridOptions = {
        data: [],
        columnDefs: [{
          name: 'phone',
          displayName: 'טלפון',
          minWidth: 105,
          headerCellClass: 'custom-header-cell',
          cellClass: 'custom-cell phone'
        }, {
          name: 'name',
          displayName: 'שם',
          minWidth: 105,
          headerCellClass: 'custom-header-cell',
          cellClass: 'custom-cell'
        }, {
          name: 'whoFromName',
          displayName: 'מוזמן על ידי',
          minWidth: 105,
          headerCellClass: 'custom-header-cell',
          cellClass: 'custom-cell'
        }, {
          name: 'callTeam',
          displayName: '',
          visible: false,
          width: '8%',
          headerCellClass: 'custom-header-cell filter-select ' +
            'font-awesome-phone',
          cellClass: 'custom-cell',
          enableCellEdit: true,
          cellTemplate: '<div class="ui-grid-cell-contents' +
          ' font-md text-center" title="TOOLTIP">' +
          '<span ng-if="COL_FIELD">' +
          '<i class="fa fa-check-square-o"></i></span>' +
          '<span ng-if="!COL_FIELD">' +
          '<i class="fa fa-square-o"></i></span>' +
          '</div>',
          editableCellTemplate: '<div class="text-center">' +
          '<input type="checkbox"' +
          'ui-grid-editor ng-model="MODEL_COL_FIELD"/></div>',
          filter: {
            type: uiGridConstants.filter.SELECT,
            condition: function(searchTerm, cellValue) {
              return searchTerm == !!cellValue;
            },
            selectOptions: [{
              value: false,
              label: 'false'
            }, {
              value: true,
              label: 'true'
            }]
          }
        }, {
          name: 'status',
          displayName: 'סטטוס',
          width: '11%',
          headerCellClass: 'custom-header-cell filter-select',
          editableCellTemplate: 'ui-grid/dropdownEditor',
          editDropdownValueLabel: 'status',
          cellFilter: 'status',
          filter: {
            type: uiGridConstants.filter.SELECT,
            selectOptions: [{
              value: 0,
              label: 'אושר'
            }, {
              value: 1,
              label: 'אולי'
            }, {
              value: 2,
              label: 'לא מגיע'
            }, {
              value: 3,
              label: 'לא ענה'
            }]
          },
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
            status: 'לא ענה'
          }],
          cellClass: customCellClass
        }, {
          name: 'numberOfGuests',
          displayName: 'אורחים',
          width: '10%',
          headerCellClass: 'custom-header-cell',
          cellFilter: 'number',
          editableCellTemplate: '<div>' +
          '<form name="inputForm">' +
          '<input type="number" ' +
          'min="1" ui-grid-editor ng-model="MODEL_COL_FIELD">' +
          '</form>' +
          '</div>',
          cellClass: customCellClass
        }, {
          name: 'comments',
          displayName: 'הערות',
          width: '13%',
          headerCellClass: 'custom-header-cell',
          cellClass: 'custom-cell',
          cellTemplate: '<div title="{{COL_FIELD}}">{{COL_FIELD}}</div>',
          editableCellTemplate: '<div class="comment-edit">' +
          '<textarea placeholder="Type comment"' +
          'ui-grid-editor ng-model="MODEL_COL_FIELD"></textarea>' +
          '</div>',
        }, {
          name: 'delete',
          displayName: 'delete',
          width: '35',
          headerCellClass: 'custom-header-cell header-display-none',
          cellClass: 'custom-cell-delete',
          enableCellEdit: false,
          cellTemplate: '<button ' +
          'ng-click="grid.appScope.showDeleteContactConfirm(row)"' +
          'type="button" role="button" title="Delete contact">x</button>'
        }],
        rowHeight: 50,
        enableFiltering: true,
        enableCellEditOnFocus: true,
        enableHorizontalScrollbar: uiGridConstants.scrollbars.NEVER,
        enableVerticalScrollbar: uiGridConstants.scrollbars.NEVER,
        enableColumnMenus: false,
        gridMenuShowHideColumns: false,
        exporterSuppressColumns: ['delete'],
        onRegisterApi: function(gridApi) {
          $scope.gridApi = gridApi;

          //save cell's data after editing
          gridApi.edit.on.afterCellEdit($scope, function(rowEntity,
                                                         colDef,
                                                         newValue,
                                                         oldValue) {
            if (newValue != oldValue) {
              if (colDef.name === 'status') {
                $scope.rowToChangeStatus = {
                  rowEntity: rowEntity,
                  newValue: newValue,
                  oldValue: oldValue
                };
                systemMessage.showMessage(
                  'האים ברצונך לשנות את סטטוס ההבעה ל"' +
                  statusListReverse[newValue] + '"?',
                  'changeStatus', 'cancelChangeStatus');
              } else if (colDef.name === 'callTeam') {
                var callTeamLength = $filter('filter')($scope.gridOptions.data,
                  {callTeam: true}, true).length;

                if (callTeamLength > $scope.eventModel.callTeamLimit) {
                  rowEntity.callTeam = false;
                } else {
                  contactService.saveContact(rowEntity.objectId,
                    colDef.name, newValue);
                }

              } else if (colDef.name === 'phone') {
                var newPhone = $scope.phoneList.format(newValue);
                var oldPhone = $scope.phoneList.format(oldValue);

                // if new phone does not exist then remove from list old phone
                if (!newPhone) {
                  $scope.phoneList.remove(oldPhone);
                  contactService.saveContact(rowEntity.objectId,
                      colDef.name, newPhone);
                  return;
                }

                if ($scope.phoneList.add(newPhone, rowEntity.name)) {
                  rowEntity.phone = newPhone;
                  contactService.saveContact(rowEntity.objectId,
                    colDef.name, newPhone);
                } else {
                  // show alert message when new
                  // value duplicates another existing phone
                  systemMessage.showMessage('המספר הזה כבר קיים במערכת.');

                  // return old value if new value already exists
                  rowEntity.phone = oldPhone;
                  $scope.phoneList.duplicates = [];
                }
              } else {
                contactService.saveContact(rowEntity.objectId,
                  colDef.name, newValue);
              }
            }
          });

          gridApi.core.on.filterChanged($scope, function() {
            refreshGridOptions();
          });
        }
      };

      $scope.showExplainBlockedWaves = function(disabled) {
        if (disabled) {
          systemMessage.showMessage('גל זה נשלח לרשימת המוזמנים. ' +
            'לא ניתן לבצע שינויים');
        }
      };

      $scope.showDeleteContactConfirm = function(row) {
        $scope.rowToDelete = row;
        systemMessage.showMessage('האם למחוק את המוזמן הזה?', 'deleteContact');
      };

      $scope.showDeleteContactListConfirm = function() {
        systemMessage.showMessage('האם ברצונך למחוק את כל המספרים?', 'deleteContactList');
      };

      $rootScope.$on('changeStatus', function() {
        contactService.saveContact($scope.rowToChangeStatus.rowEntity.objectId,
          'status', $scope.rowToChangeStatus.newValue);

        // if status not responded unset callTeamStatus
        if ($scope.rowToChangeStatus.newValue === statusList.notResponded) {
          contactService.saveContact(
            $scope.rowToChangeStatus.rowEntity.objectId, 'callTeamStatus',
            null);
        }
        // another way set callTeamStatus value the same as status
        else {
          contactService.saveContact(
            $scope.rowToChangeStatus.rowEntity.objectId, 'callTeamStatus',
            $scope.rowToChangeStatus.newValue);
        }

        refreshGridOptions();
      });

      $rootScope.$on('cancelChangeStatus', function() {
        $scope.rowToChangeStatus.rowEntity.status =
          $scope.rowToChangeStatus.oldValue;
        refreshGridOptions();
      });

      $rootScope.$on('deleteContact', function() {
        contactService.deleteContact($scope.rowToDelete.entity.objectId);
        var index = $scope.gridOptions.data.indexOf($scope.rowToDelete.entity);
        $scope.phoneList.remove($scope.rowToDelete.entity.phone);
        $scope.gridOptions.data.splice(index, 1);
        $scope.contactList.splice(index, 1);

        refreshGridOptions($scope.gridOptions.data);
      });

      $rootScope.$on('deleteContactList', function() {
        contactService.deleteContactList($scope.eventObject);

        $scope.gridOptions.data = [];
        $scope.contactList = [];
        $scope.phoneList.data = [];

        refreshGridOptions($scope.gridOptions.data);
      });

      $scope.updateNumberOfGuests = function() {
        contactService.saveContact($scope.activeContact.objectId,
          'numberOfGuests', $scope.activeContact.numberOfGuests);
        $scope.closeNumberOfGuestsDialog();
      };

      $scope.confirmExport = function() {
        systemMessage.showMessage('שימו לב: המערכת מיצאת אנשי קשר לפי המוצג ' +
          'בטבלה. אנא הסירו את כל הפילטרים כדי לייצא את הרשימה כולה.',
          'exportConfirmed');
      };

      $rootScope.$on('exportConfirmed', function() {
        $scope.exportData();
      });

      $scope.exportData = function() {
        var result = [];

        var visibleRows =
          $scope.gridApi.core.getVisibleRows($scope.gridApi.grid);

        //prepare field list for export
        for (var i = 0; i < visibleRows.length; i++) {
          var contact = visibleRows[i].entity;

          result.push({
            'טלפון': contact.phone,
            'שם': contact.name,
            'מוזמן על ידי': contact.whoFromName,
            'סטטוס': statusListReverse[contact.status],
            'אורחים': contact.numberOfGuests,
            'הערות': contact.comments
          });
        }
        result = $filter('orderBy')(result, 'name', false);
        alasql('SELECT * INTO XLSX("contact-list.xlsx",{headers:true}) FROM ?',
          [result]);
      };

      $scope.exportExample = function() {
        var result = [
          {
            'טלפון': '',
            'שם': '',
            'מוזמן על ידי': '',
            'אורחים': '',
            'סטטוס': '',
            'הערות': ''
          }
        ];
        alasql('SELECT * INTO XLSX("example-list.xlsx",{headers:true}) FROM ?'
          , [result]);
      };

      $scope.introOptions = {
        steps: [
          {
            element: '#statistics',
            intro: 'לחיצה על כפתורי סטאטוס ההגעה מסננת את טבלת' +
            ' המוזמנים בהתאם לסטטוס שלהם.'
          },
          {
            element: '.ui-grid-header-viewport',
            intro: 'לחיצה על כותרת טבלה ממיינת את טבלת המוזמנים בהתאם ' +
            'לעמודה הנבחרת. גם ניתן סינון אוטומטי לפי עמודה.'
          },
          {
            element: '.ui-grid-canvas div',
            intro: 'לחצו על פרטי המוזמן כדי לערוך אותם. אין צורך לשמור, ' +
            'השינויים נשמרים אוטומטית. לחצו על האיקס כדי למחוק מוזמנים מהרשימה.'
          },
          {
            element: '.add-new-line',
            intro: 'לחיצה על כפתור "הוסף שורה חדשה" יוסף עוד מוזמן לטבלה.',
            position: 'top'
          },
          {
            element: '#bottom-buttons-block',
            intro: 'לחיצה על כפתור "ייצוא" תייצא את רשימת המוזמנים לקובץ ' +
            'אקסל. לחיצה על כפתור "ייבוא" תייבא את רשימת המוזמנים מקובץ ' +
            'אקסל. ניתן להוריד תבנית של קובץ הייבוא.',
            position: 'top'
          },
          {
            element: '#sms-placeholder',
            intro: 'תצוגה מקדימה של המסרון שישלח למוזמנים.',
            position: 'left'
          },
          {
            element: '.img-wrapper',
            intro: 'יש להעלות תמונה אישית שלכם שתופיע בעמוד אישור ההגעה.',
            position: 'left'
          },
          {
            element: '#wave-selector',
            intro: 'יש להגדיר תאריכים עבור שליחת סמסים בשני גלים.',
            position: 'left'
          },
          {
            element: '#save-block',
            intro: 'לחצו על ״שמור״ כדי לשמור שינויים שעשיתם בהגדרות.',
            position: 'left'
          }
        ],
        nextLabel: 'הבא',
        prevLabel: 'הקודם',
        skipLabel: 'דלג',
        doneLabel: 'סיום',
        showStepNumbers: false,
        scrollToElement: true
      };

      $scope.csv = {
        content: null,
        header: true,
        headerVisible: true,
        separator: ',',
        separatorVisible: true,
        result: null,
        encoding: 'UTF-8',
        encodingVisible: true
      };

      $scope.loadFile = function($files, $file, $newFiles, $duplicateFiles,
                                 $invalidFiles, $event) {
        if ($event.originalEvent.target.files.length !== 0) {
          var message = 'יציאה מחלון זה תבטל את טעינת הקובץ, אנא המתן';
          systemMessage.showMessage(message, '', '', '', '', true);

          alasql('SELECT * FROM FILE(?,{headers:true})', [$event.originalEvent],
            function(data) {
              $scope.startImport = true;
              $timeout(function() {
                importJson(data);
              }, 0);
            });
        }
      };

      $scope.addNewLine = function() {
        var ParseObject = Parse.Object.extend('Contact');
        var contact = new ParseObject();
        contact.set('event', $scope.eventObject);
        contact.set('status', statusList.notResponded);
        contact.set('numberOfGuests', 1);
        contact.save(null, {
          success: function(contact) {
            $scope.contactList.push(contact.toJSON());
            refreshGridOptions($scope.contactList);
          },
          error: function(contact, error) {
            console.log(error);
          }
        });
      };

      $scope.getStatusCount = function(status) {
        var filter = filterFilter($scope.contactList, {
          status: status
        });

        var count = 0;

        if (filter.length > 0) {
          for (var i = 0; i < filter.length; i++) {
            var obj = filter[i];
            count += parseInt(obj.numberOfGuests) > 0 ?
              parseInt(obj.numberOfGuests) : 1;
          }
        }

        return count;
      };

      $scope.filterByStatus = function(status) {
        $scope.filterByStatusValue = ($scope.filterByStatusValue ||
        $scope.filterByStatusValue === 0) ?
          null : status;

        if ($scope.filterByStatusValue || $scope.filterByStatusValue === 0) {
          var filteredData = $filter('filter')($scope.contactList,
            {status: status}, undefined);

          refreshGridOptions(filteredData);
        } else {
          refreshGridOptions($scope.contactList);
        }
      };

      $scope.downloadPattern = function() {
        console.log('pattern');
      };

      $scope.saveEvent = function() {
        if ($scope.eventModel.smsAllowed) {
          changesLogService.saveChangesLog($scope.eventObject,
            $scope.eventModel, $scope.contentType);
          eventService.saveEvent($scope.eventObject, $scope.eventModel);
        }
      };

      $scope.waveDone = function(status) {
        if (!$scope.eventModel || $scope.eventModel.eventStatus == undefined) {
          return false;
        }

        return $scope.eventModel.eventStatus >= status;
      };

      function updateTableHeight() {
        var rowHeight = 50;
        var headerHeight = 85;

        $timeout(function() {
          var visibleRows = ($filter('filter')($scope.gridApi.grid.rows,
            {'visible': true}, true)).length;

          var tableHeight = visibleRows * rowHeight + headerHeight;
          $scope.tableHeight = 'height: ' + tableHeight + 'px';
        }, 0);
      }

      function customCellClass(grid, row, col, rowRenderIndex, colRenderIndex) {
        if (row.entity.status === statusList.confirmed) {
          return 'custom-cell confirmed';
        }
        if (row.entity.status === statusList.maybe) {
          return 'custom-cell maybe';
        }
        if (row.entity.status === statusList.notComing) {
          return 'custom-cell not-coming';
        }
        if (row.entity.status === statusList.notResponded) {
          return 'custom-cell not-responded';
        }
        return 'custom-cell';
      }

      function refreshGridOptions(data) {
        if (data) {
          $scope.gridOptions.data = $filter('orderBy')(data, 'name', false);
        }
        ;
        $scope.gridApi.core.refresh();
        $scope.gridApi.core.notifyDataChange(uiGridConstants.dataChange.ALL);
        updateTableHeight();
      }

      function setSmsPreview(smsText, eventId) {
        $scope.waveSmsText = smsText;
        $scope.waveSmsLink = '';

        $scope.waveSmsLink = settings.baseUrl + '/e/' + eventId;
      }

      function importJson(contactList) {
        console.log('import');
        var alreadyImported = 0;
        var totalImport = 0;

        for (var i = 0; i < contactList.length; i++) {
          var contact = contactList[i];

          var phoneNumber = contact[importColumns.phone] ?
            contact[importColumns.phone].toString() : null;

          //if not exists add
          if ($scope.phoneList.add(phoneNumber, contact[importColumns.name])) {

            var data = {
              event: $scope.eventObject,
              name: contact[importColumns.name] ? contact[importColumns.name].toString() : '',
              phone: $scope.phoneList.format(phoneNumber),
              whoFromName: contact[importColumns.whoFromName],
              status: statusListHe.hasOwnProperty(contact[importColumns.status]) ?
                statusListHe[contact[importColumns.status]] :
                statusList.notResponded,
              numberOfGuests: isNaN(parseInt(contact[importColumns.numberOfGuests])) ?
                1 : parseInt(contact[importColumns.numberOfGuests]),
              comments: contact[importColumns.comments]
            };

            totalImport++;

            contactService.addContact(data, function(newContact) {
              $scope.contactList.push(newContact.toJSON());
              checkForEndImport();
            });
          }
        }

        if (totalImport === 0) {
          showDuplicates();
        }

        $scope.closeImportDialog();

        function checkForEndImport() {
          alreadyImported++;
          $timeout(function() {
            systemMessage.progress(alreadyImported, totalImport);
          }, 0);
          if (alreadyImported == totalImport) {
            refreshGridOptions($scope.contactList);
            $timeout(function() {
              systemMessage.progress(0, 1);
            }, 0);
            systemMessage.hideMessage();
            showDuplicates();
          }
          console.log('Total: ' + totalImport + ' Imported: ' +
            alreadyImported);
        }

        function showDuplicates() {
          var message = $scope.phoneList.duplicates;

          if (!totalImport && !message.length) {
            message = 'יבוא לא הצליח. נסו שוב או צרו קשר עם התמיכה.';
            systemMessage.showMessage(message);
            throw new Error('CoupleId: ' + $scope.eventModel.coupleId +
              '. Nothing imported.');
          }

          // do nothing if there are no duplicates
          if (!$scope.phoneList.duplicates.length) {
            return;
          }

          message.top = $scope.phoneList.duplicates.length +
            ' הכפילויות הבאות אינן מיובאות.';
          systemMessage.showMessage(message);

          // set duplicates to empty array to refresh new import info
          $scope.phoneList.duplicates = [];
        }
      }

      function showIntro() {
        var isShowed = localStorageService.get('intro');

        if (!isShowed) {
          $timeout(function() {
            localStorageService.set('intro', true);

            //remove steps for short version
            if (!$scope.eventModel.smsAllowed) {
              $scope.introOptions.steps.splice(5, 4);
            }

            $scope.showIntro();
          }, 0);
        }
      }

      $scope.phoneList = {
        data: [],
        duplicates: [],
        update: function() {
          for (var k = 0; k < $scope.contactList.length; k++) {
            if ($scope.contactList[k].phone) {
              $scope.phoneList.add($scope.contactList[k].phone.toString());
            }
          }
          $scope.phoneList.duplicates = [];
        },
        add: function(number, name) {
          if (!number && name) {
            return true;
          }

          var formatted = $scope.phoneList.format(number);

          if (!$scope.phoneList.exists(formatted)) {
            $scope.phoneList.data.push(formatted);
            return true;
          } else {
            var duplicate = {
              phone: formatted,
              name: name
            };
            $scope.phoneList.duplicates.push(duplicate);
            return false;
          }
        },
        remove: function(number) {
          var index = $scope.phoneList.data.indexOf(number);
          $scope.phoneList.data.splice(index, 1);
        },
        exists: function(number) {
          return number ? $scope.phoneList.data.indexOf(number) !== -1 : true;
        },
        format: function(number) {
          if (!number) {
            return;
          }

          number = number.replace(/\D/g, '');
          number = number.length === 9 ? '0' + number : number;

          return number.replace(/^972/, '0');
        }
      };

      $rootScope.$on('loginSuccess', function() {
        $scope.eventModel = eventService.getEventModel();
        $scope.eventObject = eventService.getEventObject();

        // show or hide callTeam column depending on callRSVP property in event
        $scope.gridApi.grid.getColumn('callTeam').colDef.visible =
          Boolean($scope.eventModel.callRSVP);

        setSmsPreview($scope.eventModel.firstWaveSmsText,
          $scope.eventModel.objectId);

        contactService.getList($scope.eventObject, function(contactList) {
          $scope.contactList = contactList;
          $scope.phoneList.update();
          refreshGridOptions($scope.contactList);
          showIntro();
        });

        // update object and model after image changed
        $rootScope.$on($scope.eventModel.objectId + 'Updated',
          function(e, obj) {
            $timeout(function() {
              $scope.eventModel.image = obj.toJSON().image;
            }, 0);
          });
      });

      /**
       * script that makes event name from brideName and groomName
       */
      //(function() {
      //  var updated = 0;
      //  var Event = Parse.Object.extend('Event');
      //  var eventQuery = new Parse.Query(Event);
      //
      //  eventQuery.doesNotExist('name');
      //  eventQuery.exists('brideName');
      //  eventQuery.exists('groomName');
      //
      //  eventQuery.find({
      //    success: function(arr) {
      //      var total = arr.length;
      //      arr.forEach(function(obj) {
      //        var name = 'החתונה של ' +
      //          obj.get('brideName') + ' ו-' + obj.get('groomName');
      //
      //        obj.set('name', name);
      //
      //        obj.save(null, {
      //          success: function() {
      //            updated++;
      //            console.log(updated + ' saved!');
      //            if (updated === total) {
      //              console.log('Update finished ;)');
      //            }
      //          }
      //        });
      //      });
      //    }
      //  });
      //})();

    }
  ])

  .filter('status', ['statusListReverse', function(statusListReverse) {
    return function(input) {
      return statusListReverse[input];
    };
  }]);
