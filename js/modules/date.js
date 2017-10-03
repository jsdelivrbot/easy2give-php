Date.parseDate = function(input, format) {
  return moment(input, format).toDate();
};
Date.prototype.dateFormat = function(format) {
  return moment(this).format(format);
};

angular.module('e2gApp.date', [])
    .constant('dateFormat', {
      formatTime: 'HH:mm',
      formatDate: 'DD/MM/YYYY',
      format: 'HH:mm DD/MM/YYYY',
      formatTimePicker: 'H:i',
      formatDatePicker: 'd/m/Y',
      formatDateTimePicker: 'H:i d/m/Y'
    })
    .factory('dateService', ['dateFormat', function(dateFormat) {
      /**
       * Changes parse date object to moment date object
       *
       * @param {*} dateObject - date from parse or string
       * @returns {Object} - moment date object
       */
      function parseDate(dateObject) {
        if (!dateObject) {
          return null;
        }
        var date = dateObject.iso ?
            parseStringDate(dateObject.iso) : parseStringDate(dateObject);
        return date;
      }

      /**
       * Changes date string to date
       *
       * @param {string} dateString
       * @returns {object} - moment date object
       */
      function parseStringDate(dateString) {
        if (!dateString) {
          return null;
        }
        return moment(dateString).format(dateFormat.format);
      }

      /**
       * Creates new date object from date string
       *
       * @param {string} dateString
       * @returns {object} - date object
       */
      function newDate(dateString) {
        if (!dateString) {
          return null;
        }
        var newDateString = moment(dateString, dateFormat.format).toDate();
        return new Date(newDateString);
      }

      /**
       * Get date from date object, moment object or date string
       *
       * @param {*} date - date object, moment object or date string
       * @returns {string} - date string
       */
      function getDate(date) {
        if (!date) {
          return null;
        }
        return moment(date, dateFormat.format).format(dateFormat.formatDate);
      }

      /**
       * Get time from date object, moment object or date string
       *
       * @param {*} date - date object, moment object or date string
       * @returns {string} - time string
       */
      function getTime(date) {
        if (!date) {
          return null;
        }
        return moment(date, dateFormat.format).format(dateFormat.formatTime);
      }

      /**
       * Shows difference between two dates
       *
       * @param {*} firstDate - date object or string
       * @param {*} secondDate - date object or string
       * @returns {number} - number of miliseconds between firstDate and secondDate
       */
      function getDifference(firstDate, secondDate) {
        if (!firstDate || !secondDate) {
          return -1;
        }

        var a = moment.isMoment(firstDate) ? firstDate :
            momentize(firstDate);
        var b = moment.isMoment(secondDate) ? secondDate :
            momentize(secondDate);

        return a.diff(b);
      }

      /**
       * Returns true if date has passed
       *
       * @param {string} dateString
       * @returns {boolean}
       */
      function hasPassed(dateString) {
        var date = moment(dateString, dateFormat.format);
        var now = moment(new Date());
        return getDifference(now, date) > 0;
      }

      /**
       * Returns moment object
       *
       * @param {*} date - date string or date object
       * @returns {object} - moment object
       */
      function momentize(date) {
        if (typeof date === 'object') {
          return date.iso ? moment(parseDate(date), dateFormat.format) : moment(date);
        }
        return moment(date, dateFormat.format);
      }

      return {
        parseDate: parseDate,
        parseStringDate: parseStringDate,
        newDate: newDate,
        getDate: getDate,
        getTime: getTime,
        getDifference: getDifference,
        hasPassed: hasPassed
      };
    }])
    .directive('date', ['dateFormat', 'dateService',
      function(dateFormat, dateService) {
      // template for separated date and time
      var separatedTemplate = '<div class="row">' +
          '<section class="col col-sm-6">' +
            '<label class="input" ng-class="{\'state-error\': form[dateFieldName].$invalid && (form.$submitted || form[dateFieldName].$touched)}">' +
              '{{dateLabel}}' +
              '<input ng-model="inputDate" name="{{dateFieldName}}" ' +
                     'placeholder="{{placeholder}}" ' +
                     'class="date-picker" ' +
                     'ng-disabled="disabledForever ? disabledForever : disabled" ' +
                     'ng-required="required">' +
            '</label>' +
          '</section>' +
          '<section class="col col-sm-6">' +
            '<label class="input" ng-class="{\'state-error\': form[timeFieldName].$invalid && (form.$submitted || form[timeFieldName].$touched)}">' +
              '{{timeLabel}}' +
              '<input ng-model="inputTime" name="{{timeFieldName}}" ' +
                     'placeholder="{{placeholder}}" ' +
                     'class="time-picker" ' +
                     'ng-disabled="disabledForever ? disabledForever : disabled" ' +
                     'ng-required="required">' +
            '</label>' +
          '</section>' +
          '</div>';

      // template for full date field
      var fullDateTemplate = '<div class="row">' +
          '<section class="col col-sm-12">' +
            '<label class="input" ng-class="{\'state-error\': form[fieldName].$invalid && (form.$submitted || form[fieldName].$touched)}">' +
              '{{label}}' +
              '<input ng-model="fullDate" name="{{fieldName}}" ' +
                     'placeholder="{{placeholder}}" ' +
                     'class="date-time-picker" ' +
                     'ng-disabled="disabledForever ? disabledForever : disabled" ' +
                     'ng-required="required">' +
            '</label>' +
          '</section>' +
          '</div>';

      var couplePageTemplate = '<label class="date" ng-class="{disabled: disabledForever ? disabledForever : disabled}">' +
          '{{label}}' +
          '<input ng-model="fullDate" name="{{fieldName}}" ' +
                 'placeholder="{{placeholder}}" ' +
                 'class="date-time-picker" ' +
                 'ng-disabled="disabledForever ? disabledForever : disabled">' +
          '</label>';

      // returns one of templates depending on separated attribute in directive
      function getTemplate(el, attrs) {
        var separated = Boolean(attrs.separated);
        var couplePage = Boolean(attrs.couplePage);

        if (couplePage) {
          return couplePageTemplate;
        }

        if (separated) {
          return separatedTemplate;
        }
        return fullDateTemplate;
      }

      return {
        restrict: 'A',
        template: getTemplate,
        scope: {
          date: '=',
          depends: '=',
          form: '=',
          disabledForever: '=',
          couplePage: '@',
          required: '@',
          fieldName: '@',
          label: '@',
          separated: '@'
        },
        controller: ['$scope', function($scope) {
          // init labels and field names
          if ($scope.separated) {
            $scope.dateLabel = $scope.label + ' date';
            $scope.timeLabel = $scope.label + ' time';
            $scope.dateFieldName = $scope.fieldName + 'Date';
            $scope.timeFieldName = $scope.fieldName + 'Time';
          } else if (!$scope.couplePage) {
            $scope.label = $scope.label + ' date';
          }

          // fields are disabled when appropriate attribute is set
          $scope.disabled = Boolean($scope.depends);
          $scope.disabledForever = Boolean($scope.disabledForever);

          // when inputs aren't disabled forever then watch properties below
          if (!$scope.disabledForever) {
            // watch for inputDate and inputTime models
            // to make full date string
            $scope.$watch('inputDate', concatenator);
            $scope.$watch('inputTime', concatenator);

            // watch for fullDate to change date model
            $scope.$watch('fullDate', function(newValue) {
              $scope.date = dateService.newDate(newValue);
            });

            // watch for min and max dates if they exist
            if ($scope.depends && $scope.depends.min) {
              $scope.$watch('depends.min.date', datesWatcher);
            }
            if ($scope.depends && $scope.depends.max) {
              $scope.$watch('depends.max.date', datesWatcher);
            }
          }

          // watch for depends date if it exists
          if ($scope.depends && $scope.depends.diff) {
            $scope.$watch('depends.date', datesWatcher);
          }

          // watch for date only to init first values
          var watchOnce = $scope.$watch('date', function(newValue) {
            if (!newValue) {
              return;
            }
            var date = dateService.parseDate(newValue);
            $scope.inputDate = dateService.getDate(date);
            $scope.inputTime = dateService.getTime(date);

            // unwatch
            watchOnce();
          });

          function concatenator() {
            if (!$scope.inputTime || !$scope.inputDate) {
              $scope.fullDate = null;
              return;
            }
            $scope.fullDate = $scope.inputTime + ' ' + $scope.inputDate;
          }

          function datesWatcher(newValue) {
            if ($scope.disabledForever) {
              if (newValue) {
                enable();
                return;
              } else {
                disable();
                return;
              }
            }

            // if there no one of dates on which directive date depends
            // then disable fields
            if ($scope.depends &&
                (($scope.depends.diff && !$scope.depends.date) ||
                 ($scope.depends.min && !$scope.depends.min.date) ||
                 ($scope.depends.max && !$scope.depends.max.date))) {
              disable();
              return;
            }
            enable();
          }

          function disable() {
            $scope.disabled = true;
            $scope.placeholder = $scope.depends ? $scope.depends.placeholder : '';
            $scope.fullDate = null;
            $scope.inputDate = null;
            $scope.inputTime = null;
            $scope.date = null;
          }

          function enable() {
            $scope.disabled = false;
            $scope.placeholder = '';
            if ($scope.disabledForever && $scope.depends && $scope.depends.date) {
              $scope.fullDate = moment(
                  dateService.parseDate($scope.depends.date),
                  dateFormat.format
              ).add($scope.depends.diff).format(dateFormat.format);
            } else {
              $scope.fullDate = dateService.parseDate($scope.date);
            }

            $scope.inputDate = dateService.getDate($scope.fullDate);
            $scope.inputTime = dateService.getTime($scope.fullDate);

            // reinit dateTimePicker if date becomes enabled and if not disabled forever
            if (!$scope.disabledForever) {
              $scope.initDateTimePicker();
            }
          }
        }],
        link: function(scope, element, attrs) {
          scope.initDateTimePicker = function() {
            var maxDate;
            var minDate;
            // if min date or max date are set then momentize them
            // and add days difference
            if (scope.depends) {
              if (scope.depends.max && scope.depends.max.date) {
                maxDate = moment(dateService.parseDate(scope.depends.max.date),
                    dateFormat.format)
                    .add(scope.depends.max.diff).format();
              }
              if (scope.depends.min && scope.depends.min.date) {
                minDate = moment(dateService.parseDate(scope.depends.min.date),
                    dateFormat.format)
                    .add(scope.depends.min.diff).format();
              }
            }

            // init apart datePicker and timePicker
            if (scope.separated) {
              element.find('.date-picker').datetimepicker({
                format: dateFormat.formatDatePicker,
                timepicker: false,
                minDate: minDate ? minDate : 0,
                maxDate: maxDate ? maxDate : false,
                scrollMonth: false,
                scrollInput: false
              });
              element.find('.time-picker').datetimepicker({
                format: dateFormat.formatTimePicker,
                datepicker: false
              });
              return;
            }

            // if not separated then init dateTimePicker
            element.find('.date-time-picker').datetimepicker({
              format: dateFormat.formatDateTimePicker,
              minDate: minDate ? minDate : 0,
              maxDate: maxDate ? maxDate : false,
              scrollMonth: false,
              scrollInput: false
            });
          };

          // init when not disabled forever
          if (!scope.disabledForever) {
            scope.initDateTimePicker();
          }
        }
      };
    }]);
