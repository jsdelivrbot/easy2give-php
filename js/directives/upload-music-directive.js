e2gApp.directive('uploadRecord', ['$q', '$sce', function($q, $sce) {
  var fileToDataURL = function(file) {
    var deferred = $q.defer();
    var reader = new FileReader();
    reader.onload = function(e) {
      deferred.resolve(e.target.result);
    };
    reader.readAsDataURL(file);
    return deferred.promise;
  };

  return {
    restrict: 'A',
    scope: {
      parseObject: '=',
      prop: '=',
      ivrRecordObj: '=',
      ivrRecordFile: '='
    },
    template: '<label class="btn btn-sm btn-success"> ' +
      '<i class="fa fa-upload"></i>Select File for IVR ' +
      '<input name="ivrRecordFile" type="file" accept="audio/mp3"> ' +
    '</label> ' +
    '<audio ng-show="ivrRecordObj.url" ' +
        'ng-src="{{trustSrc(ivrRecordObj.url)}}" ' +
        'type="audio/mp3" controls="controls"></audio>',
    controller: ['$rootScope', '$scope', function($rootScope, $scope) {
      $scope.trustSrc = function(src) {
        if (src) {
          return $sce.trustAsResourceUrl(src);
        }
      };

      function updateRecord(obj) {
        $scope.ivrRecordObj = obj.toJSON();
      }

      $scope.uploadRecord = function(name, record) {
        var recordBase64 = record.replace(/^data:audio\/(mp3);base64,/, '');
        var parseFile = new Parse.File(name, {base64: recordBase64});
        parseFile.save().then(function() {
          updateRecord(parseFile);

          // broadcast that object updated
          $rootScope.$broadcast(
            $scope.parseObject.toJSON().objectId + 'Updated',
            $scope.parseObject);
        }, function(error) {
          console.log('error to save record to Parse', error);
        });
      };
    }],
    link: function(scope, element, attrs) {
      element.bind('change', function(evt) {
        var file = evt.target.files[0];
        scope.ivrRecordFile = file;
        if (file) {
          var recordResult = {
            file: file,
            url: URL.createObjectURL(file)
          };

          fileToDataURL(file).then(function(dataURL) {
            recordResult.dataURL = dataURL;
            scope.uploadRecord(recordResult.file.name, recordResult.dataURL);
          });
        }
      });
    }
  };
}]);
