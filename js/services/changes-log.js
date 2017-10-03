e2gApp.factory('changesLogService', ['dateService', 'localStorageService',
  function(dateService, localStorageService) {

    function saveChangesLog(parseObject, parseModel, contentType) {
      var ChangesLog = Parse.Object.extend('ChangesLog');
      var changesLog = new ChangesLog();
      var details = {};
      var oldParseModel = parseObject.toJSON();
      var updatedBy = localStorageService.get('userType');

      for (var key in parseModel) {
        // Check if property exists and it is parse date object
        // then work with it as with date
        // otherwise do nothing
        var oldValue = (oldParseModel[key] && (typeof oldParseModel[key] === 'object' && oldParseModel[key].iso)) ?
                        dateService.newDate(dateService.parseDate(oldParseModel[key])) :
                        oldParseModel[key];

        var newValue = (parseModel[key] && (typeof parseModel[key] === 'object' && parseModel[key].iso)) ?
                        dateService.newDate(dateService.parseDate(parseModel[key])) :
                        parseModel[key];

        if (JSON.stringify(newValue) !== JSON.stringify(oldValue)) {
          details[key] = {};
          details[key].newValue = newValue;
          details[key].oldValue = oldValue;
        }
      }

      //nothing changed
      if (!Object.keys(details).length) {
        return true;
      }

      if (!oldParseModel.objectId) {
        changesLog.set('action', 'create');
        changesLog.set('contentId', parseModel.objectId);
      } else {
        changesLog.set('contentId', oldParseModel.objectId);
        changesLog.set('action', 'update');
      }
      changesLog.set('details', JSON.stringify(details));
      changesLog.set('contentType', contentType);
      changesLog.set('updatedBy', updatedBy);

      changesLog.save();
      return true;
    }

    function getChangesLog(objectId, callback) {
      var changesLog = Parse.Object.extend('ChangesLog');
      var changesLogQuery = new Parse.Query(changesLog);
      changesLogQuery.limit(1000);
      changesLogQuery.descending('createdAt');
      if (objectId) {
        changesLogQuery.equalTo('objectId', objectId);
      }

      changesLogQuery.find({
        success: function(respondObj) {
          var list = [];
          var i = 0;
          for (key in respondObj) {
            list[i] = respondObj[key].toJSON();
            i++;
          }
          if (callback) {
            callback(list);
          }
        }
      });
    }

    return {
      saveChangesLog: saveChangesLog,
      getChangesLog: getChangesLog
    };
  }]);
