var page = function () {
  var api = {};
  var pvt = { settingsOptions: null };

  api.emptySlide = function () { return $('<div>'); };

  api.createWallContainerHtml = function () { $('#wallContainer').css('display', 'inline-block').css('width', '100%').css('height', '100%').css('position', 'relative'); };

  api.bindToWallHover = function (callback) { $('#wallContainer').mousemove(callback); };

  api.bindToSettingsIconHover = function (callback) { $('#settings').mousemove(callback); };
  
  api.showSettingsIcon = function (callback) {
    var settingsDiv = $('<div>', {id:'settings'}).css('opacity', '.0').html("<img id='settingsIcon' src='/settings.png' />").appendTo($('#wallContainer'))
    settingsDiv.animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000, complete: callback});
  };

  api.hideSettings = function () { $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#settings').remove(); }}); };

  api.showSettingsOptions = function (callback) {
    var opacity = $('#settings').css('opacity');
    $('#settings').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () {
      $('#settingsIcon').remove();
      if (pvt.settingsOptions == null) {
        $.get('/settings', function (html) {
          pvt.settingsOptions = html;
          pvt.showLoadedSettingsOptions(opacity, callback);
        });
      } else {
        pvt.showLoadedSettingsOptions(opacity, callback);
      }
    }});
  };

  pvt.showLoadedSettingsOptions = function (opacity, callback) {
    $('#settings').append(pvt.settingsOptions);
    callback();
    $('#settings').animate({'opacity' : opacity}, {easing: 'easeOutQuint', duration: 1000});
  };

  api.selectSortByRandom = function () { $('#sortByRandom').attr('checked', true); };

  api.bindToSortByRandomButton = function (callback) {
    $('#sortByRandom').click(function () { callback($('#sortByRandom').attr('value')); });
  };
  
  api.selectSortByPublication = function () { $('#sortByPublication').attr('checked', true); };

  api.setCurrentTimeRange = function (range) {
    api.setCurrentTimeRangeLabel(range);
    $('#currentTimeRangeSlider').attr('value', range.index);
  };
  
  api.setCurrentTimeRangeLabel = function (range) { $('#currentTimeRangeLabel').text(range.description); };

  api.bindToSortByPublicationButton = function (callback) {
    $('#sortByPublication').click(function () { callback($('#sortByPublication').attr('value')); });
  };

  api.selectSortOrder = function (sortOrder) { $('input:radio[value=' + sortOrder + ']').attr('checked', true); };

  api.bindFetchLocationBasedTweetsButton = function (callback) {
    $('fetchLocationBasedTweets').click(callback);
  };

  api.showLoading = function () { $('<div>', {id:'loading'}).css('opacity', '.0').html('L<img src="/radar.gif" />ading').appendTo($('#wallContainer')).animate({'opacity' : '.6'}, {easing: 'easeOutQuint', duration: 1000}); }; 

  api.hideLoading = function () { $('#loading').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () { $('#loading').remove(); }}); };

  api.coverHtml = function (venueName) { return $('<div>', {id: 'venue_cover'}).text(venueName); };

  api.mapContainerHtml = function () { return $('<div>', {id:'venue_map'}); };

  api.mapCanvasHtml = function () { return $('<div>', {id:'map_canvas'}).css('width', $(document).width() + 'px').css('height', $(document).height() + 'px'); };

  api.mapCanvasDocumentElement = function () { return document.getElementById('map_canvas'); };

  api.tweetHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<img>', {src: post.avatar, 'class': 'avatar'}));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text($.timeago(post.createdAt)));
    userData.append($('<span>', {'class': 'username'}).text(post.fullname));
    userData.append($('<span>', {'class': 'screen_name'}).text('(' + post.username + ')'));
    container.append(userData);
    container.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
    return container;
  };

  api.facebookUpdateHtml = function (post) {
    var container = $('<div>', {'class': 'publication_container'});
    container.append($('<img>', {src: post.avatar, 'class': 'avatar'}));
    var userData = $('<div>', {'class': 'user_data_container'});
    userData.append($('<div>', {'class': 'publication_time'}).text($.timeago(post.createdAt)));
    userData.append($('<span>', {'class': 'username'}).text(post.username));
    container.append(userData);
    container.append($('<div>', {'class': 'publication_content_container'}).text(post.content));
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
    createdAt: tweetData.createdAt,
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
    createdAt: updateData.createdAt,
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

var randomSort = function () {
  var api = {};

  api.name = 'random';

  api.next = function (currentPost, allPosts) {
    return allPosts[Math.floor(Math.random() * allPosts.length)];
  };

  return api;
}();

var publicationSort = function () {
  var api = {};

  api.name = 'publication';

  api.next = function (currentPost, allPosts) {
    var now = new Date().getTime();
    var sortedPosts = _(allPosts).sortBy(function (post) { return now - post.post.createdAt.getTime(); });
    if (currentPost == null) {
      return _(sortedPosts).first();
    } else {
      var nextPost = _(sortedPosts).find(function (post) {
        return post.post.createdAt.getTime() < currentPost.post.createdAt.getTime();
      });
      if (nextPost == null) {
        return _(sortedPosts).first();
      } else {
        return nextPost;
      }
    }
  };

  return api;
}();

var postsList = function () {
  var api = {};
  var pvt = {
    posts: [],
    sortOrder: null, 
    currentPost: null,
    currentTimeRange: null
  };

  api.initialize = function () {
    pvt.loadSortOrder();
    pvt.loadTimeRange();
  };

  pvt.loadTimeRange = function () {
    var cookieTimeRange = $.cookie('time_range');
    if (cookieTimeRange == null) {
      pvt.currentTimeRange = timeRanges[2];
    } else {
      pvt.currentTimeRange = timeRanges[cookieTimeRange];
    }
  }
  
  pvt.loadSortOrder = function () {
    var sortOrderName = $.cookie('sort_order');
    if (sortOrderName != null) {
      pvt.sortOrder = pvt.findSortOrderByName(sortOrderName);
    } else {
      pvt.sortOrder = publicationSort;
    }
  };

  api.currentSortOrderName = function () { return pvt.sortOrder.name; };
  
  api.currentTimeRange = function () { return pvt.currentTimeRange; };

  api.setCurrentTimeRange = function (timeRange) {
    pvt.currentTimeRange = timeRange;
    $.cookie('time_range', timeRange.index);
  };

  api.addAll = function (posts) { _(posts).each(pvt.add); };

  pvt.add = function (post) {
    if (!pvt.contains(post)) { pvt.posts.push(PostsListItem(post)); }
  };

  pvt.contains = function (post) { return _(pvt.posts).any(function (eachPost) { return eachPost.post.isSame(post); }); };

  api.isNotEmpty = function () { return pvt.posts.length > 0; };

  api.next = function () {
    var now = new Date().getTime();
    var validPosts = _(pvt.posts).filter(function (postItem) { return pvt.currentTimeRange.validate(postItem, now); });
    if(_(validPosts).isEmpty()) {
      return null;
    } else {
      var next = pvt.sortOrder.next(pvt.currentPost, validPosts);
      next.viewed = true;
      pvt.currentPost = next;
      return next;
    }
  };

  pvt.findSortOrderByName = function (sortName) {
    var sorts = [publicationSort, randomSort];
    return _(sorts).find(function (sort) { return sort.name == sortName });
  };

  api.setSortOrderByName = function (sortName) {
    pvt.sortOrder = pvt.findSortOrderByName(sortName);
    $.cookie('sort_order', sortName);
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
        pvt.needsToHideLoading = false;
        page.hideLoading();
        settings.initialize();
      }
      var post = postsList.next();
      if (post == null) {
        slider.slide(page.emptySlide());
      } else {
        slider.slide(post.post.html(post.post));
      }
    }
  };

  return api;
}();

