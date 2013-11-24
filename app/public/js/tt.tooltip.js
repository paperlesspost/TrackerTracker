var TT = TT || {};
TT.Tooltip = (function () {

  var pub = {};

  var self = {
    active: false,
    tooltip: null,
    target: null
  };

  function setPosition() {
    var offset = self.target.offset();
    var left = offset.left + (self.target.outerWidth() / 2) - (self.tooltip.outerWidth() / 2);
    var top = offset.top - self.target.outerHeight() - self.tooltip.outerHeight();

    self.tooltip.css({
      left: Math.max(10, Math.min($(window).width() - 10 - self.tooltip.outerWidth(), left)),
      top: Math.max(10, Math.min($(window).height() - 10 - self.tooltip.outerHeight(), top))
    });

    self.tooltip.find('.tooltip-arrow').css({
      left: (self.tooltip.outerWidth() / 2) - 9
    });
  }

  function setClosingBoundaries() {
    TT.Utils.setBoundaryCallback(self.target, function () {
      clearTimeout(self.timeout);
      self.tooltip.fadeOut(60, function () {
        self.tooltip.remove();
        self.active = false;
        self.tooltip = null;
      });
    });
  }

  pub.isActive = function () {
    return self.active;
  };

  pub.open = function (options) {
    if (!self.active) {
      self.active = true;
      self.target = $(options.target);
      self.tooltip = TT.View.attach(TT.View.render('tooltip', { html: options.html }), 'body').hide();
      setPosition();
      setClosingBoundaries();
      self.timeout = setTimeout(function () {
        self.tooltip.fadeIn(60);
      }, options.delay || 0);
    }
  };

  pub.init = function () {
    var timeoutID;
    $('body').mousemove(function (e) {
      clearTimeout(timeoutID);
      timeoutID = setTimeout(function () {
        var target = $(e.target);
        target = target.closest('[data-tooltip]');

        var text = target.data('tooltip');
        if (text) {
          pub.open({
            target: target,
            delay: target.data('tooltip-delay') || 400,
            html: TT.View.render('tooltipContents', {
              title: text,
              description: target.data('tooltip-description') || ''
            })
          });
        }
      }, 50);
    });
  };

  return pub;

}());
