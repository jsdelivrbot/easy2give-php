e2gApp.directive('fullScreenHeight', function() {
  'use strict';

  return {
    restrict: 'A',
    link: function(scope, element) {
      var setHeight = (function self() {
        var windowHeight = $(window).height();
        var scrollTop = $(window).scrollTop();
        var elementOffset =  element.offset().top;
        var footerHeight = 70;
        var offset = (elementOffset - scrollTop) + footerHeight;
        var height = 300; // minimal height

        if ((windowHeight - offset) > height) {
          // rewrite height value if it could be more then 300px
          height = windowHeight - offset;
        }

        element.height(height);
        return self;
      })();

      $(window).on('resize', function() {
        setHeight();
      });
    }
  };
});
