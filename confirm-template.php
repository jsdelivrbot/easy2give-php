<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm</title>
  <link rel="stylesheet" href="/stylesheets/css/invite-confirm.css" media="screen"
        title="no title" charset="utf-8">
  <script type="text/javascript" src='http://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>
  <link rel="stylesheet" href="//code.jquery.com/ui/1.11.4/themes/smoothness/jquery-ui.css">
  <script src="//code.jquery.com/ui/1.11.4/jquery-ui.js"></script>
  <script type="text/javascript" src="/js/invite-confirm.js"></script>
  <script type="text/javascript" src="/libs/dragscroll/dragscroll.js"></script>

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

          <div class="finish">
            <div class="logo">
              <img src="/stylesheets/img/logo-clear.png" alt="">
            </div>
            <h2><span>תודה!</span> סטטוס הגעתך עודכן.</h2>

            <?php if ($data['showBanner']): ?>
            <a href="http://www.easy2gift.co.il/" class="attention">
              <img src="/stylesheets/img/banner_biz_1.png" alt="">
            </a>
            <?php endif; ?>
          </div>

          <h2 class="title">שלום <?=$data['contactName']?>,<br>בואו לחגוג איתנו!<br><?=$data['brideName']?>
            ו<?=$data['groomName']?>.</h2>

          <div class="info">
            <a href="<?=$data['locationLink']?>" class="place" id="location" data-content="Open in navigator"
               data-content-rtl="לניווט לחצו כאן"><?=$data['location']?></a>
            <a href="<?=$data['dateLink']?>" class="date" id="date" data-content="Add to calendar"
               data-content-rtl="שמור תאריך ביומן"><?=$data['date']?></a>
          </div>

          <div class="photo">
            <img src="<?=$data['image']?>" alt="" id="image"/>
          </div>

          <h2 class="question">אשרו את הגעתכם</h2>

          <div class="btn-group clearfix" id="status-block" data-status="<?=$data['status']?>"
               data-guest="<?=$data['guest']?>" data-contact="<?=$data['contactId']?>">
            <button type="button" class="confirmed status" data-value="0" name="button">מגיע</button>
            <button type="button" class="maybe status" data-value="1" name="button">אולי</button>
            <button type="button" class="not-coming status" data-value="2" name="button">לא מגיע</button>
          </div>

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
<div id="dialog" style="display: none" title="מספר מוזמנים">
  <p style="text-align: center"><input id="guest-number"
                                       data-max-number-of-guests="<?=($data['maxNumberOfGuests'])?>"
                                       style="height: 50px; width: 40px; font-size: 27px;" disabled>
  </p>
</div>
</body>
</html>