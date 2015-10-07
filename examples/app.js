$(document).ready(function() {
    'use strict';

    var $editor = $('.sunnynote'),
        $preview = $('.preview div'),
        $stylingButton = $('.js-toggle-styling'),
        $styleButtons = $('.js-style'),
        $boldButton = $('.js-style-bold'),
        $italicButton = $('.js-style-italic'),
        $underlineButton = $('.js-style-underline'),
        $counter = $('.chatacter-counter'),
        stylingEnabled = true;

    hljs.configure({
        useBR: true
    });

    // http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div
    function pasteHtmlAtCaret(html) {
        var sel, range;
        if (window.getSelection) {
            // IE9 and non-IE
            sel = window.getSelection();
            if (sel.getRangeAt && sel.rangeCount) {
                range = sel.getRangeAt(0);
                range.deleteContents();

                // Range.createContextualFragment() would be useful here but is
                // only relatively recently standardized and is not supported in
                // some browsers (IE9, for one)
                var el = document.createElement('div');
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ( (node = el.firstChild) ) {
                    lastNode = frag.appendChild(node);
                }
                range.insertNode(frag);

                // Preserve the selection
                if (lastNode) {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        } else if (document.selection && document.selection.type !== 'Control') {
            // IE < 9
            document.selection.createRange().pasteHTML(html);
        }
    }

    $editor.sunnynote({
        focus: true,
        styleWithSpan: false,
        placeholder: 'Type your message here...',
        onpaste: function(e) {
            e.preventDefault();
            var text = '';

            if (window.clipboardData && window.clipboardData.getData) { // IE
                text = window.clipboardData.getData('Text');
            } else if (e.originalEvent && e.originalEvent.clipboardData && e.originalEvent.clipboardData.getData) {
                text = e.originalEvent.clipboardData.getData('text/plain');
                console.log(text);
            }

            text = text.trim();

            if (document.queryCommandSupported('insertHTML')) {
                try {
                    return document.execCommand('insertHTML', false, text);
                } catch (ignore) {}
            } else {
                pasteHtmlAtCaret(text);
            }

        },
        onChange: function(contents, $editable) {
            $counter.text($editable.text().trim().length);
            $preview.text(contents);
            hljs.highlightBlock($preview.get(0));
        },
        onStyleChange: function(styleInfo, $editable) {
            $boldButton.toggleClass('btn-success', styleInfo.bold);
            $italicButton.toggleClass('btn-success', styleInfo.italic);
            $underlineButton.toggleClass('btn-success', styleInfo.underline);
        }
    });

    $stylingButton.click(function(e) {
        e.preventDefault();
        if (stylingEnabled) {
            stylingEnabled = false;
            $editor.disableFontStyling();
            $stylingButton.text('Enable');
            //$styleButtons.hide();
        } else {
            stylingEnabled = true;
            $editor.enableFontStyling();
            $stylingButton.text('Disable');
            //$styleButtons.show();
        }
        $editor.focus();
    });


    $boldButton.click(function(e) {
        e.preventDefault();
        $editor.toggleFontStyle('bold');
    });

    $italicButton.click(function(e) {
        e.preventDefault();
        $editor.toggleFontStyle('italic');
    });

    $underlineButton.click(function(e) {
        e.preventDefault();
        $editor.toggleFontStyle('underline');
    });
});