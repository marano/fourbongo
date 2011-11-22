var facebook = function () {
 var api = {};
 var pvt = {authenticated: null}

  api.initialize = function (callback) {
    $('body').append($('<div>', {id: 'fb-root'}));

    window.fbAsyncInit = function() {
      FB.init({
        appId      : '101544976563660', // App ID
        channelURL : '//fourbongo.com/channel.html', // Channel File
        status     : true, // check login status
        cookie     : true, // enable cookies to allow the server to access the session
        oauth      : true, // enable OAuth 2.0
        xfbml      : true  // parse XFBML
      });
      
      FB.getLoginStatus(function(response) {
        if (response.authResponse) { pvt.authenticated = true; }
        callback();
      });
    };
 
    var js, id = 'facebook-jssdk';
    if (document.getElementById(id)) {return;}
    js = document.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/en_US/all.js";
    document.getElementsByTagName('head')[0].appendChild(js);
  };

 api.login = function (callback) {
   FB.login(function (response) {
     if (response.authResponse) {
       api.accessToken = response.authResponse.accessToken;
       pvt.authenticated = true;
       callback();
     }
   });
 };

  api.updates = function (userId, callback) {
    FB.api(userId + '/feed', function (data) {
      var updates = _(data.data).map(function (update) { return FacebookUpdate({id: update.id, userId: userId, username: update.from.name, content: update.message}); });
      callback(updates);
    });
  };

  api.isAuthenticated = function () { return pvt.authenticated; };

  return api;
}();

var geolocation = function () {
  var api = {};

  api.fetch = function (callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
      callback(position.coords.latitude, position.coords.longitude);
    });
  };

  api.city = function (latitude, longitude, callback) {
    navigator.geolocation.getCurrentPosition(function (position) {
      $.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude + '&addressdetails=1', function (data) {
        callback(data.address.city);
      });
    });
  };
  
  return api;
}();

var homePage = function () {
  api = {};
  pvt = { thereIsASearchResult: false };

  api.disableSearchNearbyButton = function () { $("#btnSearchNearby").attr("disabled", true); };

  api.enableSearchNearbyButton = function () { $("#btnSearchNearby").attr("disabled", false); };

  api.bindSearchNearbyButton = function (callback) {
    $("#searchNearby").submit(function (event) {
      event.preventDefault();
      callback();
    });
  };

  api.bindSearchByNameAndCityButton = function (callback) {
    $("#searchByNameAndCity").submit(function (event) {
      event.preventDefault();
      callback();
    });
  };

  api.bindFacebookLoginButton = function (callback) {
    $("#facebookLogin").click(function (event) {
      event.preventDefault();
      callback();
    });
  };

  api.bindFoursquareLoginButton = function (callback) {
    $("#foursquareLogin").click(function (event) {
      event.preventDefault();
      callback();
    });
  };

  api.slideContainer = function (callback) {
    $('#homeOuterContainer').css('overflow', 'hidden');
    $('#homeContainer').animate({left : $(window).width()}, {easing: 'easieEaseInQuint', duration: 1000, complete : function () {
      $('#homeOuterContainer').remove();
      callback();
    }});
  };

  api.searchNameInputValue = function () { return $('#inputSearchName').val(); };

  api.searchCityInputValue = function () { return $('#inputSearchCity').val(); };

  api.setSearchCityInputValue = function (value) { $('#inputSearchCity').attr('value', value); };

  api.showTitle = function () { pvt.smoothShow('#title'); };

  pvt.showBar = function () { pvt.smoothShow('#bar'); };

  pvt.hideBar = function (callback) {
    var elementOpacity = $('#bar').css('opacity');
    $('#bar').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () {
      $('#bar').hide().css('opacity', elementOpacity);
      callback();
    }});
  };

  pvt.smoothShow = function (element) {
    var elementOpacity = $(element).css('opacity');
    $(element).css('opacity', '.0').show().animate({'opacity': elementOpacity}, {easing: 'easeOutQuint', duration: 1000});
  };

  api.buildSearchMenu = function (callback) {
    $.get('/search_menu', function (html) {
      $('#bar').append(html);
      pvt.showBar();
      callback();
    });
  };

  api.buildFoursquareAuthenticationMenu = function (callback) {
    $.get('/foursquare/authentication_menu', function (html) {
      $('#bar').append(html);
      pvt.showBar();
      callback();
    });
  };

  api.buildFacebookAuthenticationMenu = function (callback) {
    $.get('/facebook/authentication_menu', function (html) {
      $('#bar').append(html);
      pvt.showBar();
      callback();
    });
  };

  api.hideFabookAuthenticationMenu = function (callback) {
    pvt.hideBar(function () {
      $('#facebookAuthenticationMenu').remove();
      callback();
    });
  };

  pvt.buildResultHtml = function (venues, callback) {
    var result = $('<div>');
    if(venues.length > 0) {
      $(venues).each(function (index, venue) {
        var link = $('<a>').attr('href', '#' + venue.foursquare_id).attr('class', 'searchResultItemLink');
        link.click(function (event) {
          callback(venue.foursquare_id);
        });
        var div = $('<div>', {class: 'searchResultItem'});
        var title = $('<span>').attr('class', 'searchResultItemTitle').text(venue.name);
        result.append(link.append(div.append(title)));
      });
    } else {
      result.attr('id', 'no_search_results').text('OMG, no results!');
    }
    return result;
  };

  pvt.showSpinning = function () { $('#spinning').removeClass('hidden'); };

  pvt.hideSpinning = function () { $('#spinning').addClass('hidden'); };

  api.prepareToSearch = function () {
    pvt.showSpinning();
    if(pvt.thereIsASearchResult) {
      resultContainer = $('#searchResultContainer');
      resultContainer.animate({top: -resultContainer.height()}, {easing: 'easeOutBounce', duration: 1000});
    }
  };

  api.showSearchResult = function (venues, callback) {
    pvt.hideSpinning();
    pvt.thereIsASearchResult = true;
    var html = pvt.buildResultHtml(venues, callback);
    resultContainer = $('<div>', {id:'searchResultContainer'}).css('position', 'relative').append(html);
    $('#searchResult').empty().append(resultContainer);
    resultContainer.css('top', -resultContainer.height());
    resultContainer.animate({top: 0}, {easing: 'easeOutBounce', duration: 1000});
  };

  return api;
}();

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
      homePage.disableSearchNearbyButton();
      pvt.queryGeolocation();
      homePage.bindSearchNearbyButton(pvt.searchNearbyVenues);
      homePage.bindSearchByNameAndCityButton(pvt.searchVenuesByNameAndCity);
      homePage.bindFacebookLoginButton(facebook.login);
    };

    pvt.queryGeolocation = function () {
      geolocation.fetch(function (latitude, longitude) {
        pvt.latitude = latitude;
        pvt.longitude = longitude;
        pvt.geolocationFetched = true;
        homePage.enableSearchNearbyButton();
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

    pvt.searchVenuesByNameAndCity = function () {
      homePage.prepareToSearch();
      var name = homePage.searchNameInputValue();
      var city = homePage.searchCityInputValue();
      if (name == null || name == '' || city == null || city == '') {
        name = '_';
        city = '_';
      }
      foursquare.search_venues_by_name_and_city(name, city, function (venues) {
        homePage.showSearchResult(venues, pvt.startShow);
      });
    };

    pvt.startShow = function (venueId) { homePage.slideContainer(function () { wall.initialize(venueId); }); };

    return api;
}();

$(document).ready(function () { home.initialize(); });
