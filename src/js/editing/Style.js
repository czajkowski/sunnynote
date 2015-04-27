define(function () {
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
            var styleInfo = {};

            // document.queryCommandState for toggle state
            styleInfo['font-bold'] = document.queryCommandState('bold') ? 'bold' : 'normal';
            styleInfo['font-italic'] = document.queryCommandState('italic') ? 'italic' : 'normal';
            styleInfo['font-underline'] = document.queryCommandState('underline') ? 'underline' : 'normal';

            return styleInfo;
        };
    };

    return Style;
});