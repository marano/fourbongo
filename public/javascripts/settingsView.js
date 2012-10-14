var settingsView = function () {
  var api = {};
  var pvt = { settingsOptions: null };

  api.bindToSettingsIconHover = function (callback) { $('#settings').mousemove(callback); };

  api.showSettingsIcon = function (callback) {
    var settingsDiv = $('<div>', {id:'settings'}).css('opacity', '.0').html("<img id='settingsIcon' src='/settings.png' />").appendTo($('body'));
    settingsDiv.animate({'opacity' : '.6'}, {easing: 'easeOutQuad', duration: 1000, complete: callback});
  };

  api.hideSettings = function () { $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#settings').remove(); }}); };

  api.showSettingsOptions = function (callback) {
    var opacity = $('#settings').css('opacity');
    $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuad', duration: 500, complete: function () {
      $('#settingsIcon').remove();
      if (pvt.settingsOptions == null) {
        $.get('/settings', function (html) {
          pvt.settingsOptions = html;
          pvt.showLoadedSettingsOptions(opacity, callback);
        });
      } else {
        pvt.showLoadedSettingsOptions(opacity, callback);
      }
    }});
  };

  pvt.showLoadedSettingsOptions = function (opacity, callback) {
    $('#settings').append(pvt.settingsOptions);
    callback();
    $('#settings').animate({'opacity' : opacity}, {easing: 'easeOutQuad', duration: 500});
  };

  api.setPostsCountLabel = function (count) {
    $('#postsCountLabel').text(count);
  };

  api.selectSortByRandom = function () { $('#sortByRandom').attr('checked', true); };

  api.bindToSortByRandomButton = function (callback) {
    $('#sortByRandom').click(function () { callback($('#sortByRandom').attr('value')); });
  };

  api.selectSortByPublication = function () { $('#sortByPublication').attr('checked', true); };

  api.bindToSortByPublicationButton = function (callback) {
    $('#sortByPublication').click(function () { callback($('#sortByPublication').attr('value')); });
  };

  api.selectSortOrder = function (sortOrder) { $('input:radio[value=' + sortOrder + ']').attr('checked', true); };

  api.setCurrentTimeRange = function (label, index) {
    api.setCurrentTimeRangeLabel(label);
    $('#currentTimeRangeSlider').attr('value', index);
  };

  api.setCurrentTimeRangeLabel = function (description) { $('#currentTimeRangeLabel').text(description); };

  api.prepareTimeRangeSlider = function (sliderSize) {
    $('#currentTimeRangeSlider').attr('max', sliderSize - 1);
  }

  api.bindTimeRangeSlider = function (callback) {
    $('#currentTimeRangeSlider').change(function () { callback($('#currentTimeRangeSlider').attr('value')); });
  }

  api.setCurrentLocationBasedUpdatesDistanceRange = function (range) {
    api.setCurrentLocationBasedUpdatesDistanceRangeLabel(range);
    $('#currentLocationBasedUpdatesDistanceRangeSlider').attr('value', range);
  };

  api.setCurrentLocationBasedUpdatesDistanceRangeLabel = function (range) { $('#currentLocationBasedUpdatesDistanceRangeLabel').text(range + "m"); };

  api.prepareLocationBasedUpdatesDistanceRangeSlider = function (sliderMin, sliderMax) {
    $('#currentLocationBasedUpdatesDistanceRangeSlider').attr('max', sliderMax).attr('min');
  };
  
  api.bindLocationBasedUpdatesDistanceRangeSlider = function (callback) {
    $('#currentLocationBasedUpdatesDistanceRangeSlider').change(function () { callback($('#currentLocationBasedUpdatesDistanceRangeSlider').attr('value')); });
  };

  api.setCurrentSpeed = function (label, index) {
    api.setCurrentSpeedLabel(label);
    $('#currentSpeedSlider').attr('value', index);
  };

  api.setCurrentSpeedLabel = function (description) { $('#currentSpeedLabel').text(description); };

  api.prepareSpeedSlider = function (sliderSize) {
    $('#currentSpeedSlider').attr('max', sliderSize - 1);
  }

  api.bindSpeedSlider = function (callback) {
    $('#currentSpeedSlider').change(function () { callback($('#currentSpeedSlider').attr('value')); });
  }

  api.bindToShowTwitterButton = function (callback) {
    $('#showTwitter').click(function () { callback($('#showTwitter').is(':checked') + ''); });
  };

  api.bindToShowInstagramButton = function (callback) {
    $('#showInstagram').click(function () { callback($('#showInstagram').is(':checked') + ''); });
  };

  api.bindToShowFlickrButton = function (callback) {
    $('#showFlickr').click(function () { callback($('#showFlickr').is(':checked') + ''); });
  };

  api.setShowTwitter = function (value) {
    $('#showTwitter').attr('checked', value);
  }

  api.setShowInstagram = function (value) {
    $('#showInstagram').attr('checked', value);
  }

  api.setShowFlickr = function (value) {
    $('#showFlickr').attr('checked', value);
  }

  api.hideDistanceRange = function () {
    $('#distanceRange').hide();
  };

  api.hideShowFlickr = function () {
    $('#showFlickr').hide();
    $('#showFlickrLabel').hide();
  };

  return api;
}();
