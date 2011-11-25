var home = function () {
    var api = {};

    var pvt = {
      latitude: null,
      longitude: null,
      geolocationFetched: false
    };

    api.initialize = function () {
      homePage.showTitle();
      foursquare.initialize();
      postsList.initialize();
      settings.initialize();
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
      if (window.location.hash != '') {
        var venueId = window.location.hash.replace('#', '')
        pvt.startShow(venueId);
      } else {
        homePage.buildSearchMenu(pvt.prepareSearchMenu);
      }
    };

    pvt.prepareSearchMenu = function () {
      pvt.queryGeolocation();
      homePage.bindSearchForm(pvt.search);
      homePage.bindFacebookLoginButton(facebook.login);
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

    pvt.search = function () {
      homePage.prepareToSearch();
      var name = homePage.searchNameInputValue();
      if (name == null || name == '') {
        pvt.searchNearbyVenues();
        return;
      } else {
        var city = homePage.searchCityInputValue();
        if (name == null || name == '' || city == null || city == '') {
          name = '_';
          city = '_';
        }
        foursquare.search_venues_by_name_and_city(name, city, function (venues) {
          homePage.showSearchResult(venues, pvt.startShow);
        });
      }
    };

    pvt.startShow = function (venueId) { homePage.slideContainer(function () { wall.initialize(venueId); }); };

    return api;
}();

$(document).ready(function () { home.initialize(); });
