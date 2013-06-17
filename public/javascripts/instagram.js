var instagram = function () {
  var api = {};

  var clientIds = ['ef0cec7f983646e4a6809a3d0dbd35bf', '86a8f41a1066466c8780fa68be17e71b'];

  function clientId() {
    return clientIds[Math.floor(Math.random() * clientIds.length)];;
  }

  api.mediaByTag = function (tag, callback) {
    var currentPage = 1;
    var maxTagId = null;
    mediaByTagPaginated(tag, currentPage, maxTagId, callback);
  };
  
  api.mediaByLocation = function (latitude, longitude, callback) {
    $.getJSON('https://api.instagram.com/v1/media/search?lat=' + latitude + '&lng=' + longitude + '&distance=5000&client_id=' + clientId() + '&callback=?', function (data) {
      var isUpdateByLocation = true;
      callback(mediasFromData(data.data, isUpdateByLocation));
    });
  };

  function mediaByTagPaginated(tag, currentPage, maxTagId, callback) {
    var amountOfPagesToFetch = 5;
    if (currentPage > amountOfPagesToFetch) {
      return;
    }
    $.getJSON(urlForTag(tag, maxTagId), function (data) {
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
    });
  }

  function urlForTag(tag, maxTagId) {
    var maxTagIdParameter = maxTagId ? '&max_tag_id=' + maxTagId : '';
    return 'https://api.instagram.com/v1/tags/' + tag + '/media/recent?&client_id=' + clientId() + maxTagIdParameter + '&count=60&callback=?';
  }

  function mediasFromData(data, isUpdateByLocation) {
    var medias = _(data).map(function (media) {
      var caption;
      if (media.caption != null) {
        caption = media.caption.text;
      }
      var latitude;
      var longitude;
      if (media.location != null) {
        latitude = media.location.latitude;
        longitude = media.location.longitude;
      }
      return InstagramMedia({id: media.id, username: media.user.username, fullname: media.user.full_name, avatar: media.user.profile_picture, isUpdateByLocation: isUpdateByLocation, latitude: latitude, longitude: longitude, media: media.images.standard_resolution.url, caption: caption, createdAt: new Date(parseInt(media.created_time) * 1000)});
    });
    return medias;
  }

  return api;
}();
