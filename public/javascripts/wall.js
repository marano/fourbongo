var introduction = function () {
  var api = {};

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
    locationName: tweetData.locationName,
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
    locationName: mediaData.locationName,
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
    shown: false
  };
  return api;
};

var PostsList = function (settings) {
  var api = {};

  var posts = [];
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
  };

  return api;
};

var SlidesCoordinator = function (postsList) {
  var api = {};
  var pvt = {
    paused: false,
    needsToHideLoading: true,
    isShowingNoUpdates: false,
    started: false,
    currentPost: null
  };
  
  api.start = function (slider) {
    keepSliding(slider);
  };

  function keepSliding(slider) {
    pvt.nextSlide(slider);
    if (pvt.isShowingNoUpdates) {
      setTimeout(function () { keepSliding(slider); }, 1000);
    } else {
      setTimeout(function () { keepSliding(slider); }, speedSetting.waitInSeconds() * 1000);
    }
  }

  api.pause = function () { pvt.paused = true; };

  api.resume = function () { pvt.paused = false; };

  pvt.noUpdates = function (slider) {
    if (!pvt.isShowingNoUpdates) {
      pvt.isShowingNoUpdates = true;
      if (pvt.started) {
        slider.slide(wallPage.noUpdatesSlide());
      }
    }
  };

  pvt.nextPost = function () {
    var validPosts = postsList.validPosts();
    if(_(validPosts).isEmpty()) {
      return null;
    } else {
      var next = sortOrderSetting.next(pvt.currentPost, validPosts);
      if (pvt.currentPost) {
        pvt.currentPost.shown = true;
      }
      pvt.currentPost = next;
      return next;
    }
  };

  pvt.nextSlide = function (slider) {
    if (pvt.paused) { return; }
    if (postsList.isNotEmpty()) {
      var post = pvt.nextPost();
      if (post == null) {
        pvt.noUpdates(slider);
      } else {
        pvt.isShowingNoUpdates = false;
        pvt.started = true;
        if (pvt.needsToHideLoading) {
          pvt.needsToHideLoading = false;
          wallPage.hideLoading();
        }
        slider.slide(post.post.html(post.post));
      }
    } else {
      pvt.noUpdates(slider);
    }
  };

  return api;
};

var Visualization = function (searchStrategy) {
  var api = {};

  wallPage.showLoading();

  var updateInterval = 4.75 * 60 * 1000;

  var twitterNetwork = SocialNetwork('twitter');
  twitter.network = twitterNetwork;

  var instagramNetwork = SocialNetwork('instagram', ['86a8f41a1066466c8780fa68be17e71b', 'f440f7e4c1b4411c814a165d4a1a64a1', '8cfff1cc2af345f4b4574436c75ea068']);
  instagram.network = instagramNetwork;

  var facebookNetwork = FacebookNetwork(function () { searchStrategy.onFacebookLoad(postsList, facebookNetwork); });

  var socialNetworks = [
    twitterNetwork,
    instagramNetwork,
    SocialNetwork('flickr'),
    facebookNetwork
  ];

  initializeNetworks();

  var visualizationMode = visualizationModeSetting();
  visualizationMode.load();
  var coordinator = visualizationMode.current().coordinator;

  var settingsList = [
    visualizationMode,
    showTwitterSetting(),
    showInstagramSetting(),
    showFacebookSetting(),
    showFlickrSetting(),
  ].concat(coordinator.specificSettings()).concat(searchStrategy.specificSettings);

  var settings = Settings(settingsList);
  settings.initialize();

  var postsList = PostsList(settings);

  function initializeNetworks() {
    _(socialNetworks).each(function (service) { service.initialize(); });
    $.fn.tipsy.defaults = {
        delayIn: 0,      // delay before showing tooltip (ms)
        delayOut: 0,     // delay before hiding tooltip (ms)
        fade: false,     // fade tooltips in/out?
        fallback: '',    // fallback text to use when no tooltip text
        gravity: 'n',    // gravity
        html: false,     // is tooltip content HTML?
        live: false,     // use live event support?
        offset: 12,       // pixel offset of tooltip from element
        opacity: 0.95,    // opacity of tooltip
        title: 'title',  // attribute/callback containing tooltip text
        trigger: 'hover' // how tooltip is triggered - hover | focus | manual
    };
    $('.network i').tipsy({gravity: 's'});
  }

  api.start = function () {
    coordinator.start(searchStrategy.title, postsList);

    searchStrategy.search(postsList, instagramNetwork, facebookNetwork);
    setInterval(function () { searchStrategy.search(postsList, instagramNetwork); }, updateInterval);
    setInterval(settings.fillPostsCount, 2000);
  };

  return api;
};

