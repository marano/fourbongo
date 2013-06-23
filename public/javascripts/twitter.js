var twitter = function () {
  var api = {
    network: null
  };

  var pvt = {};

  api.timeline = function (userId, callback) {
    $.getJSON('https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=' + userId + '&count=200&callback=?', function (data) {
      var tweets = _(data).map(function (tweet) {
        return Tweet({id: tweet.id_str, username: tweet.user.screen_name, fullname: tweet.user.name, content: cheatedUnescape(tweet.text), avatar: tweet.user.profile_image_url, createdAt: new Date(tweet.created_at)});
      });
      callback(tweets);
    });
  };

  api.byLocation = function (latitude, longitude, callback) {
    searchTwitter('search_by_location', { latitude: latitude, longitude: longitude }, callback);
  };

  api.byTag = function (tags, callback) {
    var query = '%23' + tags.join('+OR+%23');
    searchTwitter('search', { query: query }, callback);
  };

  function searchTwitter(method, query, callback) {
    $.ajax({
      url: '/twitter/' + method,
      data: query,
      success: function (data) {
        var tweets = _($.parseJSON(data)).map(function (tweet) {
          var mediaUrl = media(tweet);
          var locationInfo = pvt.locationInfo(tweet);
          return Tweet({id: tweet.id_str, username: tweet.user.screen_name, fullname: tweet.user.name, content: cheatedUnescape(tweet.text), avatar: tweet.user.profile_image_url, createdAt: new Date(tweet.created_at), locationName: locationInfo.locationName, latitude: locationInfo.latitude, longitude: locationInfo.longitude, mediaUrl: mediaUrl});
        });
        callback(tweets);
      },
      error: function () {
        api.network.showError();
      }
    });
  }

  function media(tweet) {
    var mediaUrl = null;
    if (tweet.entities.media != null) {
      mediaUrl = tweet.entities.media[0].media_url;
    } else if (tweet.entities.urls.length > 0 && tweet.entities.urls[0].expanded_url.indexOf('http://twitpic.com/') != -1) {
      mediaUrl = 'http://twitpic.com/show/full/' + tweet.entities.urls[0].expanded_url.replace('http://twitpic.com/', '');
    }
    return mediaUrl;
  }

  pvt.locationInfo = function (tweet) {
    var info = {};
    if (tweet.geo != null) {
      info.latitude = tweet.geo.coordinates[0];
      info.longitude = tweet.geo.coordinates[1];
    }
    if (tweet.place != null) {
      info.locationName = tweet.place.full_name + ', ' + tweet.place.country;
    }
    return info;
  };

  return api;
}();
