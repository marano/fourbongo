var FoursquareNetwork = function () {
  var api = {};

  api.token = function () {
    return $.cookie('foursquare_access_token');
  };

  api.isAuthenticated = function () {
    return $.cookie('foursquare_authenticated') == 'true';
  };

  api.isFoursquareCallback = function () {
    return $('meta[name=from_foursquare_authentication_callback]').attr('content') == 'true';
  }

  api.login = function () {
    window.location = '/auth/foursquare';
  };

  return api;
}();

var TwitterNetwork = function () {
  var api = {};

  function isAuthenticated() {
    return $.cookie('twitter_authenticated') == 'true';
  }

  api.initialize = function () {
    if (!isAuthenticated()) {
      $('.twitter-icon').addClass('pending-authentication');
      $('.twitter-icon').click(login);
    }
  };

  function login() {
    window.location = '/auth/twitter';
  };

  return api;
}();

var InstagramNetwork = function () {
  var api = {};

  function isAuthenticated() {
    return $.cookie('instagram_authenticated') == 'true';
  }

  api.initialize = function () {
    if (!isAuthenticated()) {
      $('.instagram-icon').addClass('pending-authentication');
      $('.instagram-icon').click(login);
    }
  };

  function login() {
    window.location = '/auth/instagram';
  };

  return api;
}();

var FlickrNetwork = function () {
  var api = {};

  function isAuthenticated() {
    return $.cookie('flickr_authenticated') == 'true';
  }

  api.initialize = function () {
    if (!isAuthenticated()) {
      $('.flickr-icon').addClass('pending-authentication');
      $('.flickr-icon').click(login);
    }
  };

  function login() {
    window.location = '/auth/flickr';
  };

  return api;
}();

var FacebookNetwork = function () {
  var api = {};

  api.initialize = function () {
    facebook.initialize(function () {
      $('.facebook-icon').removeClass('loading-status');
      if (!facebook.isAuthenticated()) {
        $('.facebook-icon').addClass('pending-authentication');
        $('.facebook-icon').click(function () {
          facebook.login(function () {
            $('.facebook-icon').removeClass('pending-authentication');
          });
        });
      }
    });
  };

  return api;
}();

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
    $('<script>', { type: 'text/javascript', src: 'http://maps.google.com/maps/api/js?sensor=false' }).appendTo('head');
    if (FoursquareNetwork.isAuthenticated()) {
      showSearchMenuFieldsCallback();
    } else {
      homePage.buildFoursquareAuthenticationMenu(FoursquareNetwork.login);
    }
  }

  api.initialize = function () {
    TwitterNetwork.initialize();
    InstagramNetwork.initialize();
    FlickrNetwork.initialize();
    InstagramNetwork.initialize();
    FacebookNetwork.initialize();

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
    homePage.buildHomeMenu(function (searchByLocationTab) {
      pvt.prepareSearchMenu();
      if (FoursquareNetwork.isFoursquareCallback()) {
        searchByLocationTab.initialSelected();
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

  pvt.startShow = function (venueId) { homePage.slideContainer(function () { venueWall(venueId); }); };

  pvt.startTagShow = function (tags) { homePage.slideContainer(function () { tagWall(tags); }); };

  return api;
}();
