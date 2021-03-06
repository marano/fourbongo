var searchTab = function (type, setupCallback) {
  var api = {
    otherTab: undefined
  };

  var pvt = {
    tab: $($('#searchBy' + type + 'Tab')[0]),
    tabLink: $($('#searchBy' + type + 'TabLink')[0]),
    wasClicked: false
  };

  function initialize() {
    pvt.tab.find('.bar').css('opacity', '0').css('display', 'none');
    pvt.tab.find('#searchMenuFields').css('opacity', '0').css('display', 'none');
    pvt.tabLink.addClass('initialSelectionTabLink');
    pvt.tabLink.on('click', api.initialSelected);
  }

  api.initialSelected = function () {
    pvt.tabLink.removeClass('initialSelectionTabLink');
    pvt.tabLink.off('click');
    pvt.selected();
    api.otherTab.notInitialSelected();
    pvt.tab.find('.bar').css('display', 'block').animate({opacity: '1'}, {easing: 'easeOutBounce', duration: 80, complete: function () {
      setupMenu();
      pvt.tab.find('input').eq(0).focus();
    }});
  };

  function setupMenu() {
    pvt.addEvents();
    setupCallback(showSearhMenuFields);
  }

  function showSearhMenuFields() {
    pvt.tab.find('#searchMenuFields').css('display', 'block').css('opacity', '1');
  }

  api.notInitialSelected = function () {
    pvt.tabLink.removeClass('initialSelectionTabLink');
    pvt.tabLink.off('click');
    pvt.tab.find('.bar').css('display', 'block').animate({opacity: '1'}, {easing: 'easeOutBounce', duration: 80});
    api.zoomOut2(function () {
      api.notSelected();
      setupMenu();
    });
  };

  pvt.selected = function () {
    pvt.tab.css('zoom', '100%');
    pvt.tab.css('z-index', '1');
    pvt.tab.css('pointer-events', 'none');
    pvt.tabLink.addClass('selectedSearchTabLink');
    pvt.tabLink.removeClass('disabledSearchTabLink');
    pvt.wasClicked = false;
    pvt.tab.find('input').eq(0).focus();
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

  pvt.addEvents = function () {
    pvt.tab.on('mouseenter', '.disabledSearchTabLink', pvt.mouseenter);
    pvt.tab.on('mouseout', '.disabledSearchTabLink', pvt.mouseout);
    pvt.tab.on('click', '.disabledSearchTabLink', pvt.click);
  };

  pvt.mouseenter = function () {
    if (pvt.wasClicked) {
      return;
    }
    pvt.tab.animate({'opacity' : '0.85', 'top' : '-10px'}, {easing: 'easeInQuint', duration: 80});
  };

  pvt.mouseout = function () {
    if (pvt.wasClicked) {
      return;
    }
    pvt.tab.animate({'opacity' : '0.7', 'top' : '1px'}, {easing: 'easeInQuint', duration: 80});
  };

  api.zoomOut1 = function () {
    pvt.tab.animate({'opacity' : '0.95', 'margin-left' : '5px', 'zoom' : '99%'}, {easing: 'easeInQuint', duration: 80});
  }

  api.zoomOut2 = function (callback) {
    pvt.tab.animate({'opacity' : '0.7', 'margin-left' : '10px', 'top' : '1px', 'zoom' : '98%'}, {easing: 'easeInQuint', duration: 80, complete: callback});
  }

  api.goBehind = function () { pvt.tab.css('z-index', '0'); }

  pvt.click = function () {
    if (pvt.wasClicked) {
      return;
    }
    pvt.wasClicked = true;
    homePage.hideSearchResult();
    api.otherTab.zoomOut1();
    pvt.tab.animate({'opacity' : '0.95', 'margin-left' : '5px', 'top' : '-30px', 'zoom' : '99%'}, {easing: 'easeInQuint', duration: 80, complete: function () {
      pvt.tab.css('z-index', '1');
      api.otherTab.goBehind();
      api.otherTab.zoomOut2(api.otherTab.notSelected);
      pvt.tab.animate({'opacity' : '1', 'margin-left' : '0px', 'top' : '0', 'zoom' : '100%'}, {easing: 'easeOutBounce', duration: 160, complete: function () {
        pvt.selected();
      }});
    }});
  }

  initialize();

  return api;
};

var homePage = function () {
  var api = {};
  var pvt = { thereIsASearchResult: false };

  api.bindSearchForm = function (searchCallback, searchByTagCallback) {
    $("#searchForm").submit(function (event) {
      event.preventDefault();
      searchCallback($('#inputSearchName').val(), $('#inputSearchCity').val());
    });
    $("#searchByTagForm").submit(function (event) {
      event.preventDefault();
      var tags = $('#inputSearchTag').val();
      if (tags === '') {
        tags = $('#inputSearchTag').attr('placeholder');
      }
      searchByTagCallback(tags);
    });
  };

  api.bindFacebookLoginButton = function (callback) {
    $("#facebookLogin").click(function (event) {
      event.preventDefault();
      callback();
    });
  };

  pvt.bindFoursquareLoginButton = function (callback) {
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

  pvt.showHomeMenu = function () { pvt.smoothShow('#homeMenu'); };

  pvt.hideBar = function (callback) {
    var elementOpacity = $('#homeMenu').css('opacity');
    $('#homeMenu').animate({'opacity' : '.0'}, {easing: 'easeOutQuint', duration: 1000, complete: function () {
      $('#homeMenu').hide().css('opacity', elementOpacity);
      callback();
    }});
  };

  pvt.smoothShow = function (element) {
    var elementOpacity = $(element).css('opacity');
    $(element).css('opacity', '.0').show().animate({'opacity': elementOpacity}, {easing: 'easeOutQuint', duration: 1000});
  };

  api.buildHomeMenu = function (callback, locationSelectionCallback, tagsSelectionCallback) {
    var searchByLocationTab = searchTab('Location', locationSelectionCallback);
    var searchByTagTab = searchTab('Tag', tagsSelectionCallback);

    searchByLocationTab.otherTab = searchByTagTab;
    searchByTagTab.otherTab = searchByLocationTab;

    pvt.showHomeMenu();
    callback(searchByLocationTab, searchByTagTab);
  }

  api.buildFoursquareAuthenticationMenu = function (loginButtonCallback) {
    $.get('/foursquare/authentication_menu', function (html) {
      $('#searchByLocationTab').find('.bar').append(html);
      pvt.bindFoursquareLoginButton(loginButtonCallback);
    });
  };

  api.buildFacebookAuthenticationMenu = function (callback) {
    $.get('/facebook/authentication_menu', function (html) {
      $('#homeMenu').append(html);
      pvt.showHomeMenu();
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
        link.click(function (event) {
          event.preventDefault();
          callback(venue.foursquare_id);
        });

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
