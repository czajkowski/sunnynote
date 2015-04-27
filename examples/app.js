
$(document).ready(function() {
    var $editor = $('.sunnynote'),
        $preview = $('.preview div');

    hljs.configure({
        useBR: true
    });

    $editor.sunnynote({
        styleWithSpan : false,
        placeholder: 'Type your message here...',
        onStyleChange : function (styleInfo, $editable) {
            console.log('on style change', styleInfo);

        }
    });
});