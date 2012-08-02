var TimeRange = function (index, timeInThePast, description) {
  api = {
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
    wallPage.setCurrentTimeRangeLabel(pvt.current.description);
    settings.fillPostsCount();
  }

  api.load = function () { pvt.current = pvt.transform(pvt.cookieSetting.load()); };

  pvt.transform = function (rawValue) {
    return timeRanges[parseInt(rawValue)];
  };

  api.bindEvents = function () {
    wallPage.prepareTimeRangeSlider(timeRanges.length, pvt.set);
  };

  api.fillPage = function () { wallPage.setCurrentTimeRange(pvt.current.description, pvt.current.index); };

  api.validate = function (postItem, now) {
    return pvt.current.validate(postItem, now);
  }

  return api;
}();

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
    wallPage.bindToSortByRandomButton(pvt.set);
    wallPage.bindToSortByPublicationButton(pvt.set);
  };

  api.fillPage = function () { wallPage.selectSortOrder(pvt.current.name); };

  api.next = function (currentPost, allPosts) { return pvt.current.next(currentPost, allPosts); };

  return api;
}();

var settings = function () {
  var api = {};
  var pvt = {
    lastHover: 0,
    isIconDisplayed: false,
    areOptionsDisplayed: false,
    list: [timeRangeSetting, sortOrderSetting]
  };

  api.initialize = function () {
    _(pvt.list).each(function (setting) {
      setting.load();
    });
    homePage.bindToMouseMovement(pvt.mouseMovement);
    postsList.onchange(api.fillPostsCount);
  }

  pvt.mouseMovement = function () {
    if (pvt.isIconDisplayed) { return; }
    pvt.isIconDisplayed = true;
    pvt.showSettingsIcon();
  };

  api.fillPostsCount = function () {
    wallPage.setPostsCountLabel(postsList.validPosts().length);
  };

  pvt.settingsIconHover = function () {
    if (pvt.areOptionsDisplayed) {
      pvt.moreTime();
      return;
    }
    pvt.areOptionsDisplayed = true;
    wallPage.showSettingsOptions(function () {
      api.fillPostsCount();

      _(pvt.list).each(function (setting) {
        setting.fillPage();
        setting.bindEvents();
      });

      wallPage.setShouldFetchLocationBasedTweets(postsList.shouldShowLocationBasedTweets());
      wallPage.setShouldFetchLocationBasedInstagramPics(postsList.shouldShowLocationBasedInstagramPics());
      wallPage.setShouldFetchLocationBasedFlickrPics(postsList.shouldShowLocationBasedFlickrPics());
      wallPage.prepareLocationBasedUpdatesDistanceRangeSlider(postsList.currentLocationBasedUpdatesDistanceRange(), 20, 10000, function (range) {
        wallPage.setCurrentLocationBasedUpdatesDistanceRangeLabel(range);
        postsList.setCurrentLocationBasedUpdatesDistanceRange(range);
        api.fillPostsCount();
      });
      wallPage.bindToFetchLocationBasedTweetsButton(function (value) {
        postsList.setShouldFetchLocationBasedTweets(value);
        api.fillPostsCount();
      });
      wallPage.bindToFetchLocationBasedInstagramPicsButton(function (value) {
        postsList.setShouldFetchLocationBasedInstagramPics(value);
        api.fillPostsCount();
      });
      wallPage.bindToFetchLocationBasedFlickrPicsButton(function (value) {
        postsList.setShouldFetchLocationBasedFlickrPics(value);
        api.fillPostsCount();
      });
    });
    pvt.moreTime();
  };

  pvt.showSettingsIcon = function () {
    wallPage.showSettingsIcon(function () { wallPage.bindToSettingsIconHover(pvt.settingsIconHover); });
    pvt.moreTime();
  };

  pvt.moreTime = function () {
    pvt.lastHover = new Date().getTime();
    setTimeout(function () {
      if ((new Date().getTime() - pvt.lastHover) >= 5000) {
        wallPage.hideSettings();
        pvt.isIconDisplayed = false;
        pvt.areOptionsDisplayed = false;
      }
    }, 5000);
  };

  return api;
}();
