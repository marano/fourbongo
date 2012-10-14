var introduction = function () {
  var api = {};

  api.showCover = function (venueName, slider) { slider.slide(wallPage.coverHtml(venueName)); };

  api.showTagCover = function (tag, slider) { slider.slide(wallPage.tagCoverHtml(tag)); };

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
    avatar_small: tweetData.avatar,
    avatar: tweetData.avatar.replace('_normal', ''),
    mediaUrl: tweetData.mediaUrl,
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
    isUpdateByLocation: false,
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

var PostsList = function (settings) {
  var api = {};

  var posts = [];
  var currentPost = null;
  settings.setPostsList(api);

  api.addAll = function (newPosts) { _(newPosts).each(add); };

  function add(post) {
    if (!contains(post)) {
      posts.push(PostsListItem(post));
      settings.fillPostsCount();
    }
  };

  function contains(post) { return _(posts).any(function (eachPost) { return eachPost.post.isSame(post); }); };

  api.isNotEmpty = function () { return posts.length > 0; };

  api.validPosts = function () { return _(posts).select(settings.validate); };

  api.next = function () {
    var validPosts = api.validPosts();
    if(_(validPosts).isEmpty()) {
      return null;
    } else {
      var next = sortOrderSetting.next(currentPost, validPosts);
      next.viewed = true;
      currentPost = next;
      return next;
    }
  };

  return api;
};

var SlidesCoordinator = function (postsList) {
  var api = {};
  var pvt = {
    paused: false,
    needsToHideLoading: true,
    isShowingNoUpdates: false
  };
  
  api.start = function (slider) {
    keepSliding(slider);
  };

  function keepSliding(slider) {
    pvt.next(slider);
    if (pvt.isShowingNoUpdates) {
      setTimeout(function () { keepSliding(slider); }, 1000);
    } else {
      setTimeout(function () { keepSliding(slider); }, 10000);
    }
  }

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
};

var tagWall = function (tag) {
  var api = {};

  var raw_tag = tag.replace(/#/g, '');
  window.location.hash = 'tag=' + raw_tag;
  wallPage.createWallContainerHtml();
  wallPage.showLoading();

  var settingsList = [
    timeRangeSetting,
    sortOrderSetting,
    showTwitterSetting(),
    showInstagramSetting()
  ]

  var hideDistanceRangeSetting = true;
  var hideFlickrSetting = true;
  var settings = Settings(settingsList, hideDistanceRangeSetting, hideFlickrSetting);
  settings.initialize();

  var postsList = PostsList(settings);

  var slidesCoordinator = SlidesCoordinator(postsList);

  startShow();

  function startShow() {
    var slider = slideShow($('#wallContainer'));
    introduction.showTagCover('#' + raw_tag, slider);

    instagram.mediaByTag(raw_tag, postsList.addAll);
    twitter.byTag(raw_tag, postsList.addAll);

    setTimeout(function () { slidesCoordinator.start(slider); }, 2500);
  }

  return api;
};

var wall = function (venueId) {
  var api = {
    venueLat: null,
    venueLng: null
  };

  var pvt = {};

  var postsList = null;
  var slidesCoordinator = null;

  window.location.hash = 'venueId=' + venueId;
  wallPage.createWallContainerHtml();
  wallPage.showLoading();
  foursquare.venue(venueId, startShow);

  function startShow(venue) {
    var settingsList = [
      showTwitterSetting(),
      showInstagramSetting(),
      showFlickrSetting(),
      locationBasedUpdatesDistanceRangeSetting(venue.latitude, venue.longitude),
      timeRangeSetting,
      sortOrderSetting
    ]

    var hideDistanceRangeSetting = false;
    var hideFlickrSetting = false;
    var settings = Settings(settingsList, hideDistanceRangeSetting, hideFlickrSetting);
    settings.initialize();

    postsList = PostsList(settings);

    slidesCoordinator = SlidesCoordinator(postsList);

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

    setTimeout(function () { slidesCoordinator.start(slider); }, 15000);
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

  pvt.fetchProfiles = function (profileIds) { _(profileIds).each(function (profileId) { foursquare.profile(profileId, pvt.fetchPosts); }); };

  pvt.fetchPosts = function (profile) {
    if (profile.twitter != undefined) { twitter.timeline(profile.twitter, postsList.addAll); };
    if (profile.facebook != undefined) { facebook.updates(profile.facebook, postsList.addAll); };
  };

  return api;
};
