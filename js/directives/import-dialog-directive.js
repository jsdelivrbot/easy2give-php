e2gApp.directive('importDialog', [function() {
  return {
    restrict: 'A',
    replace: true,
    templateUrl: 'templates/import-dialog.html',
    link: function(scope, element) {
      element.dialog({
        autoOpen: false,
        height: 'auto',
        width: 315,
        modal: true,
        resizable: false
      });
      scope.closeImportDialog = function() {
        element.dialog('close');
      };
      scope.openImportDialog = function() {
        element.dialog('open');
      };
      scope.getPattern = function() {
        return [];
      };
    }
  };
}]);
