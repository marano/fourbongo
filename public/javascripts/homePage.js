var homePage = function () {
  api = {};
  pvt = { thereIsASearchResult: false };

  api.bindToMouseMovement = function (callback) {
    $('body').mousemove(callback);
    $('body').touchstart(callback);
    $('body').touchmove(callback);
  };

  api.bindSearchForm = function (callback) {
    $("#searchForm").submit(function (event) {
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
      _(venues).each(function (venue) {
        var link = $('<a>').attr('href', '#' + venue.foursquare_id).attr('class', 'searchResultItemLink');
        link.click(function (event) { callback(venue.foursquare_id); });
        var div = $('<div class="searchResultItem">');
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
