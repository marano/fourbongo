function slideShow(container) {
  var self = {};

  var currentDiv = undefined;
  var slideWindow = $('<div>', {id:'slideWindow'}).css('overflow', 'hidden').css('width', '100%').css('height', '100%');

  self.slide = function (content, callback) {
    var nextDiv = $('<div>').css('margin-left', -slideWindow.width()).append(content);
    slideWindow.prepend(nextDiv);

    var finishSliding = function () {
      if (callback != undefined) { callback(); };

      if (currentDiv != undefined) {
        currentDiv.animate({'margin-left' : slideWindow.width()}, {easing: 'easeOutQuint', duration: 1000, queue: false, complete : function () {
          $(this).remove();
        } });
      }

      nextDiv.animate({'margin-left' : 0}, {easing: 'easeOutQuint', duration: 1000});
      currentDiv = nextDiv;
    };

    var images = nextDiv.find('img');
    var currentImageLoadCount = 0;
    if (images.length > 0) {
      images.load(function () {
        currentImageLoadCount = currentImageLoadCount + 1;
        if (currentImageLoadCount == images.length) {
          finishSliding();
        }
      }).error(function () {
        currentImageLoadCount = currentImageLoadCount + 1;
        if (currentImageLoadCount == images.length) {
          finishSliding();
        }
      });
    } else {
      finishSliding();
    }
  };

  container.append(slideWindow);

  return self;
}
