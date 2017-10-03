e2gApp.directive('dateTime', ['dateFormat', function(dateFormat) {
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
          var maxDate = moment(newValue.time + ' ' + newValue.date, dateFormat.format)
            .add({days: -6}).toDate();

          element.find('input').datetimepicker({
            format: dateFormat.format,
            formatTime: dateFormat.formatTime,
            formatDate: dateFormat.formatDate,
            minDate: 0,
            maxDate: (isMaxDate && maxDate) ? maxDate : false
          });
        }
      });
    }
  };
}]);