var WallContentCoordinator = function () {
  var api = {};

  api.specificSettings = function () { return []; };

  api.start = function (coverTitle, postsList) {
    $('#wallContainer').show()
    $('.title').text(coverTitle);

    new Dragdealer('zoom-scroll', {
      horizontal: false,
      snap: true,
      yPrecision: 1,
      vertical: true,
      steps: 75,
      y: 0.5,
      animationCallback: function(x, y) {
        var zoom = 100 - (y * 100) + 25;
        console.log(zoom);
        $('#wallContentContainer').css('zoom', zoom + '%');
      }
    });

    setInterval(function () {
      var posts = postsList.validPosts();
      posts = posts.slice(0,300);
      _(posts).chain().reject(function (postItem) {
        return postItem.shown;
      }).sort(function (postItem) {
        return postItem.post.createdAt;
      }).reverse().each(function (postItem) {
        postItem.shown = true;
        $('#wallContentContainer').append(postItem.post.html(postItem.post));
      });
    }, 2500);
  };
  return api;
};

var SlideshowContentCoordinator = function () {
  var api = {};

  api.specificSettings = function () {
    return [
      timeRangeSetting,
      sortOrderSetting,
      speedSetting
    ];
  };

  api.start = function (coverTitle, postsList) {
    $('#slideshowContainer').show()
    wallPage.createWallContainerHtml();
    var slider = slideShow($('#slideshowContainer'));
    slider.slide(wallPage.coverHtml(coverTitle));
    var slidesCoordinator = SlidesCoordinator(postsList);
    setTimeout(function () { slidesCoordinator.start(slider); }, 2500);
  };

  return api;
};

var TagSearchStrategy = function (rawTags) {
  var api = {};

  var tags = _(rawTags.split(/,| /)).reject(function (tag) { return tag === ''; }).map(function (eachRawTag) {
    return eachRawTag.replace(/#/g, '').trim();
  });

  api.title = '#' + tags.join(' #');

  window.location.hash = 'tag=' + tags.join(',');

  api.specificSettings = [];

  function fetchFacebook(postsList, facebookNetwork) {
    if (facebookNetwork.isAuthenticated) {
      facebook.updatesByTags(tags, postsList.addAll);
    }
  }

  api.onFacebookLoad = function (postsList, facebookNetwork) {
    fetchFacebook(postsList, facebookNetwork);
  };

  api.search = function (postsList, instagramNetwork, facebookNetwork) {
    twitter.byTag(tags, postsList.addAll);
    flickr.picsByTags(tags, postsList.addAll);
    fetchFacebook(facebookNetwork, postsList);
    _(tags).each(function (eachTag) {
      instagram.mediaByTag(eachTag, postsList.addAll, instagramNetwork);
    });
  };

  return api;
};

var LocationSearchStrategy = function (venue) {
  var api = {};

  window.location.hash = 'venueId=' + venue.id;

  api.title = venue.name;

  api.specificSettings = [
    locationBasedUpdatesDistanceRangeSetting(venue.latitude, venue.longitude)
  ];

  api.onFacebookLoad = function (postsList, facebookNetwork) {
    fetchFacebook(postsList, facebookNetwork);
  };

  function fetchFacebook(postsList, facebookNetwork) {
    if (facebookNetwork.isAuthenticated) {
      facebook.updatesByLocation(venue.latitude, venue.longitude, postsList.addAll);
    }
  }

  api.search = function (postsList, instagramNetwork, facebookNetwork) {
    twitter.byLocation(venue.latitude, venue.longitude, postsList.addAll);
    instagram.mediaByLocation(venue.latitude, venue.longitude, postsList.addAll, instagramNetwork);
    flickr.picsByLocation(venue.latitude, venue.longitude, postsList.addAll);
    fetchFacebook(postsList, facebookNetwork);

    foursquare.herenow(venue.id, function (profileIds) {
      _(profileIds).each(function (profileId) {
        foursquare.profile(profileId, function (profile) {
          if (profile.twitter != undefined) { twitter.timeline(profile.twitter, postsList.addAll); };
          if (profile.facebook != undefined) { facebook.updates(profile.facebook, postsList.addAll); };
        });
      });
    });
  };

  return api;
};
