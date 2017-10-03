e2gApp.directive('time', ['dateFormat', function(dateFormat) {
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
      scope.$watch('eventModel', function() {
        element.find('.time').timepicker({ 'scrollDefault': 'now', timeFormat: dateFormat.formatTimePicker });
      })
    }
  }
}])