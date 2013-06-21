var home = function () {
  var api = {};

  var pvt = {
    latitude: null,
    longitude: null,
    geolocationFetched: false,
  };

  function tagsSelected(showSearchMenuFieldsCallback) {
    showSearchMenuFieldsCallback();
  }

  function locationSelected(showSearchMenuFieldsCallback) {
    if (foursquareNetwork.isAuthenticated()) {
      showSearchMenuFieldsCallback();
    } else {
      homePage.buildFoursquareAuthenticationMenu(foursquareNetwork.login);
    }
  }

  api.initialize = function () {
    homePage.showTitle();

    if (hasSearchByTagHash()) {
      startSearchByTagFromHash();
    } else if (hasSearchByLocationHash()) {
      startSearchByLocationFromHash();
    } else {
      buildMenu();
    }
  };

  function buildMenu() {
    homePage.buildHomeMenu(function (searchByLocationTab, searchByTagTab) {
      pvt.prepareSearchMenu();
      if (foursquareNetwork.isFoursquareCallback()) {
        searchByLocationTab.initialSelected();
      } else {
        searchByTagTab.initialSelected();
      }
    }, locationSelected, tagsSelected);
  }

  function hasSearchByTagHash() {
    var hash = window.location.hash;
    return hash && hash.indexOf('tag=') != -1;
  }

  function hasSearchByLocationHash() {
    var hash = window.location.hash;
    return hash && hash.indexOf('venueId=') != -1;
  }

  function startSearchByTagFromHash() {
    var tags = window.location.hash.replace('#tag=', '');
    pvt.startTagShow(tags);
  }

  function startSearchByLocationFromHash() {
    var venueId = window.location.hash.replace('#venueId=', '');
    pvt.startShow(venueId);
  }

  pvt.prepareSearchMenu = function () {
    pvt.queryGeolocation();
    homePage.bindSearchForm(pvt.search, pvt.searchByTag);
  };

  pvt.queryGeolocation = function () {
    geolocation.fetch(function (latitude, longitude) {
      pvt.latitude = latitude;
      pvt.longitude = longitude;
      pvt.geolocationFetched = true;
      geolocation.city(latitude, longitude, function (city) {
        if (homePage.searchCityInputValue() == null || homePage.searchCityInputValue()  == '') {
          homePage.setSearchCityInputValue(city);
        }
      });
    });
  };

  pvt.searchNearbyVenues = function () {
    if (!pvt.geolocationFetched) { return; }
    homePage.prepareToSearch();
    foursquare.search_venues_by_location(pvt.latitude, pvt.longitude, function (venues) {
      homePage.showSearchResult(venues, pvt.startShow);
    });
  };

  pvt.search = function (name, city) {
    homePage.prepareToSearch();
    if (name == null || name == '') {
      pvt.searchNearbyVenues();
      return;
    } else {
      if (name == null || name == '' || city == null || city == '') {
        name = '_';
        city = '_';
      }
      foursquare.search_venues_by_name_and_city(name, city, function (venues) {
        homePage.showSearchResult(venues, pvt.startShow);
      });
    }
  };

  pvt.searchByTag = function (tags) {
    homePage.hideSearchResult();
    pvt.startTagShow(tags);
  };

  pvt.startShow = function (venueId) {
    homePage.slideContainer(function () {
      foursquare.venue(venueId, function (venue) {
        Visualization(LocationSearchStrategy(venue)).start();
      });
    });
  };

  pvt.startTagShow = function (tags) {
    homePage.slideContainer(function () {
      Visualization(TagSearchStrategy(tags)).start();
    });
  };

  return api;
}();
