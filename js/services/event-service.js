e2gApp.factory('eventService',
  [
    '$rootScope',
    '$filter',
    'systemMessage',
    'dateService',
    function($rootScope,
             $filter,
             systemMessage,
             dateService) {
      var eventObject;
      var eventModel;
      var currentEventId;

      function getEventObject() {
        return eventObject;
      }

      function getEventModel() {
        return eventModel;
      }

      function getById(eventId, callback, errorCallback) {
        var Event = Parse.Object.extend('Event');
        var eventQuery = new Parse.Query(Event);
        eventQuery.get(eventId, {
          success: function(event) {
            if (callback) {
              updateEvent(event, function(eventObject, eventModel) {
                callback(eventObject, eventModel);
              });
            }
          },
          error: function(error) {
            alert('Error: ' + error.code + ' ' + error.message);
            if (errorCallback) {
              errorCallback();
            }
          }
        });
      }

      function saveEvent(eventObject, eventModel, admin, callback) {
        var mainDiff = dateService.getDifference(eventModel.firstWave,
          eventModel.date);
        var waveDiff = dateService.getDifference(eventModel.firstWave,
          eventModel.secondWave);

        if (mainDiff > 0 || waveDiff > 0) {
          systemMessage.showMessage('תאריך הגל השני אינו יכול להיות ' +
            'מוקדם יותר מתאריך הגל הראשון.');
          return;
        }

        if (admin) {
          for (var key in eventModel) {
            eventObject.set(key, eventModel[key]);
          }

          if (eventModel.firstWaveSmsText) {
            eventObject.set('firstWaveSmsText',
              prepareSmsText(eventModel.firstWaveSmsText, eventModel));
          }

          if (eventModel.secondWaveSmsText) {
            eventObject.set('secondWaveSmsText',
              prepareSmsText(eventModel.secondWaveSmsText, eventModel));
          }

          if (eventModel.coupleAlertText) {
            eventObject.set('coupleAlertText',
              prepareSmsText(eventModel.coupleAlertText, eventModel));
          }

          if (eventModel.smsRemindText) {
            eventObject.set('smsRemindText',
              prepareSmsText(eventModel.smsRemindText, eventModel));
          }

          if (eventModel.disabledAt) {
            eventObject.set('disabledAt', dateService.newDate(eventModel.disabledAt));
          } else {
            eventObject.unset('disabledAt');
          }

          if (eventModel.locationPoint &&
            eventModel.locationPoint.latitude &&
            eventModel.locationPoint.longitude) {
            var locationPoint = new Parse.GeoPoint({
              latitude: eventModel.locationPoint.latitude,
              longitude: eventModel.locationPoint.longitude
            });
            eventObject.set('locationPoint', locationPoint);
          }
        } else {
          eventObject.set('firstWave', eventModel.firstWave);
          eventObject.set('secondWave', eventModel.secondWave);
        }

        var systemMessageText = (admin) ?
          'אירוע נשמר בהצלחה' :
        'שים לב, התזמונים שבחרת הם: גל ראשון בתאריך ' +
        dateService.getDate(dateService.parseDate(eventModel.firstWave)) +
        ' בשעה ' +
        dateService.getTime(dateService.parseDate(eventModel.firstWave)) +
        '. גל שני בתאריך ' +
        dateService.getDate(dateService.parseDate(eventModel.secondWave)) +
        ' בשעה ' +
        dateService.getTime(dateService.parseDate(eventModel.secondWave)) +
        '.';

        //check for unique before saving
        isUniqueCoupleId(eventModel, function() {
          //if unique - save an event
          eventObject.save().then(function() {
            systemMessage.showMessage(systemMessageText);
            if (callback) {
              callback();
            }
          }, function(error) {
            console.log(error);
            systemMessage
              .showMessage('אירעה שגיאה - בבקשה פנה אל שירות הלקוחות *5055');
          });
        }, function() {
          //if not unique - show alert
          systemMessage
            .showMessage('This couple ID already exists.');
        });
      }

      /**
       * Check is unique event's coupleId
       * @param eventModel
       * @param callback
       * @param errorCallback
       */
      function isUniqueCoupleId(eventModel, callback, errorCallback) {

        var query = new Parse.Query('Event');
        query.equalTo('coupleId', eventModel.coupleId);

        query.first({
          success: function(object) {

            //check if event found and not the same event
            if (object && object.id != eventModel.objectId) {
              errorCallback();
            } else {
              callback();
            }
          },
          error: function(error) {
            errorCallback();
          }
        });
      }

      /**
       * Get event list
       *
       * example of options object
       * var options = {
       *   equalTo: {
       *     someValue: true
       *   },
       *   doesNotExist: 'someValue'
       * }
       *
       * @param {object} options - object with parse methods and values
       * @param callback
       */
      function getEventList(options, callback) {
        var Event = Parse.Object.extend('Event');
        var eventsQuery = new Parse.Query(Event);
        eventsQuery.limit(1000);

        // applying all existing options to query
        if (options) {
          for (var method in options) {
            var methodOptions = options[method];
            if (typeof methodOptions === 'string') {
              eventsQuery[method](methodOptions);
            } else if (typeof methodOptions === 'object') {
              for (var key in methodOptions) {
                eventsQuery[method](key, methodOptions[key]);
              }
            }
          }
        }

        eventsQuery.find({
          success: function(responseObj) {
            var eventList = [];
            var i = 0;
            for (key in responseObj) {
              eventList[i] = responseObj[key].toJSON();
              i++;
            }
            if (callback) {
              callback(eventList);
            }
          }
        });
      }

      function getCallTeamEventList(callback) {
        var EventObject = Parse.Object.extend('Event');
        var eventQuery = new Parse.Query(EventObject);

        eventQuery.equalTo('callRSVP', true);

        var now = new Date();
        eventQuery.lessThan('callCenter', now);

        eventQuery.ascending('date');
        eventQuery.find({
          success: function(responseObj) {
            var eventList = [];
            var i = 0;
            for (key in responseObj) {
              eventList[i] = responseObj[key].toJSON();
              i++;
            }
            if (callback) {
              callback(eventList);
            }
          }
        });
      }

      function loadEvent(options, callback, errorCallback) {
        var EventObject = Parse.Object.extend('Event');
        var eventQuery = new Parse.Query(EventObject);

        if (options && options.eventId) {
          eventQuery.get(options.eventId, {
            success: function(event) {
              updateEvent(event, function(eventObject, eventModel) {
                if (callback) {
                  callback(eventObject, eventModel);
                }
              });
            },
            error: function(error) {
              if (errorCallback) {
                errorCallback(error);
              }
            }
          });
        } else if (options && (options.coupleId || options.password)) {
          eventQuery.equalTo('coupleId', options.coupleId);

          if (options.password) {
            eventQuery.equalTo('password', options.password);
          }

          eventQuery.first({
            success: function(event) {
              if (event) {
                updateEvent(event, function(eventObject, eventModel) {
                  if (callback) {
                    callback(eventObject, eventModel);
                  }
                });
              } else {
                if (errorCallback) {
                  errorCallback();
                }
              }
            },
            error: function(error) {
              alert('Error: ' + error.code + ' ' + error.message);
              if (errorCallback) {
                errorCallback(error);
              }
            }
          });
        } else {
          var newEvent = new EventObject();
          updateEvent(newEvent, function(eventObject, eventModel) {
            if (callback) {
              callback(eventObject, eventModel);
            }
          });
        }
      }

      function updateEvent(event, callback) {
        eventObject = event;

        eventModel = event.toJSON();

        if (callback) {
          callback(eventObject, eventModel);
        }

        if (currentEventId !== event.get('objectId')) {
          $rootScope.$broadcast('newEventUpdated');
        }
      }

      function deleteEvent(objectId) {
        var parseObject = Parse.Object.extend('Event');
        var query = new Parse.Query(parseObject);
        query.get(objectId, {
          success: function(object) {
            object.destroy();
          }
        });
      }

      function prepareSmsText(text, model) {
        if (model.brideName) {
          text = text.replace('%brideName%', model.brideName);
        }
        if (model.groomName) {
          text = text.replace('%groomName%', model.groomName);
        }
        if (model.date) {
          text = text.replace('%date%', dateService.getDate(dateService.parseDate(model.date)));
        }
        if (model.location) {
          text = text.replace('%location%', model.location);
        }
        if (model.locationLink) {
          text = text.replace('%locationLink%', model.locationLink);
        }
        return text;
      }

      return {
        getById: getById,
        getEventModel: getEventModel,
        getEventObject: getEventObject,
        loadEvent: loadEvent,
        saveEvent: saveEvent,
        getEventList: getEventList,
        getCallTeamEventList: getCallTeamEventList,
        deleteEvent: deleteEvent
      };
    }]);
