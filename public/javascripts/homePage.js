var searchTab = function (type, otherTab) {
  var api = {
    otherTab: otherTab
  };
  var pvt = {
    tab: $($('#searchBy' + type + 'Tab')[0]),
    tabLink: $($('#searchBy' + type + 'TabLink')[0]),
  };

  api.selected = function () {
    pvt.tab.css('zoom', '100%');
    pvt.tab.css('z-index', '1');
    pvt.tab.css('pointer-events', 'none');
    pvt.tabLink.addClass('selectedSearchTabLink');
    pvt.tabLink.removeClass('disabledSearchTabLink');
  };

  api.notSelected = function () {
    pvt.tab.css('opacity', '0.7');
    pvt.tab.css('top', '1px');
    pvt.tab.css('zoom', '98%');
    pvt.tab.css('z-index', '0');
    pvt.tab.removeClass('selectedSearchTab');
    pvt.tabLink.removeClass('selectedSearchTabLink');
    pvt.tabLink.addClass('disabledSearchTabLink');
  };

  api.addEvents = function () {
    pvt.tab.on('mouseenter', '.disabledSearchTabLink', pvt.mouseenter);
    pvt.tab.on('mouseout', '.disabledSearchTabLink', pvt.mouseout);
    pvt.tab.on('click', '.disabledSearchTabLink', pvt.click);
  };

  pvt.mouseenter = function () {
    pvt.tab.animate({'opacity' : '0.85', 'top' : '-10px'}, {easing: 'easeInQuint', duration: 80});
  };

  pvt.mouseout = function () {
    pvt.tab.animate({'opacity' : '0.7', 'top' : '1px'}, {easing: 'easeInQuint', duration: 80});
  };

  api.zoomOut1 = function () {
    pvt.tab.animate({'opacity' : '0.95', 'zoom' : '99%'}, {easing: 'easeInQuint', duration: 80});
  }

  api.zoomOut2 = function (callback) {
    pvt.tab.animate({'opacity' : '0.7', 'top' : '1px', 'zoom' : '98%'}, {easing: 'easeInQuint', duration: 80, complete: callback});
  }

  api.goBehind = function () { pvt.tab.css('z-index', '0'); }

  pvt.click = function () {
    homePage.hideSearchResult();
    api.otherTab.zoomOut1();
    pvt.tab.animate({'opacity' : '0.95', 'top' : '-30px', 'zoom' : '99%'}, {easing: 'easeInQuint', duration: 80, complete: function () {
      pvt.tab.css('z-index', '1');
      api.otherTab.goBehind();
      api.otherTab.zoomOut2(api.otherTab.notSelected);
      pvt.tab.animate({'opacity' : '1', 'top' : '0', 'zoom' : '100%'}, {easing: 'easeOutBounce', duration: 160, complete: function () {
        api.selected();
      }});
    }});
  }

  return api;
};

var homePage = function () {
  api = {};
  pvt = { thereIsASearchResult: false };

  api.bindToMouseMovement = function (callback) {
    $('body').mousemove(callback);
    $('body').bind('touchstart', callback);
    $('body').bind('touchmove', callback);
  };

  api.bindSearchForm = function (searchCallback, searchByTagCallback) {
    $("#searchForm").submit(function (event) {
      event.preventDefault();
      searchCallbak($('#inputSearchName').val(), $('#inputSearchCity').val());
    });
    $("#searchByTagForm").submit(function (event) {
      event.preventDefault();
      searchByTagCallback($('#inputSearchTag').val());
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

  api.searchCityInputValue = function () { return $('#inputSearchCity').val(); };

  api.setSearchCityInputValue = function (value) { $('#inputSearchCity').attr('value', value); };

  api.showTitle = function () { pvt.smoothShow('#title'); };

  pvt.showBar = function () { pvt.smoothShow('#homeBar'); };

  pvt.hideBar = function (callback) {
    var elementOpacity = $('#homeBar').css('opacity');
    $('#homeBar').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () {
      $('#homeBar').hide().css('opacity', elementOpacity);
      callback();
    }});
  };

  pvt.smoothShow = function (element) {
    var elementOpacity = $(element).css('opacity');
    $(element).css('opacity', '.0').show().animate({'opacity': elementOpacity}, {easing: 'easeOutQuint', duration: 1000});
  };

  api.buildSearchMenu = function (callback) {
    $.get('/search_menu', function (html) {
      $('#homeBar').append(html);

      var searchByLocationTab = searchTab('Location');
      var searchByTagTab = searchTab('Tag');

      searchByLocationTab.otherTab = searchByTagTab;
      searchByTagTab.otherTab = searchByLocationTab;

      searchByLocationTab.selected();
      searchByTagTab.notSelected();

      searchByLocationTab.addEvents();
      searchByTagTab.addEvents();

      pvt.showBar();
      callback();
    });
  };

  api.buildFoursquareAuthenticationMenu = function (callback) {
    $.get('/foursquare/authentication_menu', function (html) {
      $('#homeBar').append(html);
      pvt.showBar();
      callback();
    });
  };

  api.buildFacebookAuthenticationMenu = function (callback) {
    $.get('/facebook/authentication_menu', function (html) {
      $('#homeBar').append(html);
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
    api.hideSearchResult();
  };

  api.hideSearchResult = function () {
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
