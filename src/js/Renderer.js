define([
    'sunnynote/core/agent', 'sunnynote/core/dom', 'sunnynote/core/func'
], function (agent, dom) {
    /**
     * @class Renderer
     *
     * renderer
     *
     * rendering toolbar and editable
     */
    var Renderer = function () {

        /**
         * create sunnynote layout (normal mode)
         *
         * @param {jQuery} $holder
         * @param {Object} options
         */
        this.createLayoutByFrame = function ($holder, options) {

            //01. create Editor
            var $editor = $('<div class="note-editor"></div>');
            if (options.width) {
                $editor.width(options.width);
            }

            //03. create Editable
            var isContentEditable = !$holder.is(':disabled');
            var $editable = $('<div class="note-editable" contentEditable="' + isContentEditable + '"></div>')
                .prependTo($editor);
            if (options.height) {
                $editable.height(options.height);
            }
            if (options.direction) {
                $editable.attr('dir', options.direction);
            }
            var placeholder = $holder.attr('placeholder') || options.placeholder;
            if (placeholder) {
                $editable.attr('data-placeholder', placeholder);
            }

            $editable.html(dom.html($holder));

            //09. Editor/Holder switch
            $editor.insertAfter($holder);
            $holder.hide();
        };

        this.hasNoteEditor = function ($holder) {
            return this.noteEditorFromHolder($holder).length > 0;
        };

        this.noteEditorFromHolder = function ($holder) {
            if ($holder.next().hasClass('note-editor')) {
                return $holder.next();
            } else {
                return $();
            }
        };

        /**
         * create sunnynote layout
         *
         * @param {jQuery} $holder
         * @param {Object} options
         */
        this.createLayout = function ($holder, options) {
            // if (options.airMode) {
            //   this.createLayoutByAirMode($holder, options);
            // } else {
            this.createLayoutByFrame($holder, options);
            // }
        };

        /**
         * returns layoutInfo from holder
         *
         * @param {jQuery} $holder - placeholder
         * @return {Object}
         */
        this.layoutInfoFromHolder = function ($holder) {
            var $editor = this.noteEditorFromHolder($holder);
            if (!$editor.length) {
                return;
            }

            // connect $holder to $editor
            $editor.data('holder', $holder);

            return dom.buildLayoutInfo($editor);
        };

        /**
         * removeLayout
         *
         * @param {jQuery} $holder - placeholder
         * @param {Object} layoutInfo
         *
         */
        this.removeLayout = function ($holder, layoutInfo) {
            $holder.html(layoutInfo.editable().html());

            layoutInfo.editor().remove();
            $holder.show();
        };

    };

    return Renderer;
});