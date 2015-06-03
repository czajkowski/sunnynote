define([
    'sunnynote/core/agent',
    'sunnynote/core/list',
    'sunnynote/core/dom',
    'sunnynote/core/range',
    'sunnynote/defaults',
    'sunnynote/EventHandler',
    'sunnynote/Renderer'
], function (agent, list, dom, range, defaults, EventHandler, Renderer) {
    'use strict';


    // jQuery namespace for sunnynote
    /**
     * @class $.sunnynote
     *
     * sunnynote attribute
     *
     * @mixin defaults
     * @singleton
     *
     */
    $.sunnynote = $.sunnynote || {};

    // extends default settings
    //  - $.sunnynote.version
    //  - $.sunnynote.options
    //  - $.sunnynote.lang
    $.extend($.sunnynote, defaults);

    var renderer = new Renderer();
    var eventHandler = new EventHandler();

    $.extend($.sunnynote, {
        /** @property {Renderer} */
        renderer: renderer,
        /** @property {EventHandler} */
        eventHandler: eventHandler,
        /** 
         * @property {Object} core
         * @property {core.agent} core.agent
         * @property {core.dom} core.dom
         * @property {core.range} core.range
         */
        core: {
            agent: agent,
            dom: dom,
            range: range
        }
    });


    /*
     * extend $.fn
     */
    $.fn.extend({
        /**
         * @method
         * Initialize sunnynote
         *  - create editor layout and attach Mouse and keyboard events.
         *
         * ```
         * $("#sunnynote").sunnynote( { options ..} );
         * ```
         *
         * @member $.fn
         * @param {Object|String} options reference to $.sunnynote.options
         * @return {this}
         */
        sunnynote: function () {
            // check first argument's type
            //  - {String}: External API call {{module}}.{{method}}
            //  - {Object}: init options
            var type = $.type(list.head(arguments));
            var isExternalAPICalled = type === 'string';
            var isInitOptions = type === 'object';

            // extend default options with custom user options
            var options = isInitOptions ? list.head(arguments) : {};
            options = $.extend({}, $.sunnynote.options, options);

            this.each(function (idx, holder) {
                var $holder = $(holder);

                // if layout isn't created yet, createLayout and attach events
                if (!renderer.hasNoteEditor($holder)) {
                    renderer.createLayout($holder, options);

                    var layoutInfo = renderer.layoutInfoFromHolder($holder);

                    eventHandler.attach(layoutInfo, options);
                    eventHandler.attachCustomEvent(layoutInfo, options);
                }
            });

            // callback on init
            if (!isExternalAPICalled && this.length && options.oninit) {
                options.oninit();
            }

            var $first = this.first();
            if ($first.length) {
                var layoutInfo = renderer.layoutInfoFromHolder($first);

                // external API
                if (isExternalAPICalled) {
                    var moduleAndMethod = list.head(list.from(arguments));
                    var args = list.tail(list.from(arguments));

                    // TODO now external API only works for editor
                    var params = [moduleAndMethod, layoutInfo.editable()].concat(args);
                    return eventHandler.invoke.apply(eventHandler, params);
                } else if (options.focus) {
                    // focus on first editable element for initialize editor
                    layoutInfo.editable().focus();
                }
            }

            return this;
        },

        /**
         * @method
         *
         * get the HTML contents of note or set the HTML contents of note.
         *
         * * get contents
         * ```
         * var content = $("#sunnynote").code();
         * ```
         * * set contents
         *
         * ```
         * $("#sunnynote").code(html);
         * ```
         *
         * @member $.fn
         * @param {String} [html] - HTML contents(optional, set)
         * @return {this|String} - context(set) or HTML contents of note(get).
         */
        code: function (html) {
            // get the HTML contents of note
            if (html === undefined) {
                var $holder = this.first();
                if (!$holder.length) {
                    return;
                }

                var layoutInfo = renderer.layoutInfoFromHolder($holder);
                var $editable = layoutInfo && layoutInfo.editable();

                if ($editable && $editable.length) {
                    return layoutInfo.editable().html();
                }
                return dom.isTextarea($holder[0]) ? $holder.val() : $holder.html();
            }

            // set the HTML contents of note
            this.each(function (i, holder) {
                var layoutInfo = renderer.layoutInfoFromHolder($(holder));
                var $editable = layoutInfo && layoutInfo.editable();
                if ($editable) {
                    $editable.html(html);
                }
            });

            return this;
        },

        applyStyle: function (styles) {
            var type = $.type(styles);
            var $holder = this.first();

            if (type === 'string') {
                styles = styles.split(' ');
            }

            if (!$holder.length || !styles) {
                return;
            }

            var layoutInfo = renderer.layoutInfoFromHolder($holder);
            var $editable = layoutInfo && layoutInfo.editable();

            for (var idx = 0, len = styles.length; idx < len; idx++) {
                eventHandler.invoke.call(eventHandler, styles[idx], $editable);
            }

            $editable.focus();
        },

        /**
         * @method
         *
         * destroy Editor Layout and detach Key and Mouse Event
         *
         * @member $.fn
         * @return {this}
         */
        destroy: function () {
            this.each(function (idx, holder) {
                var $holder = $(holder);

                if (!renderer.hasNoteEditor($holder)) {
                    return;
                }

                var info = renderer.layoutInfoFromHolder($holder);
                var options = info.editor().data('options');

                eventHandler.detach(info, options);
                renderer.removeLayout($holder, info);
            });

            return this;
        }
    });
});