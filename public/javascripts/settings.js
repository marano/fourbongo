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

  pvt.settingsIconHover = function () {
    if (pvt.areOptionsDisplayed) {
      pvt.moreTime();
      return;
    }
    pvt.areOptionsDisplayed = true;
    page.showSettingsOptions(function () {
      page.selectSortOrder(postsList.currentSortOrderName());
      page.bindToSortByRandomButton(postsList.setSortOrderByName);
      page.bindToSortByPublicationButton(postsList.setSortOrderByName);
    });
    pvt.moreTime();
  };

  pvt.showSettingsIcon = function () {
    page.showSettingsIcon(function () { page.bindToSettingsIconHover(pvt.settingsIconHover); });
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
