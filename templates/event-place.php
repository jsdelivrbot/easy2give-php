<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm</title>
  <link rel="stylesheet" href="/libs/slick-carousel/slick/slick.css">
  <link rel="stylesheet" href="/libs/slick-carousel/slick/slick-theme.css">
  <link rel="stylesheet" href="/stylesheets/css/invite-confirm.css" media="screen" title="no title" charset="utf-8">

  <script type="text/javascript" src='http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>
  <script type="text/javascript" src="/libs/slick-carousel/slick/slick.min.js"></script>
  <script type="text/javascript" src="/libs/dragscroll/dragscroll.js"></script>
  <script type="text/javascript" src="/js/event-place.js"></script>

</head>
<body class="rtl">
<div class="main-wrapper">

  <h1>תצוגה מקדימה</h1>

  <div class="phone-wrapper">
    <div class="inner dragscroll">
      <header>
        <div class="container">
          <div class="logo">
            <img src="/stylesheets/img/logo.png" alt=""/>
          </div>
        </div>
      </header>
      <div class="wrapper">
        <div class="container">
          <div class="venue-info clearfix">
            <div class="description">
              <p class="name"><?=$data['venueName']?></p>
              <p><?=$data['venueAddress']?></p>
              <p><?=$data['venuePhone']?></p>
            </div>
            <div class="venue-logo" style="background-image: url(<?=$data['venueLogo']?>)">
            </div>
          </div>
          <h4 class="title">נווטו למקום</h4>
          <ul class="app-list slick-flex" data-slides-to-show="3">
            <li>
              <a href="#" data-app="waze" class="waze"></a>
            </li>
            <li>
              <a href="#" data-app="googleMaps" class="gmaps"></a>
            </li>
          </ul>
          <div id="map" data-lat="<?=$data['venueLocationLatitude']?>" data-lng="<?=$data['venueLocationLongitude']?>" style="background-image: url(https://maps.googleapis.com/maps/api/staticmap?&center=<?=$data['venueLocationLatitude']?>,<?=$data['venueLocationLongitude']?>&zoom=16&size=378x286&maptype=roadmap&markers=color:red%7C<?=$data['venueLocationLatitude']?>,<?=$data['venueLocationLongitude']?>&key=AIzaSyDtGyiFaatHSR9KN69gK0a2N9df87qWJeE&language=he)"></div>
          <h4 class="title">שתפו מיקום</h4>
          <ul class="app-list slick-flex" data-slides-to-show="4">
            <li>
              <a href="#" data-app="message" class="message"></a>
            </li>
            <li>
              <a href="#" data-app="mail" class="mail"></a>
            </li>
            <li>
              <a href="#" data-app="twitter" class="twitter"></a>
            </li>
          </ul>

          <?php if ($data['showBanner']): ?>
          <a href="http://www.easy2gift.co.il/" class="attention">
            <img src="/stylesheets/img/banner.png" alt="">
          </a>
          <?php endif; ?>
        </div>
      </div>
    </div>
  </div>
</div>
</body>
</html>