$(document).ready(function() {
  var map = $('#map');
  var location = {
    lat: map.data('lat'),
    lng: map.data('lng')
  };
  var URL = window.location;
  var zoom = 17;

  var platform;
  if ((navigator.platform.indexOf('iPhone') != -1) ||
    (navigator.platform.indexOf('iPod') != -1) ||
    (navigator.platform.indexOf('iPad') != -1)) {
    platform = 'iOS';
  } else if (/(android)/i.test(navigator.userAgent)) {
    platform = 'android';
  } else {
    platform = 'web';
  };

  $('.app-list').each(function() {
    $(this).slick({
      prevArrow: '<button class="slick-btn prev-btn"></button>',
      nextArrow: '<button class="slick-btn next-btn"></button>',
      rtl: true,
      infinite: true,
      slidesToShow: parseInt($(this).data('slides-to-show')),
      slidesToScroll: 1
    });
  });

  var links = {
    googleMaps: {
      web: 'https://maps.google.com/?q=' +
        location.lat + ',' + location.lng,
      android: 'https://maps.google.com/?q=' +
        location.lat + ',' + location.lng,
      iOS: 'comgooglemaps://maps.google.com/?q=' +
        location.lat + ',' + location.lng
    },
    waze: {
      web: 'https://www.waze.com/livemap?zoom=' +
        zoom + '&lat=' + location.lat + '&lon=' + location.lng,
      android: 'waze://?z=' +
        zoom + '&ll=' + location.lat + ',' + location.lng + '&navigate=yes',
      iOS: 'waze://?z=' +
        zoom + '&ll=' + location.lat + ',' + location.lng + '&navigate=yes'
    },
    message: {
      web: null,
      android: 'sms:?body=' + URL,
      iOS: 'sms:&body=' + URL
    },
    mail: {
      web: 'mailto:?body=' + URL,
      android: 'mailto:?body=' + URL,
      iOS: 'mailto:?body=' + URL
    },
    twitter: {
      web: 'https://twitter.com/intent/tweet?text=' + URL,
      android: 'twitter://post?message=' + URL,
      iOS: 'twitter://post?message=' + URL
    },
    facebook: {
      web: 'https://www.facebook.com/dialog/send?%20' +
        'app_id=417537765054713&link=' + URL + '&redirect_uri=' + URL,
      android: 'https://www.facebook.com/dialog/send?%20' +
        'app_id=417537765054713&link=' + URL + '&redirect_uri=' + URL,
      iOS: 'https://www.facebook.com/dialog/send?%20' +
        'app_id=417537765054713&link=' + URL + '&redirect_uri=' + URL
    }
  };

  $('.app-list a').on('click', function(e) {
    e.preventDefault();

    var app = $(this).data('app');

    if (links[app][platform]) {
      window.location = links[app][platform];
    }
  });
});
