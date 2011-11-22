var foursquare = function () {
  var pvt = { token: null };
  var api = {};

  api.initialize = function () {
    var isFoursquareCallback = $('meta[name=from_foursquare_authentication_callback]').attr('content') == 'true';

    if (isFoursquareCallback) {
      var token = window.location.hash.replace('#access_token=', '');
      window.history.pushState(0, '', '/');
      $.cookie('foursquare_token', token, {path: '/', expires: 365});
      pvt.token = token;
    } else {
      var token = $.cookie('foursquare_token');
      pvt.token = token;
    }
  };

  api.isAuthenticated = function () { return pvt.token != null };

  api.search_venues_by_name_and_city = function (name, city, callback) {
    $.getJSON('/venues/search_by_name_and_city/' + encodeURIComponent(name) + '/' + encodeURIComponent(city), callback);
  };
  
  api.search_venues_by_location = function (latitude, longitude, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/search?v=20111117&ll=' + latitude + ',' + longitude + '&radius=1000&intent=browse&limit=50&oauth_token=' + pvt.token, function (data) {
      var vanues = $(data.response.venues).map(function (index, venue) { return {foursquare_id: venue.id, name: venue.name}; });
      callback(venues);
    });
  };

  api.venue = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '?oauth_token=' + pvt.token + '&v=20111118', function (data) {
      var name = data.response.venue.name;
      var latitude = data.response.venue.location.lat;
      var longitude = data.response.venue.location.lng;
      callback({id: venueId, name: name, latitude: latitude, longitude: longitude});
    });
  };

  api.herenow = function (venueId, callback) {
    $.getJSON('https://api.foursquare.com/v2/venues/' + venueId + '/herenow?oauth_token=' + pvt.token + '&v=20111118', function (data) {
      var userIds = _(data.response.hereNow.items).map(function (checkin) { return checkin.user.id; });
      callback(userIds);
    });
  };

  api.profile = function (userId, callback) {
    $.getJSON('https://api.foursquare.com/v2/users/' + userId + '?oauth_token=' + pvt.token + '&v=20111118', function (data) { callback({twitter: data.response.user.contact.twitter, facebook: data.response.user.contact.facebook}); });
  };

  api.login = function () {
    window.location = 'https://foursquare.com/oauth2/authenticate?client_id=GBFO0NELBGW0SEP2BGDY1KID00VO45TGNTJQ4OZHVJKIFP5Z&response_type=token&redirect_uri=' + encodeURI('http://fourbongo.com/foursquare/authentication_callback');
  };

  return api;
}();

var twitter = function () {
  var api = {};

  api.timeline = function (userId, callback) {
    $.getJSON('https://api.twitter.com/1/statuses/user_timeline.json?include_entities=true&include_rts=true&screen_name=' + userId + '&count=200&callback=?', function (data) {
        var tweets = _(data).map(function (tweet) {
          return Tweet({id: tweet.id_str, username: tweet.user.screen_name, fullname: tweet.user.name, content: tweet.text, avatar: tweet.user.profile_image_url});
        });
        callback(tweets);
    });
  };

  api.byLocation = function (latitude, longitude, callback) {
    $.getJSON('http://search.twitter.com/search.json?geocode=' + latitude + ',' + longitude + ',1.0km&rpp=100&callback=?', function (data) {
      var tweets = _(data.results).map(function (tweet) { return Tweet({id: tweet.id_str, username: tweet.from_user, fullname: tweet.from_user_name, content: tweet.text, avatar: tweet.profile_image_url}); });
      callback(tweets);
    });
  };

  return api;
}();

