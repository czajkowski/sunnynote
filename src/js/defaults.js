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
         * @property {Object} options.codemirror
         * @property {Object} [options.codemirror.mode='text/html']
         * @property {Object} [options.codemirror.htmlMode=true]
         * @property {Object} [options.codemirror.lineNumbers=true]
         * @property {String} [options.lang=en-US] language 'en-US', 'ko-KR', ...
         * @property {String} [options.direction=null] text direction, ex) 'rtl'
         * @property {Array} [options.toolbar]
         * @property {Boolean} [options.airMode=false]
         * @property {Array} [options.airPopover]
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

            keyMap: {
                pc: {
                    'ENTER': 'insertParagraph',
                    'CTRL+Z': 'undo',
                    'CTRL+Y': 'redo',
                    'CTRL+B': 'bold',
                    'CTRL+U': 'underline'
                },

                mac: {
                    'ENTER': 'insertParagraph',
                    'CMD+Z': 'undo',
                    'CMD+SHIFT+Z': 'redo',
                    'CMD+B': 'bold',
                    'CMD+U': 'underline'
                }
            }
        }
    };

    return defaults;
});