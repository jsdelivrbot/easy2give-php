e2gApp.factory('eventPlaceService', ['systemMessage', function(systemMessage) {

  function getEventPlacesList(callback) {
    var ParseObject = Parse.Object.extend('EventPlace');
    var query = new Parse.Query(ParseObject);

    query.find({
      success: function(list) {
        var modelList = [];
        var i = 0;
        for (key in list) {
          modelList[i] = list[key].toJSON();
          i++;
        }
        if (callback) {
          callback(modelList, list);
        }
      }
    });
  }

  function saveEventPlace(eventPlaceObject, eventPlaceModel, callback) {
    eventPlaceObject.set(eventPlaceModel);

    if (eventPlaceModel.venueLocation &&
      eventPlaceModel.venueLocation.latitude &&
      eventPlaceModel.venueLocation.longitude) {
      var venueLocation = new Parse.GeoPoint({
        latitude: eventPlaceModel.venueLocation.latitude,
        longitude: eventPlaceModel.venueLocation.longitude
      });
      eventPlaceObject.set('venueLocation', venueLocation);
    }
    eventPlaceObject.save().then(function() {
      systemMessage.showMessage('event place saved');
      if (callback) {
        callback();
      }
    }, function(error) {
      console.log(error);
      systemMessage
        .showMessage(error);
    });
  }

  function loadEventPlace(options, callback, errorCallback) {
    var ParseObject = Parse.Object.extend('EventPlace');
    var query = new Parse.Query(ParseObject);

    if (options && options.placeId) {
      query.get(options.placeId, {
        success: function(eventPlaceObject) {
          callback(eventPlaceObject, eventPlaceObject.toJSON());
        },
        error: function(error) {
          if (errorCallback) {
            errorCallback(error);
          }
        }
      });
    } else {
      var newEvent = new ParseObject();
      newEvent.save(null, {
        success: function(eventPlaceObject) {
          if (eventPlaceObject) {
            callback(eventPlaceObject, eventPlaceObject.toJSON());
          } else {
            if (errorCallback) {
              errorCallback();
            }
          }
        }
      });
    }
  }

  function deleteEventPlace(objectId) {
    var parseObject = Parse.Object.extend('EventPlace');
    var query = new Parse.Query(parseObject);
    query.get(objectId, {
      success: function(object) {
        object.destroy();
      }
    });
  }

  return {
    getEventPlacesList: getEventPlacesList,
    saveEventPlace: saveEventPlace,
    loadEventPlace: loadEventPlace,
    deleteEventPlace: deleteEventPlace
  };
}]);
