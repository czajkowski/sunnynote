define([
    'sunnynote/core/agent',
    'sunnynote/core/dom',
    'sunnynote/core/key',
    'sunnynote/core/list',
    'sunnynote/editing/History',
    'sunnynote/module/Editor'
], function (agent, dom, key, list, History, Editor) {

    /**
     * @class EventHandler
     *
     * EventHandler
     *  - TODO: new instance per a editor
     *  - TODO: rename EventHandler
     */
    var EventHandler = function () {
        /**
         * Modules
         */
        var modules = this.modules = {
            editor: new Editor(this)
        };

        // TODO refactor modules and eventHandler
        //  - remove this method and use custom event from $holder instead
        this.invoke = function () {
            var moduleAndMethod = list.head(list.from(arguments));
            var args = list.tail(list.from(arguments));

            var splits = moduleAndMethod.split('.');
            var hasSeparator = splits.length > 1;
            var moduleName = hasSeparator && list.head(splits);
            var methodName = hasSeparator ? list.last(splits) : list.head(splits);

            var module = this.getModule(moduleName);
            var method = module[methodName];

            return method && method.apply(module, args);
        };

        /**
         * returns module
         *
         * @param {String} moduleName - name of module
         * @return {Module} - defaults is editor
         */
        this.getModule = function (moduleName) {
            return this.modules[moduleName] || this.modules.editor;
        };

        var bindCustomEvent = function ($holder, eventName) {
            return function () {
                return $holder.trigger('sunnynote.' + eventName, arguments);
            };
        };

        /**
         * bind KeyMap on keydown
         *
         * @param {Object} layoutInfo
         * @param {Object} keyMap
         */
        this.bindKeyMap = function (layoutInfo, keyMap) {
            var $editor = layoutInfo.editor();
            var $editable = layoutInfo.editable();

            $editable.on('keydown', function (event) {
                var keys = [];

                // modifier
                if (event.metaKey) {
                    keys.push('CMD');
                }
                if (event.ctrlKey && !event.altKey) {
                    keys.push('CTRL');
                }
                if (event.shiftKey) {
                    keys.push('SHIFT');
                }

                // keycode
                var keyName = key.nameFromCode[event.keyCode];
                if (keyName) {
                    keys.push(keyName);
                }

                var eventName = keyMap[keys.join('+')];
                if (eventName) {
                    if ($.sunnynote.pluginEvents[eventName]) {
                        var plugin = $.sunnynote.pluginEvents[eventName];
                        if ($.isFunction(plugin)) {
                            plugin(event, modules.editor, layoutInfo);
                        }
                    } else if (modules.editor[eventName]) {
                        modules.editor[eventName]($editable, $editor.data('options'));
                        event.preventDefault();
                    }
                    //  else if (commands[eventName]) {
                    //   commands[eventName].call(this, layoutInfo);
                    //   event.preventDefault();
                    // }
                } else if (key.isEdit(event.keyCode)) {
                    modules.editor.afterCommand($editable);
                }
            });
        };

        /**
         * attach eventhandler
         *
         * @param {Object} layoutInfo - layout Informations
         * @param {Object} options - user options include custom event handlers
         * @param {function(event)} [options.onenter] - enter key handler
         * @param {function(event)} [options.onfocus]
         * @param {function(event)} [options.onblur]
         * @param {function(event)} [options.onkeyup]
         * @param {function(event)} [options.onkeydown]
         * @param {function(event)} [options.onpaste]
         * @param {function(event)} [options.onToolBarclick]
         * @param {function(event)} [options.onChange]
         */
        this.attach = function (layoutInfo, options) {
            // handlers for editable
            if (options.shortcuts) {
                this.bindKeyMap(layoutInfo, options.keyMap[agent.isMac ? 'mac' : 'pc']);
            }

            // save options on editor
            layoutInfo.editor().data('options', options);

            // ret styleWithCSS for backColor / foreColor clearing with 'inherit'.
            if (!agent.isMSIE) {
                // protect FF Error: NS_ERROR_FAILURE: Failure
                setTimeout(function () {
                    document.execCommand('styleWithCSS', 0, options.styleWithSpan);
                }, 0);
            }

            // History
            var history = new History(layoutInfo.editable());
            layoutInfo.editable().data('NoteHistory', history);

            // basic event callbacks (lowercase)
            // enter, focus, blur, keyup, keydown
            if (options.onenter) {
                layoutInfo.editable().keypress(function (event) {
                    if (event.keyCode === key.ENTER) {
                        options.onenter(event);
                    }
                });
            }

            if (options.onfocus) {
                layoutInfo.editable().focus(options.onfocus);
            }
            if (options.onblur) {
                layoutInfo.editable().blur(options.onblur);
            }
            if (options.onkeyup) {
                layoutInfo.editable().keyup(options.onkeyup);
            }
            if (options.onkeydown) {
                layoutInfo.editable().keydown(options.onkeydown);
            }
            if (options.onpaste) {
                layoutInfo.editable().on('paste', options.onpaste);
            }

            // callbacks for advanced features (camel)

            // onChange
            if (options.onChange) {
                var hChange = function () {
                    modules.editor.triggerOnChange(layoutInfo.editable());
                };

                if (agent.isMSIE) {
                    var sDomEvents = 'DOMCharacterDataModified DOMSubtreeModified DOMNodeInserted';
                    layoutInfo.editable().on(sDomEvents, hChange);
                } else {
                    layoutInfo.editable().on('input', hChange);
                }
            }

            // All editor status will be saved on editable with jquery's data
            // for support multiple editor with singleton object.
            layoutInfo.editable().data('callbacks', {
                onBeforeChange: options.onBeforeChange,
                onChange: options.onChange
            });

            // Textarea: auto filling the code before form submit.
            if (dom.isTextarea(list.head(layoutInfo.holder()))) {
                layoutInfo.holder().closest('form').submit(function () {
                    var contents = layoutInfo.holder().code();
                    layoutInfo.holder().val(contents);

                    // callback on submit
                    if (options.onsubmit) {
                        options.onsubmit(contents);
                    }
                });
            }
        };

        /**
         * attach jquery custom event
         *
         * @param {Object} layoutInfo - layout Informations
         */
        this.attachCustomEvent = function (layoutInfo) {
            var $holder = layoutInfo.holder();
            var $editable = layoutInfo.editable();

            $editable.on('mousedown', bindCustomEvent($holder, 'mousedown'));
            $editable.on('keyup mouseup', bindCustomEvent($holder, 'update'));
            $editable.on('scroll', bindCustomEvent($holder, 'scroll'));

            // basic event callbacks (lowercase)
            // enter, focus, blur, keyup, keydown
            $editable.keypress(function (event) {
                if (event.keyCode === key.ENTER) {
                    bindCustomEvent($holder, 'enter').call(this, event);
                }
            });

            $editable.focus(bindCustomEvent($holder, 'focus'));
            $editable.blur(bindCustomEvent($holder, 'blur'));
            $editable.keyup(bindCustomEvent($holder, 'keyup'));
            $editable.keydown(bindCustomEvent($holder, 'keydown'));
            $editable.on('paste', bindCustomEvent($holder, 'paste'));

            if (agent.isMSIE) {
                var sDomEvents = 'DOMCharacterDataModified DOMSubtreeModified DOMNodeInserted';
                $editable.on(sDomEvents, bindCustomEvent($holder, 'change'));
            } else {
                $editable.on('input', bindCustomEvent($holder, 'change'));
            }

            // Textarea: auto filling the code before form submit.
            if (dom.isTextarea(list.head($holder))) {
                $holder.closest('form').submit(function (e) {
                    var contents = $holder.code();
                    bindCustomEvent($holder, 'submit').call(this, e, contents);
                });
            }

            // fire init event
            bindCustomEvent($holder, 'init')();

            // fire plugin init event
            for (var i = 0, len = $.sunnynote.plugins.length; i < len; i++) {
                if ($.isFunction($.sunnynote.plugins[i].init)) {
                    $.sunnynote.plugins[i].init(layoutInfo);
                }
            }
        };

        this.detach = function (layoutInfo) {
            layoutInfo.holder().off();
            layoutInfo.editable().off();

        };
    };

    return EventHandler;
});