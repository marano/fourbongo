var wallPage = function () {
  var api = {};
  var pvt = { settingsOptions: null };

  api.noUpdatesSlide = function () { return $('<div id="noUpdates">OMG! Nothing to show. Try changing your filters.</div>'); };

  api.createWallContainerHtml = function () { $('#wallContainer').css('display', 'inline-block').css('width', '100%').css('height', '100%').css('position', 'relative'); };

  api.bindToSettingsIconHover = function (callback) { $('#settings').mousemove(callback); };
  
  api.showSettingsIcon = function (callback) {
    var settingsDiv = $('<div>', {id:'settings'}).css('opacity', '.0').html("<img id='settingsIcon' src='/settings.png' />").appendTo($('body'));
    settingsDiv.animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000, complete: callback});
  };

  api.hideSettings = function () { $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#settings').remove(); }}); };

  api.showSettingsOptions = function (callback) {
    var opacity = $('#settings').css('opacity');
    $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () {
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
    $('#settings').animate({'opacity' : opacity}, {easing: 'easeOutQuint', duration: 1000});
  };

  api.setPostsCountLabel = function (count) {
    $('#postsCountLabel').text(count);
  };

  api.selectSortByRandom = function () { $('#sortByRandom').attr('checked', true); };

  api.bindToSortByRandomButton = function (callback) {
    $('#sortByRandom').click(function () { callback($('#sortByRandom').attr('value')); });
  };
  
  api.selectSortByPublication = function () { $('#sortByPublication').attr('checked', true); };

  pvt.setCurrentTimeRange = function (range) {
    api.setCurrentTimeRangeLabel(range);
    $('#currentTimeRangeSlider').attr('value', range.index);
  };
  
  api.setCurrentTimeRangeLabel = function (range) { $('#currentTimeRangeLabel').text(range.description); };

  api.prepareTimeRangeSlider = function (currentValue, sliderSize, callback) {
    $('#currentTimeRangeSlider').change(function () { callback($('#currentTimeRangeSlider').attr('value')); });
    $('#currentTimeRangeSlider').attr('max', sliderSize - 1);
    pvt.setCurrentTimeRange(currentValue);
  }

  pvt.setCurrentLocationBasedUpdatesDistanceRange = function (range) {
    api.setCurrentLocationBasedUpdatesDistanceRangeLabel(range);
    $('#currentLocationBasedUpdatesDistanceRangeSlider').attr('value', range);
  };
  
  api.setCurrentLocationBasedUpdatesDistanceRangeLabel = function (range) { $('#currentLocationBasedUpdatesDistanceRangeLabel').text(range + "m"); };

  api.prepareLocationBasedUpdatesDistanceRangeSlider = function (currentValue, sliderMin, sliderMax, callback) {
    $('#currentLocationBasedUpdatesDistanceRangeSlider').change(function () { callback($('#currentLocationBasedUpdatesDistanceRangeSlider').attr('value')); });
    $('#currentLocationBasedUpdatesDistanceRangeSlider').attr('max', sliderMax).attr('min', sliderMin);
    pvt.setCurrentLocationBasedUpdatesDistanceRange(currentValue);
  };
  
  api.bindToSortByPublicationButton = function (callback) {
    $('#sortByPublication').click(function () { callback($('#sortByPublication').attr('value')); });
  };

  api.selectSortOrder = function (sortOrder) { $('input:radio[value=' + sortOrder + ']').attr('checked', true); };

  api.bindToFetchLocationBasedTweetsButton = function (callback) {
    $('#fetchLocationBasedTweets').click(function () { callback($('#fetchLocationBasedTweets').attr('checked')); });
  };

  api.bindToFetchLocationBasedInstagramPicsButton = function (callback) {
    $('#fetchLocationBasedInstagramPics').click(function () { callback($('#fetchLocationBasedInstagramPics').attr('checked')); });
  };

  api.bindToFetchLocationBasedFlickrPicsButton = function (callback) {
    $('#fetchLocationBasedFlickrPics').click(function () { callback($('#fetchLocationBasedFlickrPics').attr('checked')); });
  };

  api.setShouldFetchLocationBasedTweets = function (value) {
    $('#fetchLocationBasedTweets').attr('checked', value);
  }

  api.setShouldFetchLocationBasedInstagramPics = function (value) {
    $('#fetchLocationBasedInstagramPics').attr('checked', value);
  }

  api.setShouldFetchLocationBasedFlickrPics = function (value) {
    $('#fetchLocationBasedFlickrPics').attr('checked', value);
  }

  api.showLoading = function () { $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#wallContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); }; 

  api.hideLoading = function () { $('#loading').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#loading').remove(); }}); };

  api.coverHtml = function (venueName) { return $('<div>', {id: 'venue_cover'}).text(venueName); };

  api.mapContainerHtml = function () { return $('<div>', {id:'venue_map'}); };

  api.mapCanvasHtml = function () { return $('<div>', {id:'map_canvas'}).css('width', $(document).width() + 'px').css('height', $(document).height() + 'px'); };

  api.mapCanvasDocumentElement = function () { return document.getElementById('map_canvas'); };

  api.tweetHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text($.timeago(post.createdAt)));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    container.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
    return container;
  };

  api.instagramMediaHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text($.timeago(post.createdAt)));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    var media = $('<div>', {'class': 'instagram_media'}).append($('<img>', {src: post.media}));
    var caption = $('<div>', {'class': 'instagram_caption'}).text(post.caption);
    container.append($('<div>').append(media).append(caption));
    return container;
  };

  api.flickrPicHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text($.timeago(post.createdAt)));
    userData.append($('<span>', {'class': 'username'}).text(post.username));
    container.append(userData);
    var media = $('<div>', {'class': 'instagram_media'}).append($('<img>', {src: post.media}));
    var caption = $('<div>', {'class': 'instagram_caption'}).text(post.caption);
    container.append($('<div>').append(media).append(caption));
    return container;
  };

  api.facebookUpdateHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<img>', {src: post.avatar, 'class': 'avatar'}));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text($.timeago(post.createdAt)));
    userData.append($('<span>', {'class': 'username'}).text(post.username));
    container.append(userData);
    container.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
    return container;
  };

  return api;
}();
