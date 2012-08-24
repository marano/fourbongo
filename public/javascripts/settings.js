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
  TimeRange(0, 1 * 60 * 1000, 'One minute'),
  TimeRange(1, 3 * 60 * 1000, 'Three minutes'),
  TimeRange(2, 5 * 60 * 1000, 'Five minutes'),
  TimeRange(3, 10 * 60 * 1000, 'Ten minutes'),
  TimeRange(4, 30 * 60 * 1000, 'Half an hour'),
  TimeRange(5, 1 * 60 * 60 * 1000, 'One hour'),
  TimeRange(6, 2 * 60 * 60 * 1000, 'Two hours'),
  TimeRange(7, 12 * 60 * 60 * 1000, 'Twelve hours'),
  TimeRange(8, 24 * 60 * 60 * 1000, 'One day'),
  TimeRange(9, 48 * 60 * 60 * 1000, 'Two days')
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
    cookieSetting: cookieSettingLoader('time_range', '9'),
    current: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settingsView.setCurrentTimeRangeLabel(pvt.current.description);
    settings.fillPostsCount();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) {
    return timeRanges[parseInt(rawValue)];
  };

  api.prepare = function () {
    settingsView.prepareTimeRangeSlider(timeRanges.length);
  };

  api.bindEvents = function () {
    settingsView.bindTimeRangeSlider(pvt.set);
  };

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
    current: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settingsView.setCurrentLocationBasedUpdatesDistanceRangeLabel(pvt.current);
    settings.fillPostsCount();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return parseInt(rawValue); };

  api.prepare = function () {
    settingsView.prepareLocationBasedUpdatesDistanceRangeSlider(0, 10000);
  };

  api.bindEvents = function () {
    settingsView.bindLocationBasedUpdatesDistanceRangeSlider(pvt.set);
  };

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

var sortOrderSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('sort_order', 'publication'),
    current: null
  };
  
  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) {
    var sorts = [publicationSort, randomSort];
    return _(sorts).find(function (sort) { return sort.name == rawValue });
  };

  api.bindEvents = function () {
    settingsView.bindToSortByRandomButton(pvt.set);
    settingsView.bindToSortByPublicationButton(pvt.set);
  };

  api.fillPage = function () { settingsView.selectSortOrder(pvt.current.name); };

  api.next = function (currentPost, allPosts) { return pvt.current.next(currentPost, allPosts); };

  return api;
}();

var shouldFetchLocationBasedTweetSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('fetch_location_based_tweets', 'true'),
    current: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settings.fillPostsCount();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () {
    settingsView.bindToShouldFetchLocationBasedTweetsButton(pvt.set);
  };

  api.fillPage = function () { settingsView.setShouldFetchLocationBasedTweets(pvt.current) };

  api.validate = function (postItem) {
    if (pvt.current == false) {
      return !(postItem.post.isUpdateByLocation && postItem.post.isTweet);
    } else {
      return true;
    }
  };

  return api;
}();

var shouldFetchLocationBasedInstagramPicsSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('fetch_location_based_instagram_pics', 'true'),
    current: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settings.fillPostsCount();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () {
    settingsView.bindToShouldFetchLocationBasedInstagramPicsButton(pvt.set);
  };

  api.fillPage = function () {
    settingsView.setShouldFetchLocationBasedInstagramPics(pvt.current)
  };

  api.validate = function (postItem) {
    if (pvt.current == false) {
      return !(postItem.post.isUpdateByLocation && postItem.post.isInstagramPic);
    } else {
      return true;
    }
  };

  return api;
}();

var shouldFetchLocationBasedFlickrPicsSetting = function () {
  var api = {};
  var pvt = {
    cookieSetting: cookieSettingLoader('fetch_location_based_flickr_pics', 'true'),
    current: null
  };

  pvt.set = function (value) {
    pvt.current = pvt.transform(value);
    pvt.cookieSetting.save(value);
    settings.fillPostsCount();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) { return rawValue == 'true'; };

  api.bindEvents = function () {
    settingsView.bindToShouldFetchLocationBasedFlickrPicsButton(pvt.set);
  };

  api.fillPage = function () { settingsView.setShouldFetchLocationBasedFlickrPics(pvt.current) };

  api.validate = function (postItem) {
    if (pvt.current == false) {
      return !(postItem.post.isUpdateByLocation && postItem.post.isFlickrPic);
    } else {
      return true;
    }
  };

  return api;
}();

var settings = function () {
  var api = {
    list: []
  };

  var pvt = {
    lastHover: 0,
    isIconDisplayed: false,
    areOptionsDisplayed: false,
  };

  api.initialize = function () {
    _(api.list).each(function (setting) {
      setting.load();
    });
    homePage.bindToMouseMovement(pvt.mouseMovement);
    postsList.onchange(api.fillPostsCount);
  };

  api.validate = function (postItem) {
    var filterSettings = _(api.list).select(function (setting) { return setting.validate; });
    return _(filterSettings).all(function (filterSetting) { return filterSetting.validate(postItem); })
  };

  api.fillPostsCount = function () {
    settingsView.setPostsCountLabel(postsList.validPosts().length);
  };

  pvt.mouseMovement = function () {
    if (pvt.isIconDisplayed) { return; }
    pvt.isIconDisplayed = true;
    pvt.showSettingsIcon();
  };

  pvt.settingsIconHover = function () {
    if (pvt.areOptionsDisplayed) {
      pvt.moreTime();
      return;
    }
    pvt.areOptionsDisplayed = true;
    settingsView.showSettingsOptions(function () {
      api.fillPostsCount();

      _(api.list).each(function (setting) {
        if (setting.prepare) {
          setting.prepare();
        }
        setting.fillPage();
        setting.bindEvents();
      });
    });
    pvt.moreTime();
  };

  pvt.showSettingsIcon = function () {
    settingsView.showSettingsIcon(function () { settingsView.bindToSettingsIconHover(pvt.settingsIconHover); });
    pvt.moreTime();
  };

  pvt.moreTime = function () {
    pvt.lastHover = new Date().getTime();
    setTimeout(function () {
      if ((new Date().getTime() - pvt.lastHover) >= 5000) {
        settingsView.hideSettings();
        pvt.isIconDisplayed = false;
        pvt.areOptionsDisplayed = false;
      }
    }, 5000);
  };

  return api;
}();
