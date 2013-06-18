var wallPage = function () {
  var api = {};
  var pvt = {};

  api.noUpdatesSlide = function () { return $('<div id="noUpdates">OMG! Nothing to show. Try changing your filters.</div>'); };

  api.createWallContainerHtml = function () { $('#wallContainer').css('display', 'inline-block').css('width', '100%').css('height', '100%').css('position', 'relative'); };

  api.showLoading = function () { $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#wallContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); }; 

  api.hideLoading = function () { $('#loading').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#loading').remove(); }}); };

  api.coverHtml = function (venueName) { return $('<div>', {id: 'cover_title'}).text(venueName); };

  api.tagCoverHtml = function (tag) { return $('<div>', {id: 'cover_title'}).text(tag); };

  api.mapContainerHtml = function () { return $('<div>', {id:'venue_map'}); };

  api.mapCanvasHtml = function () { return $('<div>', {id:'map_canvas'}).css('width', $(document).width() + 'px').css('height', $(document).height() + 'px'); };

  api.mapCanvasDocumentElement = function () { return document.getElementById('map_canvas'); };

  api.tweetHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    if (post.mediaUrl) {
      container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar_small, 'class': 'avatar'})));
    } else {
      container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    }
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text(timeAndLocationText(post)));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    if (post.mediaUrl) {
      container.append($('<div>', {'class': 'twitter_media'}).append($('<img>', {src: post.mediaUrl})));
    }
    container.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
    return container;
  };

  api.instagramMediaHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text(timeAndLocationText(post)));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    var media = $('<div>', {'class': 'instagram_media'}).append($('<img>', {src: post.media}));
    var caption = $('<div>', {'class': 'instagram_caption'}).text(post.caption);
    container.append($('<div>').append(media).append(caption));
    return container;
  };

  function timeAndLocationText(publication) {
    var time = $.timeago(publication.createdAt);
    if (publication.locationName != null) {
      return time + ' at ' + publication.locationName;
    } else {
      return time;
    }
  }

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
