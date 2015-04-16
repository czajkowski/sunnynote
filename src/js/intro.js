/**
 * JS simple text editor v@VERSION
 *
 * sunnynote.js
 * Copyright 2013-2015 Piotr Czajkowski. and other contributors
 * sunnynote may be freely distributed under the MIT license.
 *
 * Date: @DATE
 */
(function (factory) {
        /* global define */
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery'], factory);
        } else {
            // Browser globals: jQuery
            factory(window.jQuery);
        }
    }(function ($) {
            'use strict';