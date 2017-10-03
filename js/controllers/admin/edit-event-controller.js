e2gApp.controller('editEventCtrl', ['$rootScope', '$scope', '$stateParams',
  '$state', '$timeout', '$filter', 'adminAuth', 'eventService',
  'eventPlaceService', 'settings', 'ajaxService', 'eventStatusListReverse',
  'contactService', 'statusListReverse', 'changesLogService', 'ivrService', '$location',
  function($rootScope, $scope, $stateParams, $state, $timeout, $filter,
           adminAuth, eventService, eventPlaceService, settings, ajaxService,
           eventStatusListReverse, contactService, statusListReverse,
           changesLogService, ivrService, $location) {
    var eventPlacesList;
    $scope.user = adminAuth.getUser();
    $scope.eventObject = {};
    $scope.eventModel = {};
    $scope.eventPlacesList = [];
    $scope.ivrRecordFile = {};
    $scope.ivrRecordObj = {};
    $scope.contentType = 'Event';

    if ($scope.user && $scope.user.login === 'admin') {
      eventService.loadEvent($stateParams, function(eventObject, eventModel) {
        if (!$stateParams.eventId) {
          eventModel.firstWaveSmsText = settings.firstWaveSmsText;
          eventModel.secondWaveSmsText = settings.secondWaveSmsText;
          eventModel.coupleAlertText = settings.coupleAlertText;
          eventModel.smsRemindText = settings.smsRemindText;
          eventModel.isInstructionSent = false;
          eventModel.isLimitWaves = true;
        }

        $timeout(function() {
          $scope.eventObject = eventObject;
          $scope.eventModel = eventModel;

          if ($scope.eventModel.ivrRecordFile) {
            $scope.ivrRecordObj.url = $location.protocol() + '://' +
              $location.host() + '/ivr/mp3/' + $stateParams.eventId +
              '/record.mp3';
          }
          // update object and model after image changed
          $rootScope.$on($scope.eventModel.objectId + 'Updated',
            function(e, obj) {
              $timeout(function() {
                $scope.eventModel.image = obj.toJSON().image;
              }, 0);
            });
        }, 0);
      });

      eventPlaceService.getEventPlacesList(function(modelList, objectList) {
        $timeout(function() {
          $scope.eventPlacesList = modelList;
          eventPlacesList = objectList;
        }, 0);
      });
    }

    $scope.exportGuestList = function() {
      var result = [];

      contactService.getList($scope.eventObject, function(contactList) {

        //prepare contact list for export
        for (var i = 0; i < contactList.length; i++) {
          var contact = contactList[i];

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
      });
    };

    $scope.saveEvent = function() {
      if ($scope.eventModel.eventPlace &&
        $scope.eventModel.eventPlace.objectId) {
        var eventPlaceId = $scope.eventModel.eventPlace.objectId;
        var eventPlace =
          $filter('filter')(eventPlacesList, {id: eventPlaceId}, true)[0];
        $scope.eventModel.eventPlace = eventPlace;
      }
      changesLogService.saveChangesLog($scope.eventObject,
        $scope.eventModel, $scope.contentType);
      eventService.saveEvent($scope.eventObject,
        $scope.eventModel, true, function() {
          if (!$scope.eventModel.objectId) {
            ajaxService.setEventStatus($scope.eventObject.toJSON().objectId,
              eventStatusListReverse['New event']);
          }
          ivrService.saveRecord($scope.eventObject.toJSON().objectId,
            $scope.ivrRecordFile);
          $state.go('app.eventList');
        });
    };

    $scope.toggleEventDisable = function() {
      if ($scope.eventModel.disabledAt) {
        $scope.eventModel.disabledAt = null;
      } else {
        $scope.eventModel.disabledAt = new Date();
      }

      eventService.saveEvent($scope.eventObject,
        $scope.eventModel, true);
    };

    $scope.statusList = [
      {id: 0, name: 'Confirmed'},
      {id: 1, name: 'Maybe'},
      {id: 2, name: 'Not coming'},
      {id: 3, name: 'Not responded'}
    ];

  }]);
