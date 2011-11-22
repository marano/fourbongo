var settings = function () {
  var api = {};
  var pvt = {
    lastHover: 0,
    isIconDisplayed: false,
    areOptionsDisplayed: false
  };

  api.initialize = function () { page.bindToWallHover(pvt.wallHover); }

  pvt.wallHover = function () {
    if (pvt.isIconDisplayed) { return; }
    pvt.isIconDisplayed = true;
    pvt.showSettingsIcon();
  };

  pvt.optionsHover = function () {
    if (pvt.areOptionsDisplayed) {
      pvt.moreTime();
      return;
    }
    pvt.areOptionsDisplayed = true;
    page.showSettingsOptions(function () {
      page.selectSortOrder(postsList.currentSortOrder());
      page.bindToSortByRandomButton(postsList.sortByRandom);
      page.bindToSortByPublicationButton(postsList.sortByPublication);
    });
    pvt.moreTime();
  };

  pvt.showSettingsIcon = function () {
    page.showSettingsIcon();
    page.bindToSettingsHover(pvt.optionsHover);
    pvt.moreTime();
  };

  pvt.moreTime = function () {
    pvt.lastHover = new Date().getTime();
    setTimeout(function () {
      if ((new Date().getTime() - pvt.lastHover) >= 5000) {
        page.hideSettings();
        pvt.isIconDisplayed = false;
        pvt.areOptionsDisplayed = false;
      }
    }, 5000);
  };

  return api;
}();
