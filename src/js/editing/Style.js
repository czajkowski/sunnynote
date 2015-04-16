define([
    'sunnynote/core/agent',
    'sunnynote/core/func',
    'sunnynote/core/list',
    'sunnynote/core/dom'
], function (agent, func, list, dom) {
    /**
     * @class editing.Style
     *
     * Style
     *
     */
    var Style = function () {

        /**
         * paragraph level style
         *
         * @param {WrappedRange} rng
         * @param {Object} styleInfo
         */
        this.stylePara = function (rng, styleInfo) {
            $.each(rng.nodes(dom.isPara, {
                includeAncestor: true
            }), function (idx, para) {
                $(para).css(styleInfo);
            });
        };

        /**
         * insert and returns styleNodes on range.
         *
         * @param {WrappedRange} rng
         * @param {Object} [options] - options for styleNodes
         * @param {String} [options.nodeName] - default: `SPAN`
         * @param {Boolean} [options.expandClosestSibling] - default: `false`
         * @param {Boolean} [options.onlyPartialContains] - default: `false`
         * @return {Node[]}
         */
        this.styleNodes = function (rng, options) {
            rng = rng.splitText();

            var nodeName = options && options.nodeName || 'SPAN';
            var expandClosestSibling = !!(options && options.expandClosestSibling);
            var onlyPartialContains = !!(options && options.onlyPartialContains);

            if (rng.isCollapsed()) {
                return rng.insertNode(dom.create(nodeName));
            }

            var pred = dom.makePredByNodeName(nodeName);
            var nodes = $.map(rng.nodes(dom.isText, {
                fullyContains: true
            }), function (text) {
                return dom.singleChildAncestor(text, pred) || dom.wrap(text, nodeName);
            });

            if (expandClosestSibling) {
                if (onlyPartialContains) {
                    var nodesInRange = rng.nodes();
                    // compose with partial contains predication
                    pred = func.and(pred, function (node) {
                        return list.contains(nodesInRange, node);
                    });
                }

                return $.map(nodes, function (node) {
                    var siblings = dom.withClosestSiblings(node, pred);
                    var head = list.head(siblings);
                    var tails = list.tail(siblings);
                    $.each(tails, function (idx, elem) {
                        dom.appendChildNodes(head, elem.childNodes);
                        dom.remove(elem);
                    });
                    return list.head(siblings);
                });
            } else {
                return nodes;
            }
        };

        /**
         * get current style on cursor
         *
         * @param {WrappedRange} rng
         * @return {Object} - object contains style properties.
         */
        this.current = function (rng) {
            var styleInfo = {};

            // document.queryCommandState for toggle state
            styleInfo['font-bold'] = document.queryCommandState('bold') ? 'bold' : 'normal';
            styleInfo['font-italic'] = document.queryCommandState('italic') ? 'italic' : 'normal';
            styleInfo['font-underline'] = document.queryCommandState('underline') ? 'underline' : 'normal';

            styleInfo.ancestors = dom.listAncestor(rng.sc, dom.isEditable);
            styleInfo.range = rng;

            return styleInfo;
        };
    };

    return Style;
});