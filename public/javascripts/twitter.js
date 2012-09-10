var twitter = function () {
  var api = {};
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
    $.getJSON('http://search.twitter.com/search.json?geocode=' + latitude + ',' + longitude + ',10km&rpp=100&include_entities=true&callback=?', function (data) {
      var tweetsWithLocation = _(data.results).filter(function (tweet) { return pvt.locationInfo(tweet) != null; });
      var tweets = _(tweetsWithLocation).map(function (tweet) {
        var mediaUrl = null;
        if (tweet.entities.media != null) {
          mediaUrl = tweet.entities.media[0].media_url;
        }
        var locationInfo = pvt.locationInfo(tweet);
        return Tweet({id: tweet.id_str, username: tweet.from_user, fullname: tweet.from_user_name, content: cheatedUnescape(tweet.text), avatar: tweet.profile_image_url, createdAt: new Date(tweet.created_at), isUpdateByLocation: true, latitude: locationInfo.latitude, longitude: locationInfo.longitude, mediaUrl: mediaUrl});
      });
      callback(tweets);
    });
  };

  api.byTag = function (tag, callback) {
    $.getJSON('http://search.twitter.com/search.json?q=%23' + tag + '&rpp=100&include_entities=true&callback=?', function (data) {
      var tweets = _(data.results).map(function (tweet) {
        var mediaUrl = null;
        if (tweet.entities.media != null) {
          mediaUrl = tweet.entities.media[0].media_url;
        }
        return Tweet({id: tweet.id_str, username: tweet.from_user, fullname: tweet.from_user_name, content: cheatedUnescape(tweet.text), avatar: tweet.profile_image_url, createdAt: new Date(tweet.created_at), mediaUrl: mediaUrl});
      });
      callback(tweets);
    });
  };

  pvt.locationInfo = function (tweet) {
    var geoInfo = tweet.geo;
    if (geoInfo == null) {
      return null;
    } else {
      return {latitude: geoInfo.coordinates[0], longitude: geoInfo.coordinates[1]}
    }
  };

  return api;
}();
