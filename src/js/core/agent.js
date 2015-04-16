define(['jquery'], function ($) {
    if (!Array.prototype.reduce) {
        /**
         * Array.prototype.reduce polyfill
         *
         * @param {Function} callback
         * @param {Value} [initialValue]
         * @return {Value}
         *
         * @see http://goo.gl/WNriQD
         */
        Array.prototype.reduce = function (callback) {
            var t = Object(this),
                len = t.length >>> 0,
                k = 0,
                value;
            if (arguments.length === 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in t)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        };
    }

    if ('function' !== typeof Array.prototype.filter) {
        /**
         * Array.prototype.filter polyfill
         *
         * @param {Function} func
         * @return {Array}
         *
         * @see http://goo.gl/T1KFnq
         */
        Array.prototype.filter = function (func) {
            var t = Object(this),
                len = t.length >>> 0;

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];
                    if (func.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }

            return res;
        };
    }

    var isSupportAmd = typeof define === 'function' && define.amd;

    /**
     * @class core.agent
     *
     * Object which check platform and agent
     *
     * @singleton
     * @alternateClassName agent
     */
    var agent = {
        /** @property {Boolean} [isMac=false] true if this agent is Mac  */
        isMac: navigator.appVersion.indexOf('Mac') > -1,
        /** @property {Boolean} [isMSIE=false] true if this agent is a Internet Explorer  */
        isMSIE: navigator.userAgent.indexOf('MSIE') > -1 || navigator.userAgent.indexOf('Trident') > -1,
        /** @property {Boolean} [isFF=false] true if this agent is a Firefox  */
        isFF: navigator.userAgent.indexOf('Firefox') > -1,
        /** @property {String} jqueryVersion current jQuery version string  */
        jqueryVersion: parseFloat($.fn.jquery),
        isSupportAmd: isSupportAmd,
        isW3CRangeSupport: !!document.createRange
    };

    return agent;
});