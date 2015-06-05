define(function () {
    'use strict';

    /**
     * @class editing.Style
     *
     * Style
     *
     */
    var Style = function () {

        /**
         * get current style on cursor
         *
         * @return {Object} - object contains style properties.
         */
        this.current = function () {
            return {
                bold : document.queryCommandState('bold'),
                italic : document.queryCommandState('italic'),
                underline : document.queryCommandState('underline')
            };
        };
    };

    return Style;
});