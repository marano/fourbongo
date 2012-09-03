var instagram = function () {
  var api = {};

  var clientId = 'ef0cec7f983646e4a6809a3d0dbd35bf';

  api.mediaByTag = function (tag, callback) {
    $.getJSON('https://api.instagram.com/v1/tags/' + tag + '/media/recent?&client_id=' + clientId + '&count=60&callback=?', function (data) {
      var isUpdateByLocation = false;
      callback(mediasFromData(data.data, isUpdateByLocation));
      var currentPage = 1;
      var maxTagId = data.pagination.next_max_tag_id;
      mediaByTagPaginated(tag, currentPage, maxTagId, callback);
    });
  };
  
  api.mediaByLocation = function (latitude, longitude, callback) {
    $.getJSON('https://api.instagram.com/v1/media/search?lat=' + latitude + '&lng=' + longitude + '&distance=5000&client_id=' + clientId + '&callback=?', function (data) {
      var isUpdateByLocation = true;
      callback(mediasFromData(data.data, isUpdateByLocation));
    });
  };

  function mediaByTagPaginated(tag, currentPage, maxTagId, callback) {
    var amountOfPagesToFetch = 5;
    if (!maxTagId) {
      return;
    }
    if (currentPage > amountOfPagesToFetch) {
      return;
    }
    $.getJSON('https://api.instagram.com/v1/tags/' + tag + '/media/recent?&client_id=' + clientId + '&max_tag_id=' + maxTagId + '&count=60&callback=?', function (data) {
      var isUpdateByLocation = false;
      callback(mediasFromData(data.data, isUpdateByLocation));
      var nextMaxTagId = data.pagination.next_max_tag_id;
      mediaByTagPaginated(tag, currentPage + 1, nextMaxTagId, callback);
    });
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
