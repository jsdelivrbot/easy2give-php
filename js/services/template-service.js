e2gApp.factory('templateService', ['systemMessage', function(systemMessage) {

  function getList(callback) {
    var ParseObject = Parse.Object.extend('Template');
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

  function saveList(templateList) {
    var ParseObject = Parse.Object.extend('Template');

    var parseArray = [];

    for (var i = 0; i < templateList.length; i++) {
      var template = new ParseObject();
      template.set(templateList[i]);
      parseArray.push(template);
    }

    Parse.Object.saveAll(parseArray, {
      success: function(objs) {
        systemMessage.showMessage('Templates successfully saved!');
      },
      error: function(error) {
        systemMessage.showMessage('Error, try again');
      }
    })

  }

  return {
    getList: getList,
    saveList: saveList
  };
}]);
