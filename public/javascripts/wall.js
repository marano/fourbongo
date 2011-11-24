var introduction = function () {
  var api = {};

  api.showCover = function (venueName, slider) { slider.slide(wallPage.coverHtml(venueName)); };

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
    avatar: tweetData.avatar.replace('_normal', ''),
    isTweetByLocation: tweetData.isTweetByLocation
  };

  api.isSame = function (otherPost) { return api.id == otherPost.id; };

  api.html = function (post) { return wallPage.tweetHtml(post); };

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

  api.html = function (post) { return wallPage.facebookUpdateHtml(post); };

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
    currentTimeRange: null,
    shouldShowLocationBasedTweets: null
  };

  api.initialize = function () {
    pvt.loadSortOrder();
    pvt.loadTimeRange();
    pvt.loadShouldFetchLocationBasedTweets();
  };

  api.addAll = function (posts) { _(posts).each(pvt.add); };

  pvt.add = function (post) {
    if (!pvt.contains(post)) { pvt.posts.push(PostsListItem(post)); }
  };

  pvt.contains = function (post) { return _(pvt.posts).any(function (eachPost) { return eachPost.post.isSame(post); }); };

  api.isNotEmpty = function () { return pvt.posts.length > 0; };

  api.next = function () {
    var now = new Date().getTime();
    var validPosts = _(pvt.posts).filter(function (postItem) {
      if (!pvt.shouldShowLocationBasedTweets && postItem.post.isTweetByLocation) {
        return false;
      } else {
        return pvt.currentTimeRange.validate(postItem, now);
      }
    });
    if(_(validPosts).isEmpty()) {
      return null;
    } else {
      var next = pvt.sortOrder.next(pvt.currentPost, validPosts);
      next.viewed = true;
      pvt.currentPost = next;
      return next;
    }
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

  pvt.loadShouldFetchLocationBasedTweets = function () {
    var cookieShouldFetchLocationBasedTweets = $.cookie('fetch_location_based_tweets');
    if (cookieShouldFetchLocationBasedTweets != undefined) {
      pvt.shouldShowLocationBasedTweets = cookieShouldFetchLocationBasedTweets == 'true';
    } else {
      pvt.shouldShowLocationBasedTweets = true;
    }
  }

  api.currentSortOrderName = function () { return pvt.sortOrder.name; };
  
  api.currentTimeRange = function () { return pvt.currentTimeRange; };

  api.shouldShowLocationBasedTweets = function () { return pvt.shouldShowLocationBasedTweets; };

  api.setCurrentTimeRange = function (timeRange) {
    pvt.currentTimeRange = timeRange;
    $.cookie('time_range', timeRange.index);
  };

  pvt.findSortOrderByName = function (sortName) {
    var sorts = [publicationSort, randomSort];
    return _(sorts).find(function (sort) { return sort.name == sortName });
  };

  api.setSortOrderByName = function (sortName) {
    pvt.sortOrder = pvt.findSortOrderByName(sortName);
    $.cookie('sort_order', sortName);
  };

  api.setShouldFetchLocationBasedTweets = function (value) {
    pvt.shouldShowLocationBasedTweets = value;
    $.cookie('fetch_location_based_tweets', value);
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
        wallPage.hideLoading();
      }
      var post = postsList.next();
      if (post == null) {
        slider.slide(wallPage.noUpdatesSlide());
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
  };

  api.initialize = function (venueId) {
    wallPage.createWallContainerHtml();
    wallPage.showLoading();
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
    twitter.byLocation(latitude, longitude, postsList.addAll);
  };

  pvt.fetchCheckins = function (venueId) { foursquare.herenow(venueId, pvt.fetchProfiles); };

  pvt.fetchProfiles = function (profilesIds) { _(profilesIds).each(function (profileId) { foursquare.profile(profileId, pvt.fetchPosts); }); };

  pvt.fetchPosts = function (profile) {
    if (profile.twitter != undefined) { twitter.timeline(profile.twitter, postsList.addAll); };
    if (profile.facebook != undefined) { facebook.updates(profile.facebook, postsList.addAll); };
  };

  return api;
}();
