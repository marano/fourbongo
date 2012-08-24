var home = function () {
    var api = {};

    var pvt = {
      latitude: null,
      longitude: null,
      geolocationFetched: false,
      settings: settings
    };

    api.initialize = function () {
      homePage.showTitle();
      foursquare.initialize();
      facebook.initialize(function () {
        if (!foursquare.isAuthenticated()) {
          homePage.buildFoursquareAuthenticationMenu(function () {
            homePage.bindFoursquareLoginButton(foursquare.login);
          });
        } else if (!facebook.isAuthenticated()) {
          homePage.buildFacebookAuthenticationMenu(function () {
            homePage.bindFacebookLoginButton(function () {
              facebook.login(function () {
                homePage.hideFabookAuthenticationMenu(pvt.initializeFourbongo);
              });
            });
          });
        } else {
          pvt.initializeFourbongo();
        }
      });
    };

    pvt.initializeFourbongo = function () {
      var hash = window.location.hash;
      if (!hash) {
        homePage.buildSearchMenu(pvt.prepareSearchMenu);
      } else {
        if (hash.indexOf('venueId=') != -1) {
          var venueId = hash.replace('#venueId=', '');
          pvt.startShow(venueId);
        } else {
          var tag = hash.replace('#tag=', '');
          pvt.startTagShow(tag);
        }
      }
    };

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

    pvt.searchByTag = function (tag) {
      homePage.prepareToSearch();
      if (!tag) {
        return;
      }

      pvt.startTagShow(tag);
    };

    pvt.startShow = function (venueId) { homePage.slideContainer(function () { wall(venueId, pvt.settings); }); };

    pvt.startTagShow = function (tag) { homePage.slideContainer(function () { tagWall(tag, pvt.settings); }); };

    return api;
}();

$(document).ready(function () { home.initialize(); });
