e2gApp.directive('uploadPhoto', ['$timeout', '$q', 'systemMessage',
  function($timeout, $q, systemMessage) {

    var getResizeArea = function() {
      var resizeAreaId = 'fileupload-resize-area';

      var resizeArea = document.getElementById(resizeAreaId);

      if (!resizeArea) {
        resizeArea = document.createElement('canvas');
        resizeArea.id = resizeAreaId;
        resizeArea.style.visibility = 'hidden';
        document.body.appendChild(resizeArea);
      }

      return resizeArea;
    };

    var resizeImage = function(origImage, options) {
      var maxWidth = options.resizeMaxWidth || 250;
      var quality = 0.7;
      var type = options.resizeType || 'image/jpg';

      var canvas = getResizeArea();

      var height = origImage.height;
      var width = origImage.width;

      // calculate the width, constraining the proportions
      if (width > maxWidth) {
        height = Math.round(height *= maxWidth / width);
        width = maxWidth;
      }

      canvas.width = width;
      canvas.height = height;

      //draw image on canvas
      var ctx = canvas.getContext('2d');
      ctx.drawImage(origImage, 0, 0, width, height);

      // get the data from canvas as 70% jpg (or specified type).
      return canvas.toDataURL(type, quality);
    };

    var createImage = function(url, callback) {
      var image = new Image();
      image.onload = function() {
        callback(image);
      };
      image.src = url;
    };

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
        label: '=',
        imageSrc: '=',
        parseObject: '=',
        prop: '=',
        resizeMaxWidth: '='
      },
      template: '<label class="upload" ' +
      'ng-class="{\'image-uploaded\': model.url, \'loading\': loading}">' +
      '{{label}}' +
      '<img style="min-width: 100%; max-width: 100%; border-radius: 5px" ' +
      'ng-show="model.url" ng-src="{{model.url}}">' +
      '</label>' +
      '<input type="file" id="fileUpload"/>',

      controller: ['$rootScope', '$scope', '$timeout', function($rootScope, $scope, $timeout) {
        $rootScope.$on('changeImage', function() {
          $scope.changeImage();
        });

        $rootScope.$on('deleteImage', function() {
          $scope.deleteImage();
        });

        $scope.$watch('parseObject', function(newValue) {
          if (newValue && newValue.id) {
            updateModel(newValue);
          }
        });

        function updateModel(obj) {
          $timeout(function() {
            $scope.model = obj.toJSON();
            $scope.model.url = $scope.model[$scope.prop] ?
                $scope.model[$scope.prop].url : '';
          }, 0);
        }

        $scope.uploadImage = function(image) {
          var parseFile = new Parse.File('image', {base64: image});
          parseFile.save().then(function() {
            $scope.parseObject.set($scope.prop, parseFile);

            updateModel($scope.parseObject);
            // hide loader after file is uploaded
            $scope.toggleLoader();

            // broadcast that object updated for EventPlace
            $rootScope.$broadcast(
                $scope.parseObject.toJSON().objectId + 'Updated',
                $scope.parseObject);
          }, function(error) {
            console.log('error to save image to Parse', error);
          });
        };

        $scope.deleteImage = function() {
          $scope.parseObject.unset($scope.prop);
          $scope.parseObject.save().then(function() {
            updateModel($scope.parseObject);

            // broadcast that object updated for EventPlace
            $rootScope.$broadcast(
                $scope.parseObject.toJSON().objectId + 'Updated',
                $scope.parseObject);
          }, function(error) {
            console.log('error to delete image from Parse', error);
          });
        };
      }],
      link: function(scope, element, attrs) {
        var doResizing = function(imageResult, callback) {
          createImage(imageResult.url, function(image) {
            var dataURL = resizeImage(image, scope);
            document.body.removeChild(document.body.lastChild);
            imageResult.resized = {
              dataURL: dataURL,
              type: dataURL.match(/:(.+\/.+);/)[1]
            };
            callback(imageResult);
          });
        };

        scope.changeImage = function() {
          $('#fileUpload').trigger('click');
        };

        angular.element(element).bind('click', function(evt) {
          if (evt.target.parentElement.children[0] === evt.target) {
            systemMessage.showMessage('האם ברצונך להחליף או להסיר את התמונה?',
                'changeImage', 'deleteImage', 'להחליף', 'להסיר');
          }
        });

        scope.toggleLoader = function() {
          // do hiding with some delay
          var time = scope.loading ? 1000 : 0;
          $timeout(function() {
            scope.loading = !scope.loading;
          }, time);
        };

        element.bind('change', function(evt) {
          var file = evt.target.files[0];

          if (file) {
            // clear input value to bind if another photo added
            element.find('input[type=file]').val('');
            // show loader
            scope.toggleLoader();

            var imageResult = {
              file: file,
              url: URL.createObjectURL(file)
            };

            fileToDataURL(file).then(function(dataURL) {
              imageResult.dataURL = dataURL;
            });

            //resize image
            doResizing(imageResult, function(imageResult) {
              scope.uploadImage(imageResult.resized.dataURL);
            });
          }
        });
      }
    };
  }]);
