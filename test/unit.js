/**
 * test.js
 * (c) 2013~ Alan Hong
 * sunnynote may be freely distributed under the MIT license./
 */
require.config({
    baseUrl: '../src/js',
    paths: {
        jquery: '../../test/libs/jquery-1.9.1.min',
        CodeMirror: '../../test/libs/codemirror'
    },
    shim: {
        CodeMirror: {
            exports: 'CodeMirror'
        }
    },
    packages: [{
        name: 'sunnynote',
        location: './',
        main: 'sunnynote'
    }]
});

require([
    '../../test/unit/dom.spec',
    '../../test/unit/list.spec',
    '../../test/unit/range.spec',
    '../../test/unit/style.spec'
], function (domSpec, listSpec, rangeSpec, styleSpec) {
    /* global QUnit */
    QUnit.start();

    module('unit/dom');
    domSpec();
    module('unit/list');
    listSpec();
    module('unit/range');
    rangeSpec();
    module('unit/styleSpec');
    styleSpec();
});