var TT = TT || {};
TT.Autocomplete = (function () {

  var pub = {};

  pub.defaults = {
    applyOnClick: true,
    closeOnInputBlur: true,
    closeOnApply: true,
    maxHeight: 240,
    noActive: false
  };
  pub.options = {};

  pub.target = null;
  pub.input = null;
  pub.hasMouse = false;
  pub.closeOnLeave = false;

  pub.onInputBlur = function () {
    if (pub.hasMouse) {
      pub.closeOnLeave = true;
    } else if (pub.options.closeOnInputBlur) {
      pub.close();
    }
  };

  pub.open = function (options) {
    pub.close();

    pub.options = $.extend({}, pub.defaults, options);

    pub.hasMouse = false;
    pub.closeOnLeave = false;

    var data = {
      className: pub.options.className,
      items: pub.options.items,
      applyOnClick: pub.options.applyOnClick
    };

    var html = TT.View.render('autocomplete', data);
    TT.View.attach(html, 'body');

    pub.target = $(options.target);

    if (pub.options.showInput) {
      pub.input = $('#autocomplete-input').show().focus();
      if (pub.options.value) {
        pub.input.val(pub.options.value);
      }
    } else {
      if (pub.options.noActive) {
        $('#autocomplete-input').show().css({ position: 'absolute', top: '-9999px' }).focus().blur(pub.onInputBlur);
      }
      pub.input = pub.target;
    }

    if (!pub.options.noActive) {
      var inputVal = pub.input.val();
      var active = $('#autocomplete .item').filter(function () {
        return $(this).data('value') === inputVal || $(this).text() === inputVal;
      });
      if (active.length) {
        pub.setActive(active);
      } else {
        pub.setActive();
      }
    }

    pub.input.keyup(pub.onKeyUp).blur(pub.onInputBlur);

    pub.setPosition(options.css);
    pub.setScrollTop();

    $('#autocomplete').mouseenter(function () {
      clearTimeout(pub.closeTimeout);
      pub.hasMouse = true;
    }).mouseleave(function () {
      if (pub.closeOnLeave) {
        pub.close();
      } else if (!pub.options.closeOnInputBlur) {
        pub.closeTimeout = setTimeout(pub.close, 500);
      }
      pub.hasMouse = false;
    });
  };

  pub.filter = function () {
    var value = pub.input.val().toLowerCase();

    if (value) {
      $('#autocomplete .item').show().filter(function () {
        return $(this).data('value').toLowerCase().indexOf(value) === -1;
      }).hide();
    } else {
      $('#autocomplete .item').show();
    }

    pub.setActive();
  };

  pub.close = function () {
    $('#autocomplete').remove();
    if (pub.input) {
      pub.input.unbind('keyup blur');
      pub.input = null;
    }

    $('body').unbind('.TT.Autocomplete');

    return false;
  };

  function getNextElement(defaultFn, fallbackFn) {
    var element = $('#autocomplete .item.active')[defaultFn]('.item:visible').first();
    if (element.length === 0) {
      element = $('#autocomplete .item:visible')[fallbackFn]();
    }

    return element;
  }

  pub.onKeyUp = function (e) {
    if (TT.Utils.keyPressed(e, 'DOWN_ARROW')) {
      pub.setActive(getNextElement('nextAll', 'first'));
      pub.input.val($('#autocomplete .active').data('value'));
    } else if (TT.Utils.keyPressed(e, 'UP_ARROW')) {
      pub.setActive(getNextElement('prevAll', 'last'));
      pub.input.val($('#autocomplete .active').data('value'));
    } else if (TT.Utils.keyPressed(e, 'RIGHT_ARROW')) {
      pub.input.val($('#autocomplete .active').data('value'));
    } else if (TT.Utils.keyPressed(e, 'ENTER')) {
      var active = $('#autocomplete .active');
      pub.applyValue(active.length ? active[0] : pub.input);
    } else if (TT.Utils.keyPressed(e, 'ESCAPE')) {
      pub.close();
    } else {
      pub.filter();
    }
  };

  pub.setPosition = function (customCSS) {
    var $autocomplete = $('#autocomplete');
    var offset = pub.target.offset();
    var customTopOffset = pub.options.customTopOffset || -1;

    $autocomplete.css($.extend({
      left: offset.left,
      top: offset.top + pub.target.outerHeight() + customTopOffset,
      width: pub.target.outerWidth() - 2
    }, customCSS || {}));

    $autocomplete.find('.list').css({ maxHeight: pub.options.maxHeight });

    $('#autocomplete-input').css({
      width: $('#autocomplete').outerWidth() - 22
    });

    $autocomplete.css({
      left: Math.min($autocomplete.offset().left, $(window).width() - $autocomplete.outerWidth() - 3),
      top: Math.min($autocomplete.offset().top, $(window).height() - $autocomplete.outerHeight() - 3)
    });
  };

  pub.setActive = function (element) {
    element = element || $('#autocomplete .item:visible').first();
    $('#autocomplete .active').removeClass('active');
    $(element).addClass('active');

    pub.setScrollTop();
  };

  pub.setScrollTop = function () {
    var active = $('#autocomplete .active');
    var top = 0;

    if (active.length) {
      var index = 0;
      var offset = Math.round(($('#autocomplete .list').outerHeight() / active.outerHeight()) / 2);

      $('#autocomplete .item:visible').filter(function (i) {
        if ($(this).hasClass('active')) {
          index = i;
        }
      });
      top = $('#autocomplete .active').outerHeight() * (index - offset);
    }

    $('#autocomplete .list').scrollTop(top);
  };

  pub.applyValue = function (element) {
    element = TT.Utils.isDomElement(element) ? element : this;

    var value = $(element).data('value');
    if (value) {
      pub.input.val(value);
    }
    value = pub.input.val();

    if (pub.options.onApply) {
      pub.options.onApply.call(element, value);
    }

    if (pub.options.closeOnApply) {
      pub.close();
    }

    return false;
  };

  return pub;

}());
