
$(document).ready(function() {
    'use strict';

    var $editor = $('.sunnynote'),
        $preview = $('.preview div'),
        $boldButton = $('.js-style-bold'),
        $italicButton = $('.js-style-italic'),
        $underlineButton = $('.js-style-underline');

    hljs.configure({
        useBR: true
    });

    $editor.sunnynote({
        styleWithSpan : false,
        placeholder: 'Type your message here...',
        onChange : function (contents, $editable) {
            $preview.text(contents);
            hljs.highlightBlock($preview.get(0));
        },
        onStyleChange : function (styleInfo, $editable) {
            $boldButton.toggleClass('btn-success', styleInfo['font-bold'] === 'bold');
            $italicButton.toggleClass('btn-success', styleInfo['font-italic'] === 'italic');
            $underlineButton.toggleClass('btn-success', styleInfo['font-underline'] === 'underline');
        }
    });

    $boldButton.click(function (e) {
        e.preventDefault();
        $editor.applyStyle('bold');
    });

    $italicButton.click(function (e) {
        e.preventDefault();
        $editor.applyStyle('italic');
    });

    $underlineButton.click(function (e) {
        e.preventDefault();
        $editor.applyStyle('underline');
    });
});