var instagram = function () {
  var api = {};
  var pvt = {
    clientId: 'ef0cec7f983646e4a6809a3d0dbd35bf'
  }
  
  api.mediaByLocation = function (latitude, longitude, callback) {
    $.getJSON('https://api.instagram.com/v1/media/search?lat=' + latitude + '&lng=' + longitude + '&distance=5000&client_id=' + pvt.clientId + '&callback=?', function (data) {
      var medias = _(data.data).map(function (media) {
        var caption;
        if (media.caption != null) {
          caption = media.caption.text;
        }
        return InstagramMedia({id: media.id, username: media.user.username, fullname: media.user.full_name, avatar: media.user.profile_picture, isUpdateByLocation: true, latitude: media.location.latitude, longitude: media.location.longitude, media: media.images.standard_resolution.url, caption: caption, createdAt: new Date(parseInt(media.created_time) * 1000)});
      });
      callback(medias);
    });
  };

  return api;
}();
