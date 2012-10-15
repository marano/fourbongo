function slideShow(container) {
  var self = {};

  var currentDiv = undefined;
  var slideWindow = $('<div>', {id:'slideWindow'}).css('overflow', 'hidden').css('width', '100%').css('height', '100%');

  self.slide = function (content, callback) {
    var nextDiv = $('<div>').css('margin-left', -slideWindow.width()).append(content);
    slideWindow.prepend(nextDiv);
    setTimeout(function () {
      if (callback != undefined) { callback(); };

      if (currentDiv != undefined) {
        currentDiv.animate({'margin-left' : slideWindow.width()}, {easing: 'easeOutQuint', duration: 1000, queue: false, complete : function () {
          $(this).remove();
        } });
      }

      nextDiv.animate({'margin-left' : 0}, {easing: 'easeOutQuint', duration: 1000});
      currentDiv = nextDiv;
    }, 1000);
  };

  container.append(slideWindow);

  return self;
}
