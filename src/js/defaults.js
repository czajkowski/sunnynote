define('sunnynote/defaults', function () {
    /**
     * @class defaults
     *
     * @singleton
     */
    var defaults = {
        /** @property */
        version: '@VERSION',

        /**
         *
         * for event options, reference to EventHandler.attach
         *
         * @property {Object} options
         * @property {String/Number} [options.width=null] set editor width
         * @property {String/Number} [options.height=null] set editor height, ex) 300
         * @property {String/Number} options.minHeight set minimum height of editor
         * @property {String/Number} options.maxHeight
         * @property {String/Number} options.focus
         * @property {Number} options.tabsize
         * @property {Boolean} options.styleWithSpan
         * @property {Fucntion} [options.onInit] initialize
         * @property {Fucntion} [options.onsubmit]
         */
        options: {
            width: null, // set editor width
            height: null, // set editor height, ex) 300

            minHeight: null, // set minimum height of editor
            maxHeight: null, // set maximum height of editor

            focus: false, // set focus to editable area after initializing sunnynote

            tabsize: 4, // size of tab ex) 2 or 4
            styleWithSpan: true, // style with span (Chrome and FF only)

            shortcuts: true, // enable keyboard shortcuts

            // language
            direction: null, // text direction, ex) 'rtl'

            // callbacks
            oninit: null, // initialize
            onfocus: null, // editable has focus
            onblur: null, // editable out of focus
            onenter: null, // enter key pressed
            onkeyup: null, // keyup
            onkeydown: null, // keydown
            onsubmit: null,

            onStyleChange : null,

            keyMap: {
                pc: {
                    'ENTER': 'insertParagraph',
                    'CTRL+Z': 'undo',
                    'CTRL+Y': 'redo',
                    'CTRL+B': 'bold',
                    'CTRL+I': 'italic',
                    'CTRL+U': 'underline'
                },

                mac: {
                    'ENTER': 'insertParagraph',
                    'CMD+Z': 'undo',
                    'CMD+SHIFT+Z': 'redo',
                    'CMD+B': 'bold',
                    'CMD+I': 'italic',
                    'CMD+U': 'underline'
                }
            }
        }
    };

    return defaults;
});