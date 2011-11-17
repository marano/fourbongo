var foursquare = function () {
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

$(document).ready(function () {
    var geolocationFetched = false;
    var latitude;
    var longitude;
    var thereIsASearchResult = false;

    function queryGeolocation() {
      navigator.geolocation.getCurrentPosition(function (position) {
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        geolocationFetched = true;
        $("#btnSearchNearby").attr("disabled", false);

        $.getJSON('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude + '&addressdetails=1', function (data) {
          console.log($('#inputSearchCity').attr('value'));
          if ($('#inputSearchCity').attr('value') != null && $('#inputSearchCity').attr('value') != '') {
              return;
          }
          $('#inputSearchCity').attr('value', data.address.city);
        });
      });
    }
    
    function buildResultHtml(venues) {
      var result = $('<div>');
      if(venues.length > 0) {
        $(venues).each(function (index, venue) {
          var link = $('<a>').attr('href', '#').attr('class', 'searchResultItemLink');
          var div = $('<div>').attr('class', 'searchResultItem');
          var title = $('<span>').attr('class', 'searchResultItemTitle').text(venue.name);
          result.append(link.append(div.append(title)));
        });
      } else {
        result.attr('id', 'no_search_results').text('OMG, no results!');
      }
      return result;
    }

    function nearby() {
        if (!geolocationFetched) {
          return;
        }
        prepareToSearch();
        foursquare.search_by_location(latitude, longitude, function (venues) {
          showSearchResult(buildResultHtml(venues));
        });
        return false;
    }

    function search() {
      prepareToSearch();
      var name = $("#inputSearchName").attr('value');
      var city = $("#inputSearchCity").attr('value');
      if (name == null || name == '' || city == null || city == '') {
        name = '_';
        city = '_';
      }
      foursquare.search_by_name_and_city(name, city, function (venues) {
        showSearchResult(buildResultHtml(venues));
      });
      return false;
    }

    function prepareToSearch() {
      $('#spinning').removeClass('hidden');
      if(!thereIsASearchResult) {
        return;
      }
      resultContainer = $('#searchResultContainer');
      resultContainer.animate({top: -resultContainer.height()}, {easing: 'easeOutBounce', duration: 1000});
    }

    function showSearchResult(html) {
      $('#spinning').addClass('hidden');
      thereIsASearchResult = true;
      resultContainer = $('<div>', {id:'searchResultContainer'}).css('position', 'relative').append(html);
      $('#searchResult').empty().append(resultContainer);
      resultContainer.css('top', -resultContainer.height());
      resultContainer.animate({top: 0}, {easing: 'easeOutBounce', duration: 1000});

      $('.searchResultItemLink').each(function (key, linkElement) {
          var link = $(linkElement);
          var href = link.attr('href');
          link.attr('href', '#');
          link.click(function () {
            slideContainer(function () { window.location = href });
            return false;
          });
      });
    }

    function slideContainer(callback) {
      $('#outerContainer').css('overflow', 'hidden');
      $('#container').animate({left : $(window).width()}, {easing: 'easieEaseInQuint', duration: 1000, complete : callback });
    }

    $("#btnSearchNearby").attr("disabled", 'true');

    $("#searchNearby").submit(function (event) {
      event.preventDefault();
      nearby();
    });
    $("#searchByNameAndCity").submit(function (event) {
      event.preventDefault();
      search();
    });

    queryGeolocation();
});

