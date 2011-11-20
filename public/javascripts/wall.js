var foursquare = function () {
  var api = {};
  
  api.venue = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '?oauth_token=YN1YTMIQU0S1KLYILLFQNQQIX5WTBZBRWW1Z2YBTLSBMJAR5&v=20111118', function (data) {
      var name = data.response.venue.name;
      var latitude = data.response.venue.location.lat;
      var longitude = data.response.venue.location.lng;
      callback({id: venueId, name: name, latitude: latitude, longitude: longitude});
    });
  };

  api.herenow = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '/herenow?oauth_token=YN1YTMIQU0S1KLYILLFQNQQIX5WTBZBRWW1Z2YBTLSBMJAR5&v=20111118', function (data) {
      var userIds = [];
      _(data.response.hereNow.items).each(function (checkin) { userIds.push(checkin.user.id); });
      callback(userIds);
    });
  };

  api.profile = function (userId, callback) {
    $.getJSON('https://api.foursquare.com/v2/users/' + userId + '?oauth_token=YN1YTMIQU0S1KLYILLFQNQQIX5WTBZBRWW1Z2YBTLSBMJAR5&v=20111118', function (data) { callback({twitter: data.response.user.contact.twitter, facebook: data.response.user.contact.facebook}); });
  };

  return api;
}();

var twitter = function () {
  var api = {};

  api.timeline = function (userId, callback) {
  };

  api.byLocation = function (latitude, longitude, callback) {
    $.getJSON('http://search.twitter.com/search.json?geocode=' + latitude + ',' + longitude + ',1.0km&rpp=100&callback=?', function (data) {
      tweets = [];
      _(data.results).each(function (tweet) { tweets.push(Tweet({id: tweet.id_str, username: tweet.from_user, fullname: tweet.from_user_name, content: tweet.text, avatar: tweet.profile_image_url})); });
      callback(tweets);
    });
  };

  return api;
}();

var facebook = function () {
  var api = {};
  
  api.updates = function (userId) {
    $.getJSON('https://graph.facebook.com/' + userId + '/feed?access_token=AAAAAAITEghMBAFLctX7QkV35KQo8aOzOAaYDr3NDmf9Apj1WqJIfnc2R8m4aCLJ21VWa7GrcGN19kZCImBHbJvy5aEwpSCXVJwmGHkJ6LsCqFBIOd', function (data) {
    });
  };

  return api;
}();

var page = function () {
  var api = {};

  api.showLoading = function () { $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#container')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); };

  api.hideLoading = function () { $('#loading').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#loading').remove(); }}); };

  api.coverHtml = function (venueName) { return $('<div>', {id: 'venue_cover'}).text(venueName); };

  api.mapContainerHtml = function () { return $('<div>', {id:'venue_map'}); };

  api.mapCanvasHtml = function () { return $('<div>', {id:'map_canvas'}).css('width', $(document).width() + 'px').css('height', $(document).height() + 'px'); };

  api.mapCanvasDocumentElement = function () { return document.getElementById('map_canvas'); };

  api.tweetHtml = function (tweet) {
    var container = $('<div>', {class: 'publication_container'});
    container.append($('<img>', {src: tweet.avatar, class: 'avatar'}));
    var userData = $('<div>', {class: 'user_data_container'});
    userData.append($('<span>', {class: 'username'}).text(tweet.fullname));
    userData.append($('<span>', {class: 'screen_name'}).text('(' + tweet.username + ')'));
    container.append(userData);
    container.append($('<div>', {class: 'publication_content_container'}).text(tweet.content));
    return container;
  };

  return api;
}();

var map = function () {
  var api = {};
  
  api.show = function (latitude, longitude, slider) {
    var mapContainer = page.mapContainerHtml();
    var mapCanvas = page.mapCanvasHtml();
    mapCanvas.appendTo(mapContainer);
    
    slider.slide(mapContainer, function () {
      var myOptions = {
        zoom: 21,
        mapTypeId: google.maps.MapTypeId.SATELLITE,
        center: new google.maps.LatLng(latitude, longitude),
        mapTypeControl: false,
        overviewMapControl: false,
        panControl: false,
        zoomControl: false,
        streetViewControl: false
      };

      var map = new google.maps.Map(page.mapCanvasDocumentElement(), myOptions);
    });
  };

  return api;
}();

var introduction = function () {
  var api = {};

  api.showCover = function (venueName, slider) { slider.slide(page.coverHtml(venueName)); };

  api.showMap = function (latitude, longitude, slider) { map.show(latitude, longitude, slider); };

  return api;
}();

var Tweet = function (tweetData) {
  var api = {
    id: tweetData.id,
    username: tweetData.username,
    fullname: tweetData.fullname,
    content: tweetData.content,
    avatar: tweetData.avatar.replace('_normal', '')
  };

  api.isSame = function (otherPost) { return api.id == otherPost.id; };

  api.html = function (tweet) { return page.tweetHtml(tweet); };

  return api;
};

var FacebookUpdate = function (updateData) {
  var api = {};
  return api;
};

var postsList = function () {
  var api = {};
  var pvt = { posts: [] };

  api.addAll = function (posts) { _(posts).each(function (post) { if (!pvt.contains(post)) { pvt.posts.push(post); } }); };

  pvt.contains = function (post) { return _.any(pvt.posts, function (eachPost) { return eachPost.isSame(post); }); };

  api.random = function () { return pvt.posts[Math.floor(Math.random() * pvt.posts.length)]; };

  api.isNotEmpty = function () { return pvt.posts.length > 0; };

  return api;
}();

var slidesCoordinator = function () {
  var api = {};
  var pvt = { needsToHideLoading: true };
  
  api.start = function (slider) { setInterval(function () { pvt.next(slider); }, 8000); };

  pvt.next = function (slider) {
    if (postsList.isNotEmpty()) {
      if (pvt.needsToHideLoading) {
        page.hideLoading();
        pvt.needsToHideLoading = false;
      }
      var post = postsList.random();
      slider.slide(post.html(post));
    }
  };

  return api;
}();

var wall = function () {
  var api = {};
  var pvt = {};

  api.initialize = function (venueId) { foursquare.venue(venueId, pvt.startShow); };

  pvt.startShow = function (venue) {
    var slider = slideShow($('#container'));
    introduction.showCover(venue.name, slider);
    setTimeout(page.showLoading, 1000);
    setTimeout(function () { introduction.showMap(venue.latitude, venue.longitude, slider); }, 2000);

    pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude);
    pvt.fetchCheckins(venue.id);

    setInterval(function () { pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude); }, 30000);
    setInterval(function () { pvt.fetchCheckins(venue.id); }, 30000);

    setTimeout(function () { slidesCoordinator.start(slider); }, 5000);
  };

  pvt.fetchLocationBasedTweets = function (latitude, longitude) { twitter.byLocation(latitude, longitude, postsList.addAll); };

  pvt.fetchCheckins = function (venueId) { foursquare.herenow(venueId, pvt.fetchProfiles); };

  pvt.fetchProfiles = function (profilesIds) { _(profilesIds).each(function (profileId) { foursquare.profile(profileId, pvt.fetchPosts); }); };

  pvt.fetchPosts = function (profile) {
    if (profile.twitter != undefined) { twitter.timeline(profile.twitter, postsList.addAll); };
    if (profile.facebook != undefined) { facebook.updates(profile.facebook, postsList.addAll); };
  };

  return api;
}();

$(function () {
  var venueId = $('meta[name=venueId]').attr("content");
  wall.initialize(venueId);
});