var wall = function () {
  var api = {};
  var pvt = {
    shouldFecthLocationBasedTweets: true
  };

  api.initialize = function (venueId) {
    page.createWallContainerHtml();
    page.showLoading();
    postsList.initialize();
    foursquare.venue(venueId, pvt.startShow);
  };

  pvt.startShow = function (venue) {
    var slider = slideShow($('#wallContainer'));
    introduction.showCover(venue.name, slider);
    setTimeout(function () { introduction.showMap(venue.latitude, venue.longitude, slider); }, 2000);

    pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude);
    pvt.fetchCheckins(venue.id);

    setInterval(function () { pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude); }, 300000);
    setInterval(function () { pvt.fetchCheckins(venue.id); }, 300000);

    setTimeout(function () { slidesCoordinator.start(slider); }, 5000);
  };

  pvt.fetchLocationBasedTweets = function (latitude, longitude) {
    if (pvt.shouldFecthLocationBasedTweets) {
      twitter.byLocation(latitude, longitude, postsList.addAll);
    }
  };

  pvt.fetchCheckins = function (venueId) { foursquare.herenow(venueId, pvt.fetchProfiles); };

  pvt.fetchProfiles = function (profilesIds) { _(profilesIds).each(function (profileId) { foursquare.profile(profileId, pvt.fetchPosts); }); };

  pvt.fetchPosts = function (profile) {
    if (profile.twitter != undefined) { twitter.timeline(profile.twitter, postsList.addAll); };
    if (profile.facebook != undefined) { facebook.updates(profile.facebook, postsList.addAll); };
  };

  return api;
}();
