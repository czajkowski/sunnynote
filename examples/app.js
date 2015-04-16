
$(document).ready(function() {
    var $editor = $('.sunnynote'),
        $preview = $('.preview div');

    hljs.configure({
        useBR: true
    });

    $editor.sunnynote({
        styleWithSpan : false,
        placeholder: 'Type your message here...',
        onChange: function(contents, $editable) {
            $preview.text(contents)
            hljs.highlightBlock($preview.get(0));
        }
    });
});