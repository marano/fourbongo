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

var settings = function () {
  var api = {};
  var pvt = {
    lastHover: 0,
    isIconDisplayed: false,
    areOptionsDisplayed: false
  };

  api.initialize = function () { homePage.bindToMouseMovement(pvt.mouseMovement); }

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
    wallPage.showSettingsOptions(function () {
      wallPage.selectSortOrder(postsList.currentSortOrderName());
      wallPage.setShouldFetchLocationBasedTweets(postsList.shouldShowLocationBasedTweets());
      wallPage.prepareTimeRangeSlider(postsList.currentTimeRange(), timeRanges.length, function (timeRange) {
        var timeRange = timeRanges[timeRange];
        wallPage.setCurrentTimeRangeLabel(timeRange);
        postsList.setCurrentTimeRange(timeRange);
      });
      wallPage.prepareLocationBasedTweetsDistanceRangeSlider(postsList.currentLocationBasedTweetsDistanceRange(), 20, 2000, function (range) {
        wallPage.setCurrentLocationBasedTweetDistanceRangeLabel(range);
        postsList.setCurrentLocationBasedTweetDistanceRange(range);
      });
      wallPage.bindToSortByRandomButton(postsList.setSortOrderByName);
      wallPage.bindToSortByPublicationButton(postsList.setSortOrderByName);
      wallPage.bindToFetchLocationBasedTweetsButton(postsList.setShouldFetchLocationBasedTweets);
    });
    pvt.moreTime();
  };

  pvt.showSettingsIcon = function () {
    wallPage.showSettingsIcon(function () { wallPage.bindToSettingsIconHover(pvt.settingsIconHover); });
    pvt.moreTime();
  };

  api.timeRangeChanged = function (value) {
    var currentRange = timeRanges[value];
    wallPage.setCurrentTimeRangeLabel(currentRange);
    postsList.setCurrentTimeRange(currentRange);
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
