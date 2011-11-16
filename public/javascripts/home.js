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

    function nearby() {
        if (!geolocationFetched) {
          return;
        }
        prepareToSearch();
        $.ajax({
            url: '/venues/search/by_location/' + latitude + '/' + longitude,
            success: showSearchResult
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
        $.ajax({
            url: '/venues/search/by_name_and_city/' + encodeURIComponent(name) + '/' + encodeURIComponent(city),
            success: showSearchResult
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

    $("#searchNearby").submit(nearby);
    $("#searchByNameAndCity").submit(search);

    queryGeolocation();
});

