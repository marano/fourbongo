var page = function () {
  var api = {};

  api.createWallContainerHtml = function () { $('#wallContainer').css('display', 'inline-block').css('width', '100%').css('height', '100%').css('position', 'relative'); };

  api.bindToWallHover = function (callback) { $('#wallContainer').mouseover(callback); };

  api.bindToSettingsHover = function (callback) { $('#settings').mouseover(callback); };
  
  api.showSettingsIcon = function () { $('<div>', {id:'settings'}).css('opacity', '.0').html("<img id='settingsIcon' src='/settings.png' />").appendTo($('#wallContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); };

  api.hideSettings = function () { $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#settings').remove(); }}); };

  api.showSettingsOptions = function (callback) {
    var opacity = $('#settings').css('opacity');
    $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () {
      $('#settingsIcon').remove();
      $.get('/settings', function (html) {
        $('#settings').append(html);
        callback();
        $('#settings').animate({'opacity' : opacity}, {easing: 'easeOutQuint', duration: 1000});
      });
    }});
  };

  api.selectSortByRandom = function () { $('#sortByRandom').attr('checked', true); };

  api.bindToSortByRandomButton = function (callback) { $('#sortByRandom').click(callback); };
  
  api.selectSortByPublication = function () { $('#sortByPublication').attr('checked', true); };

  api.bindToSortByPublicationButton = function (callback) { $('#sortByPublication').click(callback); };

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
