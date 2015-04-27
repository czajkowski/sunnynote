define([
    'sunnynote/core/agent',
    'sunnynote/core/func',
    'sunnynote/core/list',
    'sunnynote/core/dom',
    'sunnynote/core/range',
    'sunnynote/editing/Style',
    'sunnynote/editing/Typing'
], function (agent, func, list, dom, range, Style, Typing) {
    /**
     * @class editing.Editor
     *
     * Editor
     *
     */
    var Editor = function () {

        var style = new Style();
        var typing = new Typing();

        /**
         * @method createRange
         *
         * create range
         *
         * @param {jQuery} $editable
         * @return {WrappedRange}
         */
        this.createRange = function ($editable) {
            $editable.focus();
            return range.create();
        };

        /**
         * @method saveRange
         *
         * save current range
         *
         * @param {jQuery} $editable
         * @param {Boolean} [thenCollapse=false]
         */
        this.saveRange = function ($editable, thenCollapse) {
            $editable.focus();
            $editable.data('range', range.create());
            if (thenCollapse) {
                range.create().collapse().select();
            }
        };

        /**
         * @method saveRange
         *
         * save current node list to $editable.data('childNodes')
         *
         * @param {jQuery} $editable
         */
        this.saveNode = function ($editable) {
            // copy child node reference
            var copy = [];
            for (var key = 0, len = $editable[0].childNodes.length; key < len; key++) {
                copy.push($editable[0].childNodes[key]);
            }
            $editable.data('childNodes', copy);
        };

        /**
         * @method restoreRange
         *
         * restore lately range
         *
         * @param {jQuery} $editable
         */
        this.restoreRange = function ($editable) {
            var rng = $editable.data('range');
            if (rng) {
                rng.select();
                $editable.focus();
            }
        };

        /**
         * @method restoreNode
         *
         * restore lately node list
         *
         * @param {jQuery} $editable
         */
        this.restoreNode = function ($editable) {
            $editable.html('');
            var child = $editable.data('childNodes');
            for (var index = 0, len = child.length; index < len; index++) {
                $editable[0].appendChild(child[index]);
            }
        };
        /**
         * @method currentStyle
         *
         * current style
         *
         * @param {Node} target
         * @return {Boolean} false if range is no
         */
        this.currentStyle = function () {
            var rng = range.create();
            return rng ? rng.isOnEditable() && style.current() : false;
        };

        var triggerOnBeforeChange = this.triggerOnBeforeChange = function ($editable) {
            var onBeforeChange = $editable.data('callbacks').onBeforeChange;
            if (onBeforeChange) {
                onBeforeChange($editable.html(), $editable);
            }
        };

        var triggerOnChange = this.triggerOnChange = function ($editable) {
            var onChange = $editable.data('callbacks').onChange;
            if (onChange) {
                onChange($editable.html(), $editable);
            }
        };

        /**
         * @method undo
         * undo
         * @param {jQuery} $editable
         */
        this.undo = function ($editable) {
            triggerOnBeforeChange($editable);
            $editable.data('NoteHistory').undo();
            triggerOnChange($editable);
        };

        /**
         * @method redo
         * redo
         * @param {jQuery} $editable
         */
        this.redo = function ($editable) {
            triggerOnBeforeChange($editable);
            $editable.data('NoteHistory').redo();
            triggerOnChange($editable);
        };

        /**
         * @method beforeCommand
         * before command
         * @param {jQuery} $editable
         */
        var beforeCommand = this.beforeCommand = function ($editable) {
            triggerOnBeforeChange($editable);
        };

        /**
         * @method afterCommand
         * after command
         * @param {jQuery} $editable
         */
        var afterCommand = this.afterCommand = function ($editable) {
            $editable.data('NoteHistory').recordUndo();
            triggerOnChange($editable);
        };


        /* jshint ignore:start */
        // native commands(with execCommand), generate function for execCommand
        var commands = ['bold', 'italic', 'underline'];

        for (var idx = 0, len = commands.length; idx < len; idx++) {
            this[commands[idx]] = (function (sCmd) {
                return function ($editable, value) {
                    beforeCommand($editable);

                    document.execCommand(sCmd, false, value);

                    afterCommand($editable);
                };
            })(commands[idx]);
        }
        /* jshint ignore:end */

        /**
         * @method insertParagraph
         *
         * insert paragraph
         *
         * @param {Node} $editable
         */
        this.insertParagraph = function ($editable) {
            beforeCommand($editable);
            typing.insertParagraph($editable);
            afterCommand($editable);
        };

        /**
         * @method insertNode
         * insert node
         * @param {Node} $editable
         * @param {Node} node
         */
        this.insertNode = function ($editable, node) {
            beforeCommand($editable);
            var rng = this.createRange($editable);
            rng.insertNode(node);
            range.createFromNode(node).collapse().select();
            afterCommand($editable);
        };

        /**
         * insert text
         * @param {Node} $editable
         * @param {String} text
         */
        this.insertText = function ($editable, text) {
            beforeCommand($editable);
            var rng = this.createRange($editable);
            var textNode = rng.insertNode(dom.createText(text));
            range.create(textNode, dom.nodeLength(textNode)).select();
            afterCommand($editable);
        };

        /**
         * formatBlock
         *
         * @param {jQuery} $editable
         * @param {String} tagName
         */
        this.formatBlock = function ($editable, tagName) {
            beforeCommand($editable);
            tagName = agent.isMSIE ? '<' + tagName + '>' : tagName;
            document.execCommand('FormatBlock', false, tagName);
            afterCommand($editable);
        };

        this.formatPara = function ($editable) {
            beforeCommand($editable);
            this.formatBlock($editable, 'P');
            afterCommand($editable);
        };



        /**
         * set focus
         *
         * @param $editable
         */
        this.focus = function ($editable) {
            $editable.focus();
        };
    };

    return Editor;
});