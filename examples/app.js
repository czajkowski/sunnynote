
$(document).ready(function() {
    'use strict';

    var $editor = $('.sunnynote'),
        $preview = $('.preview div'),
        $stylingButton = $('.js-toggle-styling'),
        $styleButtons = $('.js-style'),
        $boldButton = $('.js-style-bold'),
        $italicButton = $('.js-style-italic'),
        $underlineButton = $('.js-style-underline'),
        stylingEnabled = true;

    hljs.configure({
        useBR: true
    });


    $editor.sunnynote({
        focus : true,
        styleWithSpan : false,
        placeholder: 'Type your message here...',
        onpaste : function (e) {
            e.preventDefault();
            var text = e.originalEvent.clipboardData.getData('text');
            console.log(text);
            window.document.execCommand('insertHTML', false, text);
        },
        onChange : function (contents, $editable) {
            $preview.text(contents);
            hljs.highlightBlock($preview.get(0));
        },
        onStyleChange : function (styleInfo, $editable) {
            $boldButton.toggleClass('btn-success', styleInfo.bold);
            $italicButton.toggleClass('btn-success', styleInfo.italic);
            $underlineButton.toggleClass('btn-success', styleInfo.underline);
        }
    });

    $stylingButton.click(function (e) {
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


    $boldButton.click(function (e) {
        e.preventDefault();
        $editor.toggleFontStyle('bold');
    });

    $italicButton.click(function (e) {
        e.preventDefault();
        $editor.toggleFontStyle('italic');
    });

    $underlineButton.click(function (e) {
        e.preventDefault();
        $editor.toggleFontStyle('underline');
    });
});