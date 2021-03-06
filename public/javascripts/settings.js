var TimeRange = function (index, timeInThePast, description) {
  var api = {
    timeInThePast: timeInThePast,
    description: description,
    index: index
  };

  api.validate = function (postItem, now) { return (now - postItem.post.createdAt.getTime()) <= timeInThePast; };

  return api;
};

var timeRanges = [
  TimeRange(0, 5 * 60 * 1000, 'Five minutes'),
  TimeRange(1, 10 * 60 * 1000, 'Ten minutes'),
  TimeRange(2, 30 * 60 * 1000, 'Half an hour'),
  TimeRange(3, 1 * 60 * 60 * 1000, 'One hour'),
  TimeRange(4, 2 * 60 * 60 * 1000, 'Two hours'),
  TimeRange(5, 12 * 60 * 60 * 1000, 'Twelve hours'),
  TimeRange(6, 24 * 60 * 60 * 1000, 'One day'),
  TimeRange(7, 3 * 24 * 60 * 60 * 1000, 'Three days'),
  TimeRange(8, 7 * 24 * 60 * 60 * 1000, 'One week')
];

var Speed = function (index, waitInSeconds) {
  var api = {};
  api.index = index;
  api.value = function () { return waitInSeconds; };
  api.label = function () { return waitInSeconds + ' seconds'; };
  return api;
};

var speeds = [
  Speed(0, 1),
  Speed(1, 2),
  Speed(2, 3),
  Speed(3, 4),
  Speed(4, 5),
  Speed(5, 7),
  Speed(6, 10),
  Speed(7, 15),
  Speed(8, 20),
  Speed(9, 30),
  Speed(10, 60),
  Speed(11, 90)
];

var cookieSettingLoader = function (cookieKey, defaultValue) {
  var api = {};
  var pvt = {
    cookieKey: cookieKey,
    defaultValue: defaultValue
  };

  api.save = function (value) { $.cookie(pvt.cookieKey, value); };

  api.load = function () {
    var cookieValue = $.cookie(pvt.cookieKey);
    if (cookieValue == null) {
      return defaultValue;
    } else {
      return cookieValue;
    }
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

var timeRangeSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('time_range', (timeRanges.length - 1) + ''),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settingsView.setCurrentTimeRangeLabel(pvt.current.description);
    pvt.changeCallback();
  }

  api.load = function () {
    $('#timeRange.settingsSection').show();
    pvt.current = pvt.transform(pvt.cookieSetting.load());
  };

  pvt.transform = function (rawValue) {
    return timeRanges[parseInt(rawValue)];
  };

  api.prepare = function () {
    settingsView.prepareTimeRangeSlider(timeRanges.length);
  };

  api.bindEvents = function () {
    settingsView.bindTimeRangeSlider(pvt.set);
  };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setCurrentTimeRange(pvt.current.description, pvt.current.index); };

  api.validate = function (postItem) {
    var now = new Date().getTime();
    return pvt.current.validate(postItem, now);
  }

  return api;
}();

var locationBasedUpdatesDistanceRangeSetting = function (venueLat, venueLng) {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('distance_range', '10000'),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settingsView.setCurrentLocationBasedUpdatesDistanceRangeLabel(pvt.current);
    pvt.changeCallback();
  }

  api.load = function () {
    $('#distanceRange.settingsSection').show();
    pvt.current = pvt.transform(pvt.cookieSetting.load());
  };

  pvt.transform = function (rawValue) { return parseInt(rawValue); };

  api.prepare = function () {
    settingsView.prepareLocationBasedUpdatesDistanceRangeSlider(0, 10000);
  };

  api.bindEvents = function () {
    settingsView.bindLocationBasedUpdatesDistanceRangeSlider(pvt.set);
  };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setCurrentLocationBasedUpdatesDistanceRange(pvt.current); };

  api.validate = function (postItem, now) {
    if (postItem.post.isUpdateByLocation) {
      return pvt.current >= map.distance(postItem.post.latitude, postItem.post.longitude, venueLat, venueLng);
    } else {
      return true;
    }
  }

  return api;
};

var speedSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('speed', '4'),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settingsView.setCurrentSpeedLabel(pvt.current.label());
    pvt.changeCallback();
  }

  api.load = function () {
    $('#speed.settingsSection').show();
    pvt.current = pvt.transform(pvt.cookieSetting.load());
  };

  pvt.transform = function (rawValue) {
    return speeds[parseInt(rawValue)];
  };

  api.prepare = function () {
    settingsView.prepareSpeedSlider(speeds.length);
  };

  api.bindEvents = function () {
    settingsView.bindSpeedSlider(pvt.set);
  };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setCurrentSpeed(pvt.current.label(), pvt.current.index); };

  api.waitInSeconds = function () { return pvt.current.value(); };

  return api;
}();

var wallVisualizationMode = function () {
  var api = {
    name: 'wall',
    coordinator: WallContentCoordinator()
  };
  return api;
}();