var page = function () {
  var api = {};

  api.createWallContainerHtml = function () { $('#wallContainer').css('display', 'inline-block').css('width', '100%').css('height', '100%').css('position', 'relative'); };

  api.bindToWallHover = function (callback) { $('#wallContainer').mouseover(callback); };

  api.bindToSettingsHover = function (callback) { $('#settings').mouseover(callback); };
  
  api.showSettings = function () { $('<div>', {id:'settings'}).css('opacity', '.0').html("<img id='settingsIcon' src='/settings.png' />").appendTo($('#wallContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); };

  api.hideSettings = function () { $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#settings').remove(); }}); };

  api.showSettingsOptions = function () {
    $('#settingsIcon').animate({'opacity' : '.0'}, {easing: 'easeoutquint', duration: 1000, complete: function () { $('#settingsIcon').remove(); }});
    $.get('/settings', function (html) { $('#settings').append(html); });
  };

  api.showLoading = function () { $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#wallContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); }; 

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

  api.facebookUpdateHtml = function (update) {
    var container = $('<div>', {class: 'publication_container'});
    container.append($('<img>', {src: update.avatar, class: 'avatar'}));
    var userData = $('<div>', {class: 'user_data_container'});
    userData.append($('<span>', {class: 'username'}).text(update.username));
    container.append(userData);
    container.append($('<div>', {class: 'publication_content_container'}).text(update.content));
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

  api.html = function (post) { return page.tweetHtml(post); };

  return api;
};

var FacebookUpdate = function (updateData) {
  var api = {
    id: updateData.id,
    username: updateData.username,
    content: updateData.content,
    avatar: 'https://graph.facebook.com/' + updateData.userId + '/picture?type=large'
  };

  api.isSame = function (otherPost) { return api.id == otherPost.id; };

  api.html = function (post) { return page.facebookUpdateHtml(post); };

  return api;
};

var PostsListItem = function (item) {
  var api = {
    post: item,
    viewed: false
  };
  return api;
};

var postsList = function () {
  var api = {};
  var pvt = {
    posts: [],
    queue: [],
    currentIndex: 0
  };

  api.addAll = function (posts) {
    _(posts).each(pvt.add);
  };

  pvt.add = function (post) {
    if (!pvt.contains(post)) {
      var item = PostsListItem(post);
      pvt.posts.push(item);
      var remainingItems = pvt.queue.slice(pvt.currentIndex);
      remainingItems.splice(Math.floor(Math.random() * remainingItems.length), 0, item);
      pvt.queue = _.union(pvt.queue.slice(0, pvt.currentIndex), remainingItems);
    }
  };

  pvt.resetQueue = function () {
    pvt.currentIndex = 0;
    pvt.queue = _(pvt.posts).sortBy(function  () { return Math.random(); });
  };

  pvt.contains = function (post) { return _(pvt.posts).any(function (eachPost) { return eachPost.post.isSame(post); }); };

  api.isNotEmpty = function () { return pvt.posts.length > 0; };

  api.next = function () {
    if (_(pvt.queue).isEmpty()) { pvt.resetQueue(); }
    if (pvt.currentIndex == pvt.queue.length) { pvt.currentIndex = 0; }
    var next = pvt.queue[pvt.currentIndex++].post;
    next.viewed = true;
    return next;
  };

  return api;
}();

var slidesCoordinator = function () {
  var api = {};
  var pvt = { needsToHideLoading: true };
  
  api.start = function (slider) { setInterval(function () { pvt.next(slider); }, 10000); };

  pvt.next = function (slider) {
    if (postsList.isNotEmpty()) {
      if (pvt.needsToHideLoading) {
        page.hideLoading();
        pvt.needsToHideLoading = false;
      }
      var post = postsList.next();
      slider.slide(post.html(post));
    }
  };

  return api;
}();

var settings = function () {
  var api = {};
  var pvt = {
    lastHover: 0,
    isIconDisplayed: false,
    areOptionsDisplayed: false
  };

  api.initialize = function () { page.bindToWallHover(pvt.wallHover); }

  pvt.wallHover = function () {
    if (pvt.isIconDisplayed) { return; }
    pvt.isIconDisplayed = true;
    pvt.showSettings();
  };

  pvt.optionsHover = function () {
    page.showSettingsOptions();
    pvt.moreTime();
  };

  pvt.showSettings = function () {
    page.showSettings();
    page.bindToSettingsHover(pvt.optionsHover);
    pvt.moreTime();
  };

  pvt.moreTime = function () {
    pvt.lastHover = new Date().getTime();
    setTimeout(function () {
      if ((new Date().getTime() - pvt.lastHover) >= 5000) {
        page.hideSettings();
        pvt.isIconDisplayed = false;
      }
    }, 5000);
  };

  return api;
}();

var wall = function () {
  var api = {};
  var pvt = {};

  api.initialize = function (venueId) {
    page.createWallContainerHtml();
    settings.initialize();
    foursquare.venue(venueId, pvt.startShow);
  };

  pvt.startShow = function (venue) {
    var slider = slideShow($('#wallContainer'));
    introduction.showCover(venue.name, slider);
    setTimeout(page.showLoading, 1000);
    setTimeout(function () { introduction.showMap(venue.latitude, venue.longitude, slider); }, 2000);

    pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude);
    pvt.fetchCheckins(venue.id);

    setInterval(function () { pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude); }, 300000);
    setInterval(function () { pvt.fetchCheckins(venue.id); }, 300000);

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
