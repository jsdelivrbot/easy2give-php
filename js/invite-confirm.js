/**
 * Change contact status. Save to the service.
 * @param elem
 */
function changeStatus(elem) {

  var notComingStatus = 2;

  //change status in parse
  var newStatus = parseInt($(elem).data('value'));

  //set active button
  $('.status').removeClass('active');
  $(elem).addClass('active');

  if (newStatus == notComingStatus) {
    saveStatus(newStatus, 1);
  } else {
    setGuestNumber(newStatus);
  }
}

function saveStatus(newStatus, guestNumber) {
  $.post('/change-status', {
    status: newStatus,
    guest: guestNumber,
    contact: $('#status-block').data('contact')
  }, function(data) {
    $('body').scrollTop(0);
    $('header').fadeOut();
    $('.finish').fadeIn();
  });
}

function setGuestNumber(newStatus) {
  var maxNumberOfGuests = $('#guest-number').data('maxNumberOfGuests');

  $('#guest-number').spinner({
    min: 1,
    max: maxNumberOfGuests ? maxNumberOfGuests : null
  }).spinner('value', $('#status-block').data('guest'));
  $('#dialog').dialog({
    resizable: false,
    height: 240,
    modal: true,
    buttons: {
      'אשר': function() {
        var guestNumber = parseInt($('#guest-number').val());
        $(this).dialog('close');
        saveStatus(newStatus, guestNumber);
      }
    }
  });
}

$(function() {
  //set event for change status buttons
  $('.status').click(function() {
    changeStatus(this);
  });

  //activate selected button
  $('.status[data-value="' +
    $('#status-block').data('status') + '"]').addClass('active');
});
