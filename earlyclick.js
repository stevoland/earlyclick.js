/**
 * Queues click events on A tags with class="earlyclick" that occur before required scripts have been executed.
 * Once all required scripts have executed set window.EARLYCLICK_READY = true
 * Include this script in the <head>
 */
(function(w) {
    var _addEventListener = null,
        _removeEventListener = null,
        _eventQueue = [];

    if (!w.JS_ENABLED) {
        return false;
    }

    // standard compliant browser
    if (w.addEventListener) {
        _addEventListener = function(el, eType, fn) {el.addEventListener(eType, fn, false);};
        _removeEventListener = function(el, eType, fn) {el.removeEventListener(eType, fn);};
    }
    // IE
    else if (w.attachEvent) {
        _addEventListener = function(el, eType, fn) {el.attachEvent('on' + eType, fn, false);};
        _removeEventListener = function(el, eType, fn) {el.detachEvent('on' + eType, fn);};
    }

    // if we cannot detect the event management system, then don't bother continuing
    if (_addEventListener) {
        var _handleClick = function (e) {
            // In case the handler hasn't been removed
            if (_isPageReady()) {
                return false;
            }
            var target = e.target,
                capture = false;
            while (target.nodeName.toUpperCase() !== 'BODY') {
                if(target.className.indexOf('earlyclick') >= 0) {
                    capture = true;
                    break;
                } else {
                    target = target.parentNode;
                }
            }

            if (capture) {
                e.preventDefault();
                target.className.split('earlyclick').join('earlyclick-loading');
                _eventQueue.push(target);
            }
        };

        _addEventListener(document.documentElement, 'click', _handleClick);

        var _isPageReady = function () {
            return (w.EARLYCLICK_READY && w.jQuery);
        };

        var _handleOnloadEvent = function () {
            if (_isPageReady()) {
                _removeEventListener(document.documentElement, 'click', _handleClick);
                var j = _eventQueue.length;

                for (var i = 0; i < j; i += 1) {
                    var targ = _eventQueue[i];

                    if (targ) {
                        targ.className.split('earlyclick-loading').join('earlyclick');
                        jQuery(targ).trigger('click');
                    }
                }
            }
            else {
                setTimeout(_handleOnloadEvent, 250);
            }
        };

        _handleOnloadEvent();
    }
})(window);