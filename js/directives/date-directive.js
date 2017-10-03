e2gApp.directive('date', ['dateFormat', function(dateFormat) {
  return {
    restrict: 'A',
    scope: true,
    controller: [
      '$rootScope',
      '$scope',
      'eventService',
      function($rootScope,
               $scope,
               eventService) {
        $rootScope.$on('newEventUpdated', function() {
          $scope.eventModel = eventService.getEventModel();
        });
      }],
    link: function(scope, element, args) {
      scope.$watch('eventModel', function(newValue) {
        if (newValue && newValue.date !== undefined) {
          var isMaxDate = (args.maxDate) ? JSON.parse(args.maxDate) : false;
          var diff;

          if (isMaxDate) {
            var maxDate = moment(newValue.time + ' ' + newValue.date, dateFormat.format)
              .add({days: -6});
            var now = moment();
            diff = moment.duration(maxDate.diff(now)).get('days');
          }

          element.find('.date').datepicker({
            dateFormat: dateFormat.formatDatePicker,
            minDate: 0,
            maxDate: (isMaxDate && diff) ? diff : '+1970/01/2'
          });
        }
      });
    }
  };
}]);