var slideshowVisualizationMode = function () {
  var api = {
    name: 'slideshow',
    coordinator: SlideshowContentCoordinator()
  };
  return api;
}();

var visualizationModeSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('visualization_mode', 'wall'),
    current: null,
  };

  api.current = function () {
    return pvt.current;
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) {
    var modes = [wallVisualizationMode, slideshowVisualizationMode];
    return _(modes).find(function (mode) { return mode.name == rawValue });
  };

  api.bindEvents = function () {
    var callSet = function () {
      pvt.set($(this).attr('value'));
      window.location.reload();
    };
    $('#wallVisualization').click(callSet);
    $('#slideshowVisualization').click(callSet);
  };

  api.onchange = function (callback) {};

  api.fillPage = function () {
    $('input:radio[value=' + pvt.current.name + ']').attr('checked', true); 
  };

  api.next = function (currentPost, allPosts) { return pvt.current.next(currentPost, allPosts); };

  return api;
};


var sortOrderSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('sort_order', 'publication'),
    current: null,
  };
  
  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
  }

  api.load = function () {
    $('#sort.settingsSection').show();
    pvt.current = pvt.transform(pvt.cookieSetting.load());
  };

  pvt.transform = function (rawValue) {
    var sorts = [publicationSort, randomSort];
    return _(sorts).find(function (sort) { return sort.name == rawValue });
  };

  api.bindEvents = function () {
    settingsView.bindToSortByRandomButton(pvt.set);
    settingsView.bindToSortByPublicationButton(pvt.set);
  };

  api.onchange = function (callback) {};

  api.fillPage = function () { settingsView.selectSortOrder(pvt.current.name); };

  api.next = function (currentPost, allPosts) { return pvt.current.next(currentPost, allPosts); };

  return api;
}();

var ZoomSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('zoom', '0.5'),
    current: null
  };

  pvt.set = function (value) {
    pvt.current = value;
    pvt.cookieSetting.save(value);
  }

  api.load = function () {
    pvt.current = pvt.transform(pvt.cookieSetting.load());

    new Dragdealer('zoom-scroll', {
      horizontal: false,
      snap: true,
      yPrecision: 1,
      vertical: true,
      steps: 75,
      y: pvt.current,
      animationCallback: function(x, y) {
        pvt.set(y);
        var zoom = (1 - y) *  75 + 25;
        $('#wallContentContainer').css('zoom', zoom + '%');
      }
    });
  };

  pvt.transform = function (rawValue) {
    return parseFloat(rawValue);
  };

  api.bindEvents = function () {};

  api.onchange = function (callback) {};

  api.fillPage = function () {};

  return api;
};

var showTwitterSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('show_twitter', 'true'),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    pvt.changeCallback();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () { settingsView.bindToShowTwitterButton(pvt.set); };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setShowTwitter(pvt.current) };

  api.validate = function (postItem) { return pvt.current || !postItem.post.isTweet; };

  return api;
};

var showInstagramSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('show_instagram', 'true'),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    pvt.changeCallback();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () { settingsView.bindToShowInstagramButton(pvt.set); };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setShowInstagram(pvt.current) };

  api.validate = function (postItem) { return pvt.current || !postItem.post.isInstagramPic; };

  return api;
};

var showFacebookSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('show_facebook', 'true'),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    pvt.changeCallback();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () { settingsView.bindToShowFacebookButton(pvt.set); };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setShowFacebook(pvt.current) };

  api.validate = function (postItem) { return pvt.current || !postItem.post.isFacebookUpdate; };

  return api;
};

var showFlickrSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('show_flickr', 'true'),
    current: null,
    changeCallback: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    pvt.changeCallback();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () { settingsView.bindToShowFlickrButton(pvt.set); };

  api.onchange = function (callback) { pvt.changeCallback = callback; };

  api.fillPage = function () { settingsView.setShowFlickr(pvt.current) };

  api.validate = function (postItem) { return pvt.current || !postItem.post.isFlickrPic; };

  return api;
};

var Settings = function (list) {
  var api = {};

  var postsList = null;

  api.initialize = function () {
    _(list).each(function (setting) {
      setting.load();
    });
    settingsView.showSettingsIcon();
    $('#settingsIcon').click(settingsView.showSettingsOptions);
    $('#close-settings').click(function () {
      settingsView.hideSettings(settingsView.showSettingsIcon);
    });

    _(list).each(function (setting) {
      if (setting.prepare) {
        setting.prepare();
      }
      setting.fillPage();
      setting.bindEvents();
      setting.onchange(api.fillPostsCount);
    });
  };

  api.setPostsList = function (newPostsList) {
    postsList = newPostsList;
  };

  api.validate = function (postItem) {
    var filterSettings = _(list).select(function (setting) { return setting.validate; });
    return _(filterSettings).all(function (filterSetting) { return filterSetting.validate(postItem); })
  };

  api.fillPostsCount = function () {
    settingsView.setPostsCountLabel(postsList.validPosts().length);
  };

  return api;
};
