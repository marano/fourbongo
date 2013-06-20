var instagram = function () {
  var api = {
    network: null
  };

  api.mediaByTag = function (tag, callback) {
    var currentPage = 1;
    var maxTagId = null;
    mediaByTagPaginated(tag, currentPage, maxTagId, callback);
  };
  
  api.mediaByLocation = function (latitude, longitude, callback) {
    $.getJSON('https://api.instagram.com/v1/media/search?lat=' + latitude + '&lng=' + longitude + '&distance=5000&' + api.network.accessTokenParameter() + '&callback=?', function (data) {
      var isUpdateByLocation = true;
      callback(mediasFromData(data.data, isUpdateByLocation));
    });
  };

  function mediaByTagPaginated(tag, currentPage, maxTagId, callback) {
    var amountOfPagesToFetch = 2;
    if (currentPage > amountOfPagesToFetch) {
      return;
    }
    $.jsonp({
      url: urlForTag(tag, maxTagId),
      dataType: 'jsonp',
      success: function (data) {
        var isUpdateByLocation = false;
        callback(mediasFromData(data.data, isUpdateByLocation));
        if (!data.pagination) {
          return;
        }
        var nextMaxTagId = data.pagination.next_max_tag_id;
        if (!nextMaxTagId) {
          return;
        }
        mediaByTagPaginated(tag, currentPage + 1, nextMaxTagId, callback);
      },
      error: function () {
        api.network.showError();
      }
    });
  }

  function urlForTag(tag, maxTagId) {
    var maxTagIdParameter = maxTagId ? '&max_tag_id=' + maxTagId : '';
    return 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?&' + api.network.accessTokenParameter() + maxTagIdParameter + '&count=60&callback=?';
  }

  function mediasFromData(data, isUpdateByLocation) {
    var medias = _(data).map(function (media) {
      var caption;
      if (media.caption != null) {
        caption = media.caption.text;
      }
      var latitude;
      var longitude;
      var locationName;
      if (media.location != null) {
        locationName = media.location.name;
        latitude = media.location.latitude;
        longitude = media.location.longitude;
      }
      return InstagramMedia({id: media.id, username: media.user.username, fullname: media.user.full_name, avatar: media.user.profile_picture, isUpdateByLocation: isUpdateByLocation, locationName: locationName, latitude: latitude, longitude: longitude, media: media.images.standard_resolution.url, caption: caption, createdAt: new Date(parseInt(media.created_time) * 1000)});
    });
    return medias;
  }

  return api;
}();
