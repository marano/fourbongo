var wallPage = function () {
  var api = {};
  var pvt = {};

  api.noUpdatesSlide = function () { return $('<div id="noUpdates">OMG! Nothing to show. Try changing your filters.</div>'); };

  api.createWallContainerHtml = function () { $('#slideshowContainer').css('display', 'inline-block').css('width', '100%').css('height', '100%').css('position', 'relative'); };

  api.showLoading = function () { $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#slideshowContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); };

  api.hideLoading = function () { $('#loading').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#loading').remove(); }}); };

  api.coverHtml = function (title) { return $('<div>', {id: 'cover_title'}).text(title); };

  api.mapContainerHtml = function () { return $('<div>', {id:'venue_map'}); };

  api.mapCanvasHtml = function () { return $('<div>', {id:'map_canvas'}).css('width', $(document).width() + 'px').css('height', $(document).height() + 'px'); };

  api.mapCanvasDocumentElement = function () { return document.getElementById('map_canvas'); };

  api.tweetHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container twitter'});
    if (post.mediaUrl) {
      container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar_small, 'class': 'avatar'})));
    } else {
      container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    }
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append(timeAndLocationElement(post, 'icon-twitter-sign'));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    var content = $('<div>', {'class': 'content'}).appendTo(container);
    if (post.mediaUrl) {
      content.append($('<div>', {'class': 'twitter_media'}).append($('<img>', {src: post.mediaUrl})));
    }
    content.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
    return container;
  };

  api.instagramMediaHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container instagram'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append(timeAndLocationElement(post, 'icon-instagram'));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    var media = $('<div>', {'class': 'instagram_media'}).append($('<img>', {src: post.media}));
    var caption = $('<div>', {'class': 'instagram_caption'}).text(post.caption);
    var content = $('<div>', {'class': 'content'});
    content.append(media).append(caption).appendTo(container);
    return container;
  };

  function timeAndLocationElement(publication, icon) {
    var element = $('<div>', { class: 'publication_time' });
    var icon = $('<i>', { class: icon });
    var time = $.timeago(publication.createdAt);
    element.text(time);
    element.prepend(icon);
    if (publication.locationName != null) {
      element.text(time + ' at ' + publication.locationName);
      element.prepend(icon);
    } else if (publication.latitude != null && publication.longitude != null) {
      geolocation.displayName(publication.latitude, publication.longitude, function (name) {
        element.text(time + ' at ' + name);
        element.prepend(icon);
      });
    }
    return element;
  }

  api.flickrPicHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container flickr'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append(timeAndLocationElement(post, 'icon-flickr'));
    userData.append($('<span>', {'class': 'username'}).text(post.username));
    container.append(userData);
    var media = $('<div>', {'class': 'instagram_media'}).append($('<img>', {src: post.media}));
    var caption = $('<div>', {'class': 'instagram_caption'}).text(post.caption);
    var content = $('<div>', {'class': 'content'}).appendTo(container);
    content.append(media).append(caption);
    return container;
  };

  api.facebookUpdateHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container facebook'});
    container.append($('<div class="avatar_container">').append($('<img>', {src: post.avatar, 'class': 'avatar'})));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append(timeAndLocationElement(post, 'icon-facebook-sign'));
    userData.append($('<span>', {'class': 'username'}).text(post.username));
    container.append(userData);
    var content = $('<div>', {'class': 'content'}).appendTo(container);
    content.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
    return container;
  };

  return api;
}();
