angular.module('systemMessage', [])
  .factory('systemMessage', ['$rootScope', function($rootScope) {
    function showMessage(message, confirmEvent, denyEvent, confirmButtonText, denyButtonText, uploading) {
      $rootScope.$broadcast('showMessage', message, confirmEvent, denyEvent, confirmButtonText, denyButtonText, uploading);
    }

    function hideMessage() {
      $rootScope.$broadcast('hideMessage');
    }

    function progress(dynamic, max) {
      $rootScope.$broadcast('progress', dynamic, max);
    }

    return {
      showMessage: showMessage,
      hideMessage: hideMessage,
      progress: progress
    };
  }])
  .directive('systemMessage', [function() {
    return {
      restrict: 'A',
      template: '<div id="system-message">' +
        '<div ng-if="!list">{{message}}</div>' +
        '<div ng-if="uploading"><uib-progressbar ng-show="max" max="max" value="dynamic" style="min-width: 20%;"><span style="color:white; white-space:nowrap;"></span></uib-progressbar> </div>' +
        '<div ng-if="message.top">{{message.top}}</div>' +
          '<ol ng-if="list">' +
            '<li ng-repeat="item in message track by $index">' +
              '<span ng-bind="item.name"></span><span> - {{item.phone}}</span>' +
            '</li>' +
          '</ol>' +
        '</div>',
      scope: {},
      controller: [
        '$rootScope',
        '$scope',
        '$timeout',
        function($rootScope,
                 $scope,
                 $timeout) {

          $rootScope.$on('showMessage', function(e, message, confirmEvent,
                                                 denyEvent, confirmButtonText,
                                                 denyButtonText, uploading) {
            $timeout(function() {
              $scope.list = (typeof message !== 'string');
              $scope.message = message;
              $scope.confirmEvent = (confirmEvent) ? confirmEvent : null;
              $scope.confirmButtonText = (confirmButtonText) ? confirmButtonText : null;
              $scope.denyButtonText = (denyButtonText) ? denyButtonText : null;
              $scope.denyEvent = (denyEvent) ? denyEvent : null;
              $scope.uploading = (uploading) ? uploading : null;
              $scope.showMessage();
            }, 0);
          });

          $rootScope.$on('hideMessage', function() {
            $timeout(function() {
              $scope.hideMessage();
            });
          });

          $scope.confirm = function() {
            $rootScope.$broadcast($scope.confirmEvent);
          };

          $scope.deny = function() {
            $rootScope.$broadcast($scope.denyEvent);
          };

        }],
      link: function(scope, element) {
        var buttons;
        var dialogClass;

        scope.showMessage = function() {
          if (scope.confirmEvent) {
            // create two buttons for confirm dialog
            buttons = [{
              text: scope.denyButtonText ? scope.denyButtonText : 'לא',
              click: function() {
                scope.deny();
                scope.hideMessage();
              }
            },
              {
                text: scope.confirmButtonText ? scope.confirmButtonText : 'כן',
                click: function() {
                  scope.hideMessage();
                  scope.confirm();
                }
              }];

            dialogClass = 'confirm-dialog';
          } else if (scope.uploading) {
            buttons = [];
          } else {
            // create one button to show only system message
            buttons = [{
              text: 'אשר',
              click: function() {
                scope.hideMessage();
              }
            }];

            dialogClass = '';
          }

          var options = {
            autoOpen: true,
            width: 300,
            modal: true,
            title: 'שימו לב!',
            buttons: buttons,
            dialogClass: (dialogClass) ? dialogClass : 'custom-message',
            position: {
              my: 'center',
              at: 'center',
              of: window
            },
            close: function() {
              element.dialog('destroy');
            }
          };
          if (scope.uploading) {
            options.closeOnEscape = false;
            options.open = function(event, ui) {
              $('.ui-dialog-titlebar-close', ui.dialog).hide();
            };
          }
          element.dialog(options);
        };

        scope.hideMessage = function() {
          element.dialog('close');
        };

        scope.$on('progress', function(e, dynamic, max) {
          scope.dynamic = dynamic;
          scope.max = max;
        });
      }
    };
  }]);
