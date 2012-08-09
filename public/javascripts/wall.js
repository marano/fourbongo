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
    isUpdateByLocation: tweetData.isUpdateByLocation,
    latitude: tweetData.latitude,
    longitude: tweetData.longitude,
    isTweet: true
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

var InstagramMedia = function (mediaData) {
  var api = {
    id: mediaData.id,
    username: mediaData.username,
    fullname: mediaData.fullname,
    media: mediaData.media,
    caption: mediaData.caption,
    createdAt: mediaData.createdAt,
    avatar: mediaData.avatar,
    isUpdateByLocation: mediaData.isUpdateByLocation,
    latitude: mediaData.latitude,
    longitude: mediaData.longitude,
    isInstagramPic: true
  };

  api.isSame = function (otherPost) { return api.id == otherPost.id; };

  api.html = function (post) { return wallPage.instagramMediaHtml(post); };

  return api;
};

var FlickrPic = function (picData) {
  var api = {
    id: picData.id,
    username: picData.username,
    fullname: picData.fullname,
    media: picData.media,
    caption: picData.caption,
    createdAt: picData.createdAt,
    avatar: picData.avatar,
    isUpdateByLocation: picData.isUpdateByLocation,
    latitude: picData.latitude,
    longitude: picData.longitude,
    isFlickrPic: true
  };

  api.isSame = function (otherPost) { return api.id == otherPost.id; };

  api.html = function (post) { return wallPage.flickrPicHtml(post); };

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
    currentPost: null,
    shouldShowLocationBasedTweets: null,
    shouldShowLocationBasedInstagramPics: null,
    shouldShowLocationBasedFlickrPics: null,
    onchangeCallback: null
  };

  api.initialize = function () {
    pvt.loadShouldFetchLocationBasedTweets();
    pvt.loadShouldFetchLocationBasedInstagramPics();
    pvt.loadShouldFetchLocationBasedFlickrPics();
  };

  api.onchange = function (callback) {
    pvt.onchangeCallback = callback;
  };

  api.addAll = function (posts) { _(posts).each(pvt.add); };

  pvt.add = function (post) {
    if (!pvt.contains(post)) {
      pvt.posts.push(PostsListItem(post));
      pvt.onchangeCallback();
    }
  };

  pvt.contains = function (post) { return _(pvt.posts).any(function (eachPost) { return eachPost.post.isSame(post); }); };

  api.isNotEmpty = function () { return pvt.posts.length > 0; };

  api.validPosts = function () {
    var now = new Date().getTime();
    return _(pvt.posts).filter(function (postItem) {
      if (!pvt.shouldShowLocationBasedTweets && postItem.post.isUpdateByLocation && postItem.post.isTweet) {
        return false;
      }
      if (!pvt.shouldShowLocationBasedInstagramPics && postItem.post.isUpdateByLocation && postItem.post.isInstagramPic) {
        return false;
      }
      if (!pvt.shouldShowLocationBasedFlickrPics && postItem.post.isUpdateByLocation && postItem.post.isFlickrPic) {
        return false;
      }
      return locationBasedUpdatesDistanceRangeSetting.validate(postItem) && timeRangeSetting.validate(postItem, now);
    });
  };

  api.next = function () {
    var validPosts = api.validPosts();
    if(_(validPosts).isEmpty()) {
      return null;
    } else {
      var next = sortOrderSetting.next(pvt.currentPost, validPosts);
      next.viewed = true;
      pvt.currentPost = next;
      return next;
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

  pvt.loadShouldFetchLocationBasedInstagramPics = function () {
    var cookieShouldFetchLocationBasedInstagramPics = $.cookie('fetch_location_based_instagram_pics');
    if (cookieShouldFetchLocationBasedInstagramPics != undefined) {
      pvt.shouldShowLocationBasedInstagramPics = cookieShouldFetchLocationBasedInstagramPics == 'true';
    } else {
      pvt.shouldShowLocationBasedInstagramPics = true;
    }
  }

  pvt.loadShouldFetchLocationBasedFlickrPics = function () {
    var cookieShouldFetchLocationBasedFlickrPics = $.cookie('fetch_location_based_flickr_pics');
    if (cookieShouldFetchLocationBasedFlickrPics != undefined) {
      pvt.shouldShowLocationBasedFlickrPics = cookieShouldFetchLocationBasedFlickrPics == 'true';
    } else {
      pvt.shouldShowLocationBasedFlickrPics = true;
    }
  }

  api.shouldShowLocationBasedTweets = function () { return pvt.shouldShowLocationBasedTweets; };
  
  api.shouldShowLocationBasedInstagramPics = function () { return pvt.shouldShowLocationBasedInstagramPics; };

  api.shouldShowLocationBasedFlickrPics = function () { return pvt.shouldShowLocationBasedFlickrPics; };

  pvt.findSortOrderByName = function (sortName) {
    var sorts = [publicationSort, randomSort];
    return _(sorts).find(function (sort) { return sort.name == sortName });
  };

  api.setShouldFetchLocationBasedTweets = function (value) {
    pvt.shouldShowLocationBasedTweets = value;
    $.cookie('fetch_location_based_tweets', value);
  };

  api.setShouldFetchLocationBasedInstagramPics = function (value) {
    pvt.shouldShowLocationBasedInstagramPics = value;
    $.cookie('fetch_location_based_instagram_pics', value);
  };

  api.setShouldFetchLocationBasedFlickrPics = function (value) {
    pvt.shouldShowLocationBasedFlickrPics = value;
    $.cookie('fetch_location_based_flickr_pics', value);
  };

  return api;
}();

var slidesCoordinator = function () {
  var api = {};
  var pvt = {
    paused: false,
    needsToHideLoading: true,
    isShowingNoUpdates: false
  };
  
  api.start = function (slider) { setInterval(function () { pvt.next(slider); }, 10000); };

  api.pause = function () { pvt.paused = true; };

  api.resume = function () { pvt.paused = false; };

  pvt.noUpdates = function (slider) {
    if (!pvt.isShowingNoUpdates) {
      pvt.isShowingNoUpdates = true;
      slider.slide(wallPage.noUpdatesSlide());
    }
  };

  pvt.next = function (slider) {
    if (pvt.paused) { return; }
    if (postsList.isNotEmpty()) {
      if (pvt.needsToHideLoading) {
        pvt.needsToHideLoading = false;
        wallPage.hideLoading();
      }
      var post = postsList.next();
      if (post == null) {
        pvt.noUpdates(slider);
      } else {
        pvt.isShowingNoUpdates = false;
        slider.slide(post.post.html(post.post));
      }
    } else {
      pvt.noUpdates(slider);
    }
  };

  return api;
}();

var wall = function () {
  var api = {
    venueLat: null,
    venueLng: null
  };
  var pvt = {};

  api.initialize = function (venueId) {
    wallPage.createWallContainerHtml();
    wallPage.showLoading();
    foursquare.venue(venueId, pvt.startShow);
  };

  pvt.startShow = function (venue) {
    api.venueLat = venue.latitude;
    api.venueLng = venue.longitude;

    var slider = slideShow($('#wallContainer'));
    introduction.showCover(venue.name, slider);
    setTimeout(function () { introduction.showMap(venue.latitude, venue.longitude, slider); }, 2000);

    pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude);
    pvt.fetchInstagramMedia(venue.latitude, venue.longitude);
    pvt.fetchFlickrMedia(venue.latitude, venue.longitude);
    pvt.fetchCheckins(venue.id);

    setInterval(function () { pvt.fetchLocationBasedTweets(venue.latitude, venue.longitude); }, 300000);
    setInterval(function () { pvt.fetchInstagramMedia(venue.latitude, venue.longitude); }, 300000);
    setInterval(function () { pvt.fetchFlickrMedia(venue.latitude, venue.longitude); }, 300000);
    setInterval(function () { pvt.fetchCheckins(venue.id); }, 300000);

    setTimeout(function () { slidesCoordinator.start(slider); }, 5000);
  };

  pvt.fetchLocationBasedTweets = function (latitude, longitude) {
    twitter.byLocation(latitude, longitude, postsList.addAll);
  };

  pvt.fetchInstagramMedia = function (latitude, longitude) {
    instagram.mediaByLocation(latitude, longitude, postsList.addAll);
  };

  pvt.fetchFlickrMedia = function (latitude, longitude) {
    flickr.picsByLocation(latitude, longitude, postsList.addAll);
  };

  pvt.fetchCheckins = function (venueId) { foursquare.herenow(venueId, pvt.fetchProfiles); };

  pvt.fetchProfiles = function (profilesIds) { _(profilesIds).each(function (profileId) { foursquare.profile(profileId, pvt.fetchPosts); }); };

  pvt.fetchPosts = function (profile) {
    if (profile.twitter != undefined) { twitter.timeline(profile.twitter, postsList.addAll); };
    if (profile.facebook != undefined) { facebook.updates(profile.facebook, postsList.addAll); };
  };

  return api;
}();
