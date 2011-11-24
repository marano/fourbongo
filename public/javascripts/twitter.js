var twitter = function () {
  var api = {};

  api.timeline = function (userId, callback) {
    $.getJSON('https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=' + userId + '&count=200&callback=?', function (data) {
        var tweets = _(data).map(function (tweet) {
          return Tweet({id: tweet.id_str, username: tweet.user.screen_name, fullname: tweet.user.name, content: cheatedUnescape(tweet.text), avatar: tweet.user.profile_image_url, createdAt: new Date(tweet.created_at)});
        });
        callback(tweets);
    });
  };

  api.byLocation = function (latitude, longitude, callback) {
    $.getJSON('http://search.twitter.com/search.json?geocode=' + latitude + ',' + longitude + ',0.2km&rpp=100&callback=?', function (data) {
      var tweets = _(data.results).map(function (tweet) {
        return Tweet({id: tweet.id_str, username: tweet.from_user, fullname: tweet.from_user_name, content: cheatedUnescape(tweet.text), avatar: tweet.profile_image_url, createdAt: new Date(tweet.created_at)});
      });
      callback(tweets);
    });
  };

  return api;
}();
