var foursquareSearch = function () {
  var api = {};

  api.search_by_name_and_city = function (name, city, callback) {
    $.getJSON('/venues/search_by_name_and_city/' + encodeURIComponent(name) + '/' + encodeURIComponent(city), callback);
  };

  api.search_by_location = function (latitude, longitude, callback) {
    venues = [];
    $.getJSON('https://api.foursquare.com/v2/venues/search?v=20111117&ll=' + latitude + ',' + longitude + '&radius=1000&intent=browse&limit=50&oauth_token=YN1YTMIQU0S1KLYILLFQNQQIX5WTBZBRWW1Z2YBTLSBMJAR5', function (data) {
      $(data.response.venues).each(function (index, venue) {
        venues.push({foursquare_id: venue.id, name: venue.name});
      });
      callback(venues);
    });
  };

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
  pvt = {
    thereIsASearchResult: false
  };

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

  pvt.slideContainer = function (callback) {
    $('#searchOuterContainer').css('overflow', 'hidden');
    $('#searchContainer').animate({left : $(window).width()}, {easing: 'easieEaseInQuint', duration: 1000, complete : function () {
      $('#searchOuterContainer').remove();
      callback();
    }});
  };

  api.searchNameInputValue = function () { return $('#inputSearchName').val(); };

  api.searchCityInputValue = function () { return $('#inputSearchCity').val(); };

  api.setSearchCityInputValue = function (value) { $('#inputSearchCity').attr('value', value); };

  api.removeContainer = function () {
  };

  pvt.buildResultHtml = function (venues, callback) {
    var result = $('<div>');
    if(venues.length > 0) {
      $(venues).each(function (index, venue) {
        var link = $('<a>').attr('href', '#' + venue.foursquare_id).attr('class', 'searchResultItemLink');
        link.click(function (event) {
          pvt.slideContainer(function () {
            callback(venue);
          });
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
      homePage.disableSearchNearbyButton();
      pvt.queryGeolocation();
      homePage.bindSearchNearbyButton(pvt.searchNearbyVenues);
      homePage.bindSearchByNameAndCityButton(pvt.searchVenuesByNameAndCity);
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
        foursquareSearch.search_by_location(pvt.latitude, pvt.longitude, function (venues) {
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
      foursquareSearch.search_by_name_and_city(name, city, function (venues) {
        homePage.showSearchResult(venues, pvt.startShow);
      });
    };

    pvt.startShow = function (venue) { wall.initialize(venue); };

    return api;
}();

$(document).ready(function () { home.initialize(); });
