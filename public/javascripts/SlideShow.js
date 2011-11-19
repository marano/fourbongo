function slideShow(container) {
  var self = {
    nextDivContent : undefined,
    currentDiv : undefined,
    window : $('<div>', {id:'slideWindow'}).css('overflow', 'hidden').css('width', '100%').css('height', '100%')
  };

  self.slide = function (content, callback) {
    self.nextDivContent = content;
    if (self.currentDiv === undefined) {
      self.rollFirst(callback);
    } else {
      self.currentDiv.animate({'margin-left' : self.window.width()}, {easing: 'easeInQuint', duration: 1000, complete : function () { self.rollNext(callback); } });
    }
  };

  self.rollNext = function (callback) {
    self.currentDiv.remove();
    self.rollFirst(callback);
  };

  self.rollFirst = function (callback) {
    self.currentDiv = $('<div>').css('margin-left', -self.window.width());
    self.window.append(self.currentDiv);
    self.currentDiv.append(self.nextDivContent);
    if (callback != undefined) { callback() };
    self.currentDiv.animate({'margin-left' : '0px'}, {easing: 'easeOutQuint', duration: 1000});
  };

  container.append(self.window);

  return self;
}
