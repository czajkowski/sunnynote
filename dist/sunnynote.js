/**
 * JS simple text editor v0.0.1
 *
 * sunnynote.js
 * Copyright 2013-2015 Piotr Czajkowski. and other contributors
 * sunnynote may be freely distributed under the MIT license.
 *
 * Date: 2015-04-16T13:40Z
 */
(function (factory) {
        /* global define */
        if (typeof define === 'function' && define.amd) {
            // AMD. Register as an anonymous module.
            define(['jquery'], factory);
        } else {
            // Browser globals: jQuery
            factory(window.jQuery);
        }
    }(function ($) {
            

    if (!Array.prototype.reduce) {
        /**
         * Array.prototype.reduce polyfill
         *
         * @param {Function} callback
         * @param {Value} [initialValue]
         * @return {Value}
         *
         * @see http://goo.gl/WNriQD
         */
        Array.prototype.reduce = function (callback) {
            var t = Object(this),
                len = t.length >>> 0,
                k = 0,
                value;
            if (arguments.length === 2) {
                value = arguments[1];
            } else {
                while (k < len && !(k in t)) {
                    k++;
                }
                if (k >= len) {
                    throw new TypeError('Reduce of empty array with no initial value');
                }
                value = t[k++];
            }
            for (; k < len; k++) {
                if (k in t) {
                    value = callback(value, t[k], k, t);
                }
            }
            return value;
        };
    }

    if ('function' !== typeof Array.prototype.filter) {
        /**
         * Array.prototype.filter polyfill
         *
         * @param {Function} func
         * @return {Array}
         *
         * @see http://goo.gl/T1KFnq
         */
        Array.prototype.filter = function (func) {
            var t = Object(this),
                len = t.length >>> 0;

            var res = [];
            var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
            for (var i = 0; i < len; i++) {
                if (i in t) {
                    var val = t[i];
                    if (func.call(thisArg, val, i, t)) {
                        res.push(val);
                    }
                }
            }

            return res;
        };
    }

    var isSupportAmd = typeof define === 'function' && define.amd;

    /**
     * @class core.agent
     *
     * Object which check platform and agent
     *
     * @singleton
     * @alternateClassName agent
     */
    var agent = {
        /** @property {Boolean} [isMac=false] true if this agent is Mac  */
        isMac: navigator.appVersion.indexOf('Mac') > -1,
        /** @property {Boolean} [isMSIE=false] true if this agent is a Internet Explorer  */
        isMSIE: navigator.userAgent.indexOf('MSIE') > -1 || navigator.userAgent.indexOf('Trident') > -1,
        /** @property {Boolean} [isFF=false] true if this agent is a Firefox  */
        isFF: navigator.userAgent.indexOf('Firefox') > -1,
        /** @property {String} jqueryVersion current jQuery version string  */
        jqueryVersion: parseFloat($.fn.jquery),
        isSupportAmd: isSupportAmd,
        isW3CRangeSupport: !!document.createRange
    };

    /**
     * @class core.func
     *
     * func utils (for high-order func's arg)
     *
     * @singleton
     * @alternateClassName func
     */
    var func = (function () {
        var eq = function (itemA) {
            return function (itemB) {
                return itemA === itemB;
            };
        };

        var eq2 = function (itemA, itemB) {
            return itemA === itemB;
        };

        var peq2 = function (propName) {
            return function (itemA, itemB) {
                return itemA[propName] === itemB[propName];
            };
        };

        var ok = function () {
            return true;
        };

        var fail = function () {
            return false;
        };

        var not = function (f) {
            return function () {
                return !f.apply(f, arguments);
            };
        };

        var and = function (fA, fB) {
            return function (item) {
                return fA(item) && fB(item);
            };
        };

        var self = function (a) {
            return a;
        };

        var idCounter = 0;

        /**
         * generate a globally-unique id
         *
         * @param {String} [prefix]
         */
        var uniqueId = function (prefix) {
            var id = ++idCounter + '';
            return prefix ? prefix + id : id;
        };

        /**
         * returns bnd (bounds) from rect
         *
         * - IE Compatability Issue: http://goo.gl/sRLOAo
         * - Scroll Issue: http://goo.gl/sNjUc
         *
         * @param {Rect} rect
         * @return {Object} bounds
         * @return {Number} bounds.top
         * @return {Number} bounds.left
         * @return {Number} bounds.width
         * @return {Number} bounds.height
         */
        var rect2bnd = function (rect) {
            var $document = $(document);
            return {
                top: rect.top + $document.scrollTop(),
                left: rect.left + $document.scrollLeft(),
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        };

        /**
         * returns a copy of the object where the keys have become the values and the values the keys.
         * @param {Object} obj
         * @return {Object}
         */
        var invertObject = function (obj) {
            var inverted = {};
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    inverted[obj[key]] = key;
                }
            }
            return inverted;
        };

        return {
            eq: eq,
            eq2: eq2,
            peq2: peq2,
            ok: ok,
            fail: fail,
            self: self,
            not: not,
            and: and,
            uniqueId: uniqueId,
            rect2bnd: rect2bnd,
            invertObject: invertObject
        };
    })();

    /**
     * @class core.list
     *
     * list utils
     *
     * @singleton
     * @alternateClassName list
     */
    var list = (function () {
        /**
         * returns the first item of an array.
         *
         * @param {Array} array
         */
        var head = function (array) {
            return array[0];
        };

        /**
         * returns the last item of an array.
         *
         * @param {Array} array
         */
        var last = function (array) {
            return array[array.length - 1];
        };

        /**
         * returns everything but the last entry of the array.
         *
         * @param {Array} array
         */
        var initial = function (array) {
            return array.slice(0, array.length - 1);
        };

        /**
         * returns the rest of the items in an array.
         *
         * @param {Array} array
         */
        var tail = function (array) {
            return array.slice(1);
        };

        /**
         * returns item of array
         */
        var find = function (array, pred) {
            for (var idx = 0, len = array.length; idx < len; idx++) {
                var item = array[idx];
                if (pred(item)) {
                    return item;
                }
            }
        };

        /**
         * returns true if all of the values in the array pass the predicate truth test.
         */
        var all = function (array, pred) {
            for (var idx = 0, len = array.length; idx < len; idx++) {
                if (!pred(array[idx])) {
                    return false;
                }
            }
            return true;
        };

        /**
         * returns true if the value is present in the list.
         */
        var contains = function (array, item) {
            return $.inArray(item, array) !== -1;
        };

        /**
         * get sum from a list
         *
         * @param {Array} array - array
         * @param {Function} fn - iterator
         */
        var sum = function (array, fn) {
            fn = fn || func.self;
            return array.reduce(function (memo, v) {
                return memo + fn(v);
            }, 0);
        };

        /**
         * returns a copy of the collection with array type.
         * @param {Collection} collection - collection eg) node.childNodes, ...
         */
        var from = function (collection) {
            var result = [],
                idx = -1,
                length = collection.length;
            while (++idx < length) {
                result[idx] = collection[idx];
            }
            return result;
        };

        /**
         * cluster elements by predicate function.
         *
         * @param {Array} array - array
         * @param {Function} fn - predicate function for cluster rule
         * @param {Array[]}
         */
        var clusterBy = function (array, fn) {
            if (!array.length) {
                return [];
            }
            var aTail = tail(array);
            return aTail.reduce(function (memo, v) {
                var aLast = last(memo);
                if (fn(last(aLast), v)) {
                    aLast[aLast.length] = v;
                } else {
                    memo[memo.length] = [v];
                }
                return memo;
            }, [
                [head(array)]
            ]);
        };

        /**
         * returns a copy of the array with all falsy values removed
         *
         * @param {Array} array - array
         * @param {Function} fn - predicate function for cluster rule
         */
        var compact = function (array) {
            var aResult = [];
            for (var idx = 0, len = array.length; idx < len; idx++) {
                if (array[idx]) {
                    aResult.push(array[idx]);
                }
            }
            return aResult;
        };

        /**
         * produces a duplicate-free version of the array
         *
         * @param {Array} array
         */
        var unique = function (array) {
            var results = [];

            for (var idx = 0, len = array.length; idx < len; idx++) {
                if (!contains(results, array[idx])) {
                    results.push(array[idx]);
                }
            }

            return results;
        };

        /**
         * returns next item.
         * @param {Array} array
         */
        var next = function (array, item) {
            var idx = array.indexOf(item);
            if (idx === -1) {
                return null;
            }

            return array[idx + 1];
        };

        /**
         * returns prev item.
         * @param {Array} array
         */
        var prev = function (array, item) {
            var idx = array.indexOf(item);
            if (idx === -1) {
                return null;
            }

            return array[idx - 1];
        };


        return {
            head: head,
            last: last,
            initial: initial,
            tail: tail,
            prev: prev,
            next: next,
            find: find,
            contains: contains,
            all: all,
            sum: sum,
            from: from,
            clusterBy: clusterBy,
            compact: compact,
            unique: unique
        };
    })();


    var NBSP_CHAR = String.fromCharCode(160);
    var ZERO_WIDTH_NBSP_CHAR = '\ufeff';

    /**
     * @class core.dom
     *
     * Dom functions
     *
     * @singleton
     * @alternateClassName dom
     */
    var dom = (function () {
        /**
         * @method isEditable
         *
         * returns whether node is `note-editable` or not.
         *
         * @param {Node} node
         * @return {Boolean}
         */
        var isEditable = function (node) {
            return node && $(node).hasClass('note-editable');
        };

        /**
         * @method  buildLayoutInfo
         *
         * build layoutInfo from $editor(.note-editor)
         *
         * @param {jQuery} $editor
         * @return {Object}
         * @return {Function} return.editor
         * @return {Node} return.dropzone
         * @return {Node} return.toolbar
         * @return {Node} return.editable
         * @return {Node} return.codable
         * @return {Node} return.popover
         * @return {Node} return.handle
         * @return {Node} return.dialog
         */
        var buildLayoutInfo = function ($editor) {
            var makeFinder;

            makeFinder = function (sClassName) {
                return function () {
                    return $editor.find(sClassName);
                };
            };
            return {
                editor: function () {
                    return $editor;
                },
                holder: function () {
                    return $editor.data('holder');
                },
                editable: makeFinder('.note-editable')
            };
        };

        /**
         * @method makePredByNodeName
         *
         * returns predicate which judge whether nodeName is same
         *
         * @param {String} nodeName
         * @return {Function}
         */
        var makePredByNodeName = function (nodeName) {
            nodeName = nodeName.toUpperCase();
            return function (node) {
                return node && node.nodeName.toUpperCase() === nodeName;
            };
        };

        /**
         * @method isText
         *
         *
         *
         * @param {Node} node
         * @return {Boolean} true if node's type is text(3)
         */
        var isText = function (node) {
            return node && node.nodeType === 3;
        };

        /**
         * ex) br, col, embed, hr, img, input, ...
         * @see http://www.w3.org/html/wg/drafts/html/master/syntax.html#void-elements
         */
        var isVoid = function (node) {
            return node && /^BR|^IMG|^HR/.test(node.nodeName.toUpperCase());
        };

        var isPara = function (node) {
            if (isEditable(node)) {
                return false;
            }

            // Chrome(v31.0), FF(v25.0.1) use DIV for paragraph
            return node && /^DIV|^P|^LI|^H[1-7]/.test(node.nodeName.toUpperCase());
        };

        var isInline = function (node) {
            return !isBodyContainer(node) &&
                !isPara(node);
        };

        var isBodyContainer = function (node) {
            return isEditable(node);
        };

        var isParaInline = function (node) {
            return isInline(node) && !!ancestor(node, isPara);
        };

        var isBodyInline = function (node) {
            return isInline(node) && !ancestor(node, isPara);
        };

        var isBody = makePredByNodeName('BODY');

        /**
         * returns whether nodeB is closest sibling of nodeA
         *
         * @param {Node} nodeA
         * @param {Node} nodeB
         * @return {Boolean}
         */
        var isClosestSibling = function (nodeA, nodeB) {
            return nodeA.nextSibling === nodeB ||
                nodeA.previousSibling === nodeB;
        };

        /**
         * returns array of closest siblings with node
         *
         * @param {Node} node
         * @param {function} [pred] - predicate function
         * @return {Node[]}
         */
        var withClosestSiblings = function (node, pred) {
            pred = pred || func.ok;

            var siblings = [];
            if (node.previousSibling && pred(node.previousSibling)) {
                siblings.push(node.previousSibling);
            }
            siblings.push(node);
            if (node.nextSibling && pred(node.nextSibling)) {
                siblings.push(node.nextSibling);
            }
            return siblings;
        };

        /**
         * blank HTML for cursor position
         */
        var blankHTML = agent.isMSIE ? '&nbsp;' : '<br>';

        /**
         * @method nodeLength
         *
         * returns #text's text size or element's childNodes size
         *
         * @param {Node} node
         */
        var nodeLength = function (node) {
            if (isText(node)) {
                return node.nodeValue.length;
            }

            return node.childNodes.length;
        };

        /**
         * returns whether node is empty or not.
         *
         * @param {Node} node
         * @return {Boolean}
         */
        var isEmpty = function (node) {
            var len = nodeLength(node);

            if (len === 0) {
                return true;
            } else if (!dom.isText(node) && len === 1 && node.innerHTML === blankHTML) {
                // ex) <p><br></p>, <span><br></span>
                return true;
            }

            return false;
        };

        /**
         * padding blankHTML if node is empty (for cursor position)
         */
        var paddingBlankHTML = function (node) {
            if (!isVoid(node) && !nodeLength(node)) {
                node.innerHTML = blankHTML;
            }
        };

        /**
         * find nearest ancestor predicate hit
         *
         * @param {Node} node
         * @param {Function} pred - predicate function
         */
        var ancestor = function (node, pred) {
            while (node) {
                if (pred(node)) {
                    return node;
                }
                if (isEditable(node)) {
                    break;
                }

                node = node.parentNode;
            }
            return null;
        };

        /**
         * find nearest ancestor only single child blood line and predicate hit
         *
         * @param {Node} node
         * @param {Function} pred - predicate function
         */
        var singleChildAncestor = function (node, pred) {
            node = node.parentNode;

            while (node) {
                if (nodeLength(node) !== 1) {
                    break;
                }
                if (pred(node)) {
                    return node;
                }
                if (isEditable(node)) {
                    break;
                }

                node = node.parentNode;
            }
            return null;
        };

        /**
         * returns new array of ancestor nodes (until predicate hit).
         *
         * @param {Node} node
         * @param {Function} [optional] pred - predicate function
         */
        var listAncestor = function (node, pred) {
            pred = pred || func.fail;

            var ancestors = [];
            ancestor(node, function (el) {
                if (!isEditable(el)) {
                    ancestors.push(el);
                }

                return pred(el);
            });
            return ancestors;
        };

        /**
         * find farthest ancestor predicate hit
         */
        var lastAncestor = function (node, pred) {
            var ancestors = listAncestor(node);
            return list.last(ancestors.filter(pred));
        };

        /**
         * returns common ancestor node between two nodes.
         *
         * @param {Node} nodeA
         * @param {Node} nodeB
         */
        var commonAncestor = function (nodeA, nodeB) {
            var ancestors = listAncestor(nodeA);
            for (var n = nodeB; n; n = n.parentNode) {
                if ($.inArray(n, ancestors) > -1) {
                    return n;
                }
            }
            return null; // difference document area
        };

        /**
         * listing all previous siblings (until predicate hit).
         *
         * @param {Node} node
         * @param {Function} [optional] pred - predicate function
         */
        var listPrev = function (node, pred) {
            pred = pred || func.fail;

            var nodes = [];
            while (node) {
                if (pred(node)) {
                    break;
                }
                nodes.push(node);
                node = node.previousSibling;
            }
            return nodes;
        };

        /**
         * listing next siblings (until predicate hit).
         *
         * @param {Node} node
         * @param {Function} [pred] - predicate function
         */
        var listNext = function (node, pred) {
            pred = pred || func.fail;

            var nodes = [];
            while (node) {
                if (pred(node)) {
                    break;
                }
                nodes.push(node);
                node = node.nextSibling;
            }
            return nodes;
        };

        /**
         * listing descendant nodes
         *
         * @param {Node} node
         * @param {Function} [pred] - predicate function
         */
        var listDescendant = function (node, pred) {
            var descendents = [];
            pred = pred || func.ok;

            // start DFS(depth first search) with node
            (function fnWalk(current) {
                if (node !== current && pred(current)) {
                    descendents.push(current);
                }
                for (var idx = 0, len = current.childNodes.length; idx < len; idx++) {
                    fnWalk(current.childNodes[idx]);
                }
            })(node);

            return descendents;
        };

        /**
         * wrap node with new tag.
         *
         * @param {Node} node
         * @param {Node} tagName of wrapper
         * @return {Node} - wrapper
         */
        var wrap = function (node, wrapperName) {
            var parent = node.parentNode;
            var wrapper = $('<' + wrapperName + '>')[0];

            parent.insertBefore(wrapper, node);
            wrapper.appendChild(node);

            return wrapper;
        };

        /**
         * insert node after preceding
         *
         * @param {Node} node
         * @param {Node} preceding - predicate function
         */
        var insertAfter = function (node, preceding) {
            var next = preceding.nextSibling,
                parent = preceding.parentNode;
            if (next) {
                parent.insertBefore(node, next);
            } else {
                parent.appendChild(node);
            }
            return node;
        };

        /**
         * append elements.
         *
         * @param {Node} node
         * @param {Collection} aChild
         */
        var appendChildNodes = function (node, aChild) {
            $.each(aChild, function (idx, child) {
                node.appendChild(child);
            });
            return node;
        };

        /**
         * returns whether boundaryPoint is left edge or not.
         *
         * @param {BoundaryPoint} point
         * @return {Boolean}
         */
        var isLeftEdgePoint = function (point) {
            return point.offset === 0;
        };

        /**
         * returns whether boundaryPoint is right edge or not.
         *
         * @param {BoundaryPoint} point
         * @return {Boolean}
         */
        var isRightEdgePoint = function (point) {
            return point.offset === nodeLength(point.node);
        };

        /**
         * returns whether boundaryPoint is edge or not.
         *
         * @param {BoundaryPoint} point
         * @return {Boolean}
         */
        var isEdgePoint = function (point) {
            return isLeftEdgePoint(point) || isRightEdgePoint(point);
        };

        /**
         * returns wheter node is left edge of ancestor or not.
         *
         * @param {Node} node
         * @param {Node} ancestor
         * @return {Boolean}
         */
        var isLeftEdgeOf = function (node, ancestor) {
            while (node && node !== ancestor) {
                if (position(node) !== 0) {
                    return false;
                }
                node = node.parentNode;
            }

            return true;
        };

        /**
         * returns whether node is right edge of ancestor or not.
         *
         * @param {Node} node
         * @param {Node} ancestor
         * @return {Boolean}
         */
        var isRightEdgeOf = function (node, ancestor) {
            while (node && node !== ancestor) {
                if (position(node) !== nodeLength(node.parentNode) - 1) {
                    return false;
                }
                node = node.parentNode;
            }

            return true;
        };

        /**
         * returns offset from parent.
         *
         * @param {Node} node
         */
        var position = function (node) {
            var offset = 0;
            while ((node = node.previousSibling)) {
                offset += 1;
            }
            return offset;
        };

        var hasChildren = function (node) {
            return !!(node && node.childNodes && node.childNodes.length);
        };

        /**
         * returns previous boundaryPoint
         *
         * @param {BoundaryPoint} point
         * @param {Boolean} isSkipInnerOffset
         * @return {BoundaryPoint}
         */
        var prevPoint = function (point, isSkipInnerOffset) {
            var node, offset;

            if (point.offset === 0) {
                if (isEditable(point.node)) {
                    return null;
                }

                node = point.node.parentNode;
                offset = position(point.node);
            } else if (hasChildren(point.node)) {
                node = point.node.childNodes[point.offset - 1];
                offset = nodeLength(node);
            } else {
                node = point.node;
                offset = isSkipInnerOffset ? 0 : point.offset - 1;
            }

            return {
                node: node,
                offset: offset
            };
        };

        /**
         * returns next boundaryPoint
         *
         * @param {BoundaryPoint} point
         * @param {Boolean} isSkipInnerOffset
         * @return {BoundaryPoint}
         */
        var nextPoint = function (point, isSkipInnerOffset) {
            var node, offset;

            if (nodeLength(point.node) === point.offset) {
                if (isEditable(point.node)) {
                    return null;
                }

                node = point.node.parentNode;
                offset = position(point.node) + 1;
            } else if (hasChildren(point.node)) {
                node = point.node.childNodes[point.offset];
                offset = 0;
            } else {
                node = point.node;
                offset = isSkipInnerOffset ? nodeLength(point.node) : point.offset + 1;
            }

            return {
                node: node,
                offset: offset
            };
        };

        /**
         * returns whether pointA and pointB is same or not.
         *
         * @param {BoundaryPoint} pointA
         * @param {BoundaryPoint} pointB
         * @return {Boolean}
         */
        var isSamePoint = function (pointA, pointB) {
            return pointA.node === pointB.node && pointA.offset === pointB.offset;
        };

        /**
         * returns whether point is visible (can set cursor) or not.
         *
         * @param {BoundaryPoint} point
         * @return {Boolean}
         */
        var isVisiblePoint = function (point) {
            if (isText(point.node) || !hasChildren(point.node) || isEmpty(point.node)) {
                return true;
            }

            var leftNode = point.node.childNodes[point.offset - 1];
            var rightNode = point.node.childNodes[point.offset];
            if ((!leftNode || isVoid(leftNode)) && (!rightNode || isVoid(rightNode))) {
                return true;
            }

            return false;
        };

        /**
         * @method prevPointUtil
         *
         * @param {BoundaryPoint} point
         * @param {Function} pred
         * @return {BoundaryPoint}
         */
        var prevPointUntil = function (point, pred) {
            while (point) {
                if (pred(point)) {
                    return point;
                }

                point = prevPoint(point);
            }

            return null;
        };

        /**
         * @method nextPointUntil
         *
         * @param {BoundaryPoint} point
         * @param {Function} pred
         * @return {BoundaryPoint}
         */
        var nextPointUntil = function (point, pred) {
            while (point) {
                if (pred(point)) {
                    return point;
                }

                point = nextPoint(point);
            }

            return null;
        };

        /**
         * @method walkPoint
         *
         * @param {BoundaryPoint} startPoint
         * @param {BoundaryPoint} endPoint
         * @param {Function} handler
         * @param {Boolean} isSkipInnerOffset
         */
        var walkPoint = function (startPoint, endPoint, handler, isSkipInnerOffset) {
            var point = startPoint;

            while (point) {
                handler(point);

                if (isSamePoint(point, endPoint)) {
                    break;
                }

                var isSkipOffset = isSkipInnerOffset &&
                    startPoint.node !== point.node &&
                    endPoint.node !== point.node;
                point = nextPoint(point, isSkipOffset);
            }
        };

        /**
         * @method makeOffsetPath
         *
         * return offsetPath(array of offset) from ancestor
         *
         * @param {Node} ancestor - ancestor node
         * @param {Node} node
         */
        var makeOffsetPath = function (ancestor, node) {
            var ancestors = listAncestor(node, func.eq(ancestor));
            return $.map(ancestors, position).reverse();
        };

        /**
         * @method fromOffsetPath
         *
         * return element from offsetPath(array of offset)
         *
         * @param {Node} ancestor - ancestor node
         * @param {array} offsets - offsetPath
         */
        var fromOffsetPath = function (ancestor, offsets) {
            var current = ancestor;
            for (var i = 0, len = offsets.length; i < len; i++) {
                if (current.childNodes.length <= offsets[i]) {
                    current = current.childNodes[current.childNodes.length - 1];
                } else {
                    current = current.childNodes[offsets[i]];
                }
            }
            return current;
        };

        /**
         * @method splitNode
         *
         * split element or #text
         *
         * @param {BoundaryPoint} point
         * @param {Boolean} [isSkipPaddingBlankHTML]
         * @return {Node} right node of boundaryPoint
         */
        var splitNode = function (point, isSkipPaddingBlankHTML) {
            // split #text
            if (isText(point.node)) {
                // edge case
                if (isLeftEdgePoint(point)) {
                    return point.node;
                } else if (isRightEdgePoint(point)) {
                    return point.node.nextSibling;
                }

                return point.node.splitText(point.offset);
            }

            // split element
            var childNode = point.node.childNodes[point.offset];
            var clone = insertAfter(point.node.cloneNode(false), point.node);
            appendChildNodes(clone, listNext(childNode));

            if (!isSkipPaddingBlankHTML) {
                paddingBlankHTML(point.node);
                paddingBlankHTML(clone);
            }

            return clone;
        };

        /**
         * @method splitTree
         *
         * split tree by point
         *
         * @param {Node} root - split root
         * @param {BoundaryPoint} point
         * @param {Boolean} [isSkipPaddingBlankHTML]
         * @return {Node} right node of boundaryPoint
         */
        var splitTree = function (root, point, isSkipPaddingBlankHTML) {
            // ex) [#text, <span>, <p>]
            var ancestors = listAncestor(point.node, func.eq(root));

            if (!ancestors.length) {
                return null;
            } else if (ancestors.length === 1) {
                return splitNode(point, isSkipPaddingBlankHTML);
            }

            return ancestors.reduce(function (node, parent) {
                var clone = insertAfter(parent.cloneNode(false), parent);

                if (node === point.node) {
                    node = splitNode(point, isSkipPaddingBlankHTML);
                }

                appendChildNodes(clone, listNext(node));

                if (!isSkipPaddingBlankHTML) {
                    paddingBlankHTML(parent);
                    paddingBlankHTML(clone);
                }
                return clone;
            });
        };

        /**
         * split point
         *
         * @param {Point} point
         * @param {Boolean} isInline
         * @return {Object}
         */
        var splitPoint = function (point, isInline) {
            // find splitRoot, container
            //  - inline: splitRoot is a child of paragraph
            //  - block: splitRoot is a child of bodyContainer
            var pred = isInline ? isPara : isBodyContainer;
            var ancestors = listAncestor(point.node, pred);
            var topAncestor = list.last(ancestors) || point.node;

            var splitRoot, container;
            if (pred(topAncestor)) {
                splitRoot = ancestors[ancestors.length - 2];
                container = topAncestor;
            } else {
                splitRoot = topAncestor;
                container = splitRoot.parentNode;
            }

            // split with splitTree
            var pivot = splitRoot && splitTree(splitRoot, point, isInline);

            return {
                rightNode: pivot,
                container: container
            };
        };

        var create = function (nodeName) {
            return document.createElement(nodeName);
        };

        var createText = function (text) {
            return document.createTextNode(text);
        };

        /**
         * @method remove
         *
         * remove node, (isRemoveChild: remove child or not)
         *
         * @param {Node} node
         * @param {Boolean} isRemoveChild
         */
        var remove = function (node, isRemoveChild) {
            if (!node || !node.parentNode) {
                return;
            }
            if (node.removeNode) {
                return node.removeNode(isRemoveChild);
            }

            var parent = node.parentNode;
            if (!isRemoveChild) {
                var nodes = [];
                var i, len;
                for (i = 0, len = node.childNodes.length; i < len; i++) {
                    nodes.push(node.childNodes[i]);
                }

                for (i = 0, len = nodes.length; i < len; i++) {
                    parent.insertBefore(nodes[i], node);
                }
            }

            parent.removeChild(node);
        };

        /**
         * @method removeWhile
         *
         * @param {Node} node
         * @param {Function} pred
         */
        var removeWhile = function (node, pred) {
            while (node) {
                if (isEditable(node) || !pred(node)) {
                    break;
                }

                var parent = node.parentNode;
                remove(node);
                node = parent;
            }
        };

        /**
         * @method replace
         *
         * replace node with provided nodeName
         *
         * @param {Node} node
         * @param {String} nodeName
         * @return {Node} - new node
         */
        var replace = function (node, nodeName) {
            if (node.nodeName.toUpperCase() === nodeName.toUpperCase()) {
                return node;
            }

            var newNode = create(nodeName);

            if (node.style.cssText) {
                newNode.style.cssText = node.style.cssText;
            }

            appendChildNodes(newNode, list.from(node.childNodes));
            insertAfter(newNode, node);
            remove(node);

            return newNode;
        };

        var isTextarea = makePredByNodeName('TEXTAREA');

        /**
         * @method html
         *
         * get the HTML contents of node
         *
         * @param {jQuery} $node
         * @param {Boolean} [isNewlineOnBlock]
         */
        var html = function ($node, isNewlineOnBlock) {
            var markup = isTextarea($node[0]) ? $node.val() : $node.html();

            if (isNewlineOnBlock) {
                var regexTag = /<(\/?)(\b(?!!)[^>\s]*)(.*?)(\s*\/?>)/g;
                markup = markup.replace(regexTag, function (match, endSlash, name) {
                    name = name.toUpperCase();
                    var isEndOfInlineContainer = /^DIV|^TD|^TH|^P|^LI|^H[1-7]/.test(name) &&
                        !!endSlash;
                    var isBlockNode = /^BLOCKQUOTE|^TABLE|^TBODY|^TR|^HR|^UL|^OL/.test(name);

                    return match + ((isEndOfInlineContainer || isBlockNode) ? '\n' : '');
                });
                markup = $.trim(markup);
            }

            return markup;
        };

        var value = function ($textarea, stripLinebreaks) {
            var val = $textarea.val();
            if (stripLinebreaks) {
                return val.replace(/[\n\r]/g, '');
            }
            return val;
        };

        return {
            /** @property {String} NBSP_CHAR */
            NBSP_CHAR: NBSP_CHAR,
            /** @property {String} ZERO_WIDTH_NBSP_CHAR */
            ZERO_WIDTH_NBSP_CHAR: ZERO_WIDTH_NBSP_CHAR,
            /** @property {String} blank */
            blank: blankHTML,
            /** @property {String} emptyPara */
            emptyPara: '<p>' + blankHTML + '</p>',
            makePredByNodeName: makePredByNodeName,
            isEditable: isEditable,
            buildLayoutInfo: buildLayoutInfo,
            isText: isText,
            isVoid: isVoid,
            isPara: isPara,
            isInline: isInline,
            isBodyInline: isBodyInline,
            isBody: isBody,
            isParaInline: isParaInline,
            isBodyContainer: isBodyContainer,
            isDiv: makePredByNodeName('DIV'),
            isBR: makePredByNodeName('BR'),
            isSpan: makePredByNodeName('SPAN'),
            isB: makePredByNodeName('B'),
            isU: makePredByNodeName('U'),
            isS: makePredByNodeName('S'),
            isI: makePredByNodeName('I'),
            isImg: makePredByNodeName('IMG'),
            isTextarea: isTextarea,
            isEmpty: isEmpty,
            isClosestSibling: isClosestSibling,
            withClosestSiblings: withClosestSiblings,
            nodeLength: nodeLength,
            isLeftEdgePoint: isLeftEdgePoint,
            isRightEdgePoint: isRightEdgePoint,
            isEdgePoint: isEdgePoint,
            isLeftEdgeOf: isLeftEdgeOf,
            isRightEdgeOf: isRightEdgeOf,
            prevPoint: prevPoint,
            nextPoint: nextPoint,
            isSamePoint: isSamePoint,
            isVisiblePoint: isVisiblePoint,
            prevPointUntil: prevPointUntil,
            nextPointUntil: nextPointUntil,
            walkPoint: walkPoint,
            ancestor: ancestor,
            singleChildAncestor: singleChildAncestor,
            listAncestor: listAncestor,
            lastAncestor: lastAncestor,
            listNext: listNext,
            listPrev: listPrev,
            listDescendant: listDescendant,
            commonAncestor: commonAncestor,
            wrap: wrap,
            insertAfter: insertAfter,
            appendChildNodes: appendChildNodes,
            position: position,
            hasChildren: hasChildren,
            makeOffsetPath: makeOffsetPath,
            fromOffsetPath: fromOffsetPath,
            splitTree: splitTree,
            splitPoint: splitPoint,
            create: create,
            createText: createText,
            remove: remove,
            removeWhile: removeWhile,
            replace: replace,
            html: html,
            value: value
        };
    })();


    var range = (function () {

        /**
         * return boundaryPoint from TextRange, inspired by Andy Na's HuskyRange.js
         *
         * @param {TextRange} textRange
         * @param {Boolean} isStart
         * @return {BoundaryPoint}
         *
         * @see http://msdn.microsoft.com/en-us/library/ie/ms535872(v=vs.85).aspx
         */
        var textRangeToPoint = function (textRange, isStart) {
            var container = textRange.parentElement(),
                offset;

            var tester = document.body.createTextRange(),
                prevContainer;
            var childNodes = list.from(container.childNodes);
            for (offset = 0; offset < childNodes.length; offset++) {
                if (dom.isText(childNodes[offset])) {
                    continue;
                }
                tester.moveToElementText(childNodes[offset]);
                if (tester.compareEndPoints('StartToStart', textRange) >= 0) {
                    break;
                }
                prevContainer = childNodes[offset];
            }

            if (offset !== 0 && dom.isText(childNodes[offset - 1])) {
                var textRangeStart = document.body.createTextRange(),
                    curTextNode = null;
                textRangeStart.moveToElementText(prevContainer || container);
                textRangeStart.collapse(!prevContainer);
                curTextNode = prevContainer ? prevContainer.nextSibling : container.firstChild;

                var pointTester = textRange.duplicate();
                pointTester.setEndPoint('StartToStart', textRangeStart);
                var textCount = pointTester.text.replace(/[\r\n]/g, '').length;

                while (textCount > curTextNode.nodeValue.length && curTextNode.nextSibling) {
                    textCount -= curTextNode.nodeValue.length;
                    curTextNode = curTextNode.nextSibling;
                }

                /* jshint ignore:start */
                var dummy = curTextNode.nodeValue; // enforce IE to re-reference curTextNode, hack
                /* jshint ignore:end */

                if (isStart && curTextNode.nextSibling && dom.isText(curTextNode.nextSibling) &&
                    textCount === curTextNode.nodeValue.length) {
                    textCount -= curTextNode.nodeValue.length;
                    curTextNode = curTextNode.nextSibling;
                }

                container = curTextNode;
                offset = textCount;
            }

            return {
                cont: container,
                offset: offset
            };
        };

        /**
         * return TextRange from boundary point (inspired by google closure-library)
         * @param {BoundaryPoint} point
         * @return {TextRange}
         */
        var pointToTextRange = function (point) {
            var textRangeInfo = function (container, offset) {
                var node, isCollapseToStart;

                if (dom.isText(container)) {
                    var prevTextNodes = dom.listPrev(container, func.not(dom.isText));
                    var prevContainer = list.last(prevTextNodes).previousSibling;
                    node = prevContainer || container.parentNode;
                    offset += list.sum(list.tail(prevTextNodes), dom.nodeLength);
                    isCollapseToStart = !prevContainer;
                } else {
                    node = container.childNodes[offset] || container;
                    if (dom.isText(node)) {
                        return textRangeInfo(node, 0);
                    }

                    offset = 0;
                    isCollapseToStart = false;
                }

                return {
                    node: node,
                    collapseToStart: isCollapseToStart,
                    offset: offset
                };
            };

            var textRange = document.body.createTextRange();
            var info = textRangeInfo(point.node, point.offset);

            textRange.moveToElementText(info.node);
            textRange.collapse(info.collapseToStart);
            textRange.moveStart('character', info.offset);
            return textRange;
        };

        /**
         * Wrapped Range
         *
         * @constructor
         * @param {Node} sc - start container
         * @param {Number} so - start offset
         * @param {Node} ec - end container
         * @param {Number} eo - end offset
         */
        var WrappedRange = function (sc, so, ec, eo) {
            this.sc = sc;
            this.so = so;
            this.ec = ec;
            this.eo = eo;

            // nativeRange: get nativeRange from sc, so, ec, eo
            var nativeRange = function () {
                if (agent.isW3CRangeSupport) {
                    var w3cRange = document.createRange();
                    w3cRange.setStart(sc, so);
                    w3cRange.setEnd(ec, eo);

                    return w3cRange;
                } else {
                    var textRange = pointToTextRange({
                        node: sc,
                        offset: so
                    });

                    textRange.setEndPoint('EndToEnd', pointToTextRange({
                        node: ec,
                        offset: eo
                    }));

                    return textRange;
                }
            };

            this.getPoints = function () {
                return {
                    sc: sc,
                    so: so,
                    ec: ec,
                    eo: eo
                };
            };

            this.getStartPoint = function () {
                return {
                    node: sc,
                    offset: so
                };
            };

            this.getEndPoint = function () {
                return {
                    node: ec,
                    offset: eo
                };
            };

            /**
             * select update visible range
             */
            this.select = function () {
                var nativeRng = nativeRange();
                if (agent.isW3CRangeSupport) {
                    var selection = document.getSelection();
                    if (selection.rangeCount > 0) {
                        selection.removeAllRanges();
                    }
                    selection.addRange(nativeRng);
                } else {
                    nativeRng.select();
                }
            };

            /**
             * @return {WrappedRange}
             */
            this.normalize = function () {

                /**
                 * @param {BoundaryPoint} point
                 * @return {BoundaryPoint}
                 */
                var getVisiblePoint = function (point) {
                    if (!dom.isVisiblePoint(point)) {
                        if (dom.isLeftEdgePoint(point)) {
                            point = dom.nextPointUntil(point, dom.isVisiblePoint);
                        } else {
                            point = dom.prevPointUntil(point, dom.isVisiblePoint);
                        }
                    }
                    return point;
                };

                var startPoint = getVisiblePoint(this.getStartPoint());
                var endPoint = getVisiblePoint(this.getEndPoint());

                return new WrappedRange(
                    startPoint.node,
                    startPoint.offset,
                    endPoint.node,
                    endPoint.offset
                );
            };

            /**
             * returns matched nodes on range
             *
             * @param {Function} [pred] - predicate function
             * @param {Object} [options]
             * @param {Boolean} [options.includeAncestor]
             * @param {Boolean} [options.fullyContains]
             * @return {Node[]}
             */
            this.nodes = function (pred, options) {
                pred = pred || func.ok;

                var includeAncestor = options && options.includeAncestor;
                var fullyContains = options && options.fullyContains;

                // TODO compare points and sort
                var startPoint = this.getStartPoint();
                var endPoint = this.getEndPoint();

                var nodes = [];
                var leftEdgeNodes = [];

                dom.walkPoint(startPoint, endPoint, function (point) {
                    if (dom.isEditable(point.node)) {
                        return;
                    }

                    var node;
                    if (fullyContains) {
                        if (dom.isLeftEdgePoint(point)) {
                            leftEdgeNodes.push(point.node);
                        }
                        if (dom.isRightEdgePoint(point) && list.contains(leftEdgeNodes, point.node)) {
                            node = point.node;
                        }
                    } else if (includeAncestor) {
                        node = dom.ancestor(point.node, pred);
                    } else {
                        node = point.node;
                    }

                    if (node && pred(node)) {
                        nodes.push(node);
                    }
                }, true);

                return list.unique(nodes);
            };

            /**
             * returns commonAncestor of range
             * @return {Element} - commonAncestor
             */
            this.commonAncestor = function () {
                return dom.commonAncestor(sc, ec);
            };

            /**
             * returns expanded range by pred
             *
             * @param {Function} pred - predicate function
             * @return {WrappedRange}
             */
            this.expand = function (pred) {
                var startAncestor = dom.ancestor(sc, pred);
                var endAncestor = dom.ancestor(ec, pred);

                if (!startAncestor && !endAncestor) {
                    return new WrappedRange(sc, so, ec, eo);
                }

                var boundaryPoints = this.getPoints();

                if (startAncestor) {
                    boundaryPoints.sc = startAncestor;
                    boundaryPoints.so = 0;
                }

                if (endAncestor) {
                    boundaryPoints.ec = endAncestor;
                    boundaryPoints.eo = dom.nodeLength(endAncestor);
                }

                return new WrappedRange(
                    boundaryPoints.sc,
                    boundaryPoints.so,
                    boundaryPoints.ec,
                    boundaryPoints.eo
                );
            };

            /**
             * @param {Boolean} isCollapseToStart
             * @return {WrappedRange}
             */
            this.collapse = function (isCollapseToStart) {
                if (isCollapseToStart) {
                    return new WrappedRange(sc, so, sc, so);
                } else {
                    return new WrappedRange(ec, eo, ec, eo);
                }
            };

            /**
             * splitText on range
             */
            this.splitText = function () {
                var isSameContainer = sc === ec;
                var boundaryPoints = this.getPoints();

                if (dom.isText(ec) && !dom.isEdgePoint(this.getEndPoint())) {
                    ec.splitText(eo);
                }

                if (dom.isText(sc) && !dom.isEdgePoint(this.getStartPoint())) {
                    boundaryPoints.sc = sc.splitText(so);
                    boundaryPoints.so = 0;

                    if (isSameContainer) {
                        boundaryPoints.ec = boundaryPoints.sc;
                        boundaryPoints.eo = eo - so;
                    }
                }

                return new WrappedRange(
                    boundaryPoints.sc,
                    boundaryPoints.so,
                    boundaryPoints.ec,
                    boundaryPoints.eo
                );
            };

            /**
             * delete contents on range
             * @return {WrappedRange}
             */
            this.deleteContents = function () {
                if (this.isCollapsed()) {
                    return this;
                }

                var rng = this.splitText();
                var nodes = rng.nodes(null, {
                    fullyContains: true
                });

                // find new cursor point
                var point = dom.prevPointUntil(rng.getStartPoint(), function (point) {
                    return !list.contains(nodes, point.node);
                });

                var emptyParents = [];
                $.each(nodes, function (idx, node) {
                    // find empty parents
                    var parent = node.parentNode;
                    if (point.node !== parent && dom.nodeLength(parent) === 1) {
                        emptyParents.push(parent);
                    }
                    dom.remove(node, false);
                });

                // remove empty parents
                $.each(emptyParents, function (idx, node) {
                    dom.remove(node, false);
                });

                return new WrappedRange(
                    point.node,
                    point.offset,
                    point.node,
                    point.offset
                ).normalize();
            };

            /**
             * makeIsOn: return isOn(pred) function
             */
            var makeIsOn = function (pred) {
                return function () {
                    var ancestor = dom.ancestor(sc, pred);
                    return !!ancestor && (ancestor === dom.ancestor(ec, pred));
                };
            };

            // isOnEditable: judge whether range is on editable or not
            this.isOnEditable = makeIsOn(dom.isEditable);

            /**
             * @param {Function} pred
             * @return {Boolean}
             */
            this.isLeftEdgeOf = function (pred) {
                if (!dom.isLeftEdgePoint(this.getStartPoint())) {
                    return false;
                }

                var node = dom.ancestor(this.sc, pred);
                return node && dom.isLeftEdgeOf(this.sc, node);
            };

            /**
             * returns whether range was collapsed or not
             */
            this.isCollapsed = function () {
                return sc === ec && so === eo;
            };

            /**
             * wrap inline nodes which children of body with paragraph
             *
             * @return {WrappedRange}
             */
            this.wrapBodyInlineWithPara = function () {
                if (dom.isBodyContainer(sc) && dom.isEmpty(sc)) {
                    sc.innerHTML = dom.emptyPara;
                    return new WrappedRange(sc.firstChild, 0, sc.firstChild, 0);
                }

                if (dom.isParaInline(sc) || dom.isPara(sc)) {
                    return this.normalize();
                }

                // find inline top ancestor
                var topAncestor;
                if (dom.isInline(sc)) {
                    var ancestors = dom.listAncestor(sc, func.not(dom.isInline));
                    topAncestor = list.last(ancestors);
                    if (!dom.isInline(topAncestor)) {
                        topAncestor = ancestors[ancestors.length - 2] || sc.childNodes[so];
                    }
                } else {
                    topAncestor = sc.childNodes[so > 0 ? so - 1 : 0];
                }

                // siblings not in paragraph
                var inlineSiblings = dom.listPrev(topAncestor, dom.isParaInline).reverse();
                inlineSiblings = inlineSiblings.concat(dom.listNext(topAncestor.nextSibling, dom.isParaInline));

                // wrap with paragraph
                if (inlineSiblings.length) {
                    var para = dom.wrap(list.head(inlineSiblings), 'p');
                    dom.appendChildNodes(para, list.tail(inlineSiblings));
                }

                return this.normalize();
            };

            /**
             * insert node at current cursor
             *
             * @param {Node} node
             * @return {Node}
             */
            this.insertNode = function (node) {
                var rng = this.wrapBodyInlineWithPara().deleteContents();
                var info = dom.splitPoint(rng.getStartPoint(), dom.isInline(node));

                if (info.rightNode) {
                    info.rightNode.parentNode.insertBefore(node, info.rightNode);
                } else {
                    info.container.appendChild(node);
                }

                return node;
            };

            /**
             * returns text in range
             *
             * @return {String}
             */
            this.toString = function () {
                var nativeRng = nativeRange();
                return agent.isW3CRangeSupport ? nativeRng.toString() : nativeRng.text;
            };

            /**
             * create offsetPath bookmark
             *
             * @param {Node} editable
             */
            this.bookmark = function (editable) {
                return {
                    s: {
                        path: dom.makeOffsetPath(editable, sc),
                        offset: so
                    },
                    e: {
                        path: dom.makeOffsetPath(editable, ec),
                        offset: eo
                    }
                };
            };

            /**
             * create offsetPath bookmark base on paragraph
             *
             * @param {Node[]} paras
             */
            this.paraBookmark = function (paras) {
                return {
                    s: {
                        path: list.tail(dom.makeOffsetPath(list.head(paras), sc)),
                        offset: so
                    },
                    e: {
                        path: list.tail(dom.makeOffsetPath(list.last(paras), ec)),
                        offset: eo
                    }
                };
            };

            /**
             * getClientRects
             * @return {Rect[]}
             */
            this.getClientRects = function () {
                var nativeRng = nativeRange();
                return nativeRng.getClientRects();
            };
        };

        /**
         * @class core.range
         *
         * Data structure
         *  * BoundaryPoint: a point of dom tree
         *  * BoundaryPoints: two boundaryPoints corresponding to the start and the end of the Range
         *
         * See to http://www.w3.org/TR/DOM-Level-2-Traversal-Range/ranges.html#Level-2-Range-Position
         *
         * @singleton
         * @alternateClassName range
         */
        return {
            /**
             * @method
             *
             * create Range Object From arguments or Browser Selection
             *
             * @param {Node} sc - start container
             * @param {Number} so - start offset
             * @param {Node} ec - end container
             * @param {Number} eo - end offset
             * @return {WrappedRange}
             */
            create: function (sc, so, ec, eo) {
                if (!arguments.length) { // from Browser Selection
                    if (agent.isW3CRangeSupport) {
                        var selection = document.getSelection();
                        if (selection.rangeCount === 0) {
                            return null;
                        } else if (dom.isBody(selection.anchorNode)) {
                            // Firefox: returns entire body as range on initialization. We won't never need it.
                            return null;
                        }

                        var nativeRng = selection.getRangeAt(0);
                        sc = nativeRng.startContainer;
                        so = nativeRng.startOffset;
                        ec = nativeRng.endContainer;
                        eo = nativeRng.endOffset;
                    } else { // IE8: TextRange
                        var textRange = document.selection.createRange();
                        var textRangeEnd = textRange.duplicate();
                        textRangeEnd.collapse(false);
                        var textRangeStart = textRange;
                        textRangeStart.collapse(true);

                        var startPoint = textRangeToPoint(textRangeStart, true),
                            endPoint = textRangeToPoint(textRangeEnd, false);

                        // same visible point case: range was collapsed.
                        if (dom.isText(startPoint.node) && dom.isLeftEdgePoint(startPoint) &&
                            dom.isTextNode(endPoint.node) && dom.isRightEdgePoint(endPoint) &&
                            endPoint.node.nextSibling === startPoint.node) {
                            startPoint = endPoint;
                        }

                        sc = startPoint.cont;
                        so = startPoint.offset;
                        ec = endPoint.cont;
                        eo = endPoint.offset;
                    }
                } else if (arguments.length === 2) { //collapsed
                    ec = sc;
                    eo = so;
                }
                return new WrappedRange(sc, so, ec, eo);
            },

            /**
             * @method
             *
             * create WrappedRange from node
             *
             * @param {Node} node
             * @return {WrappedRange}
             */
            createFromNode: function (node) {
                var sc = node;
                var so = 0;
                var ec = node;
                var eo = dom.nodeLength(ec);

                // browsers can't target a picture or void node
                if (dom.isVoid(sc)) {
                    so = dom.listPrev(sc).length - 1;
                    sc = sc.parentNode;
                }
                if (dom.isBR(ec)) {
                    eo = dom.listPrev(ec).length - 1;
                    ec = ec.parentNode;
                } else if (dom.isVoid(ec)) {
                    eo = dom.listPrev(ec).length;
                    ec = ec.parentNode;
                }

                return this.create(sc, so, ec, eo);
            },

            /**
             * @method
             *
             * create WrappedRange from bookmark
             *
             * @param {Node} editable
             * @param {Object} bookmark
             * @return {WrappedRange}
             */
            createFromBookmark: function (editable, bookmark) {
                var sc = dom.fromOffsetPath(editable, bookmark.s.path);
                var so = bookmark.s.offset;
                var ec = dom.fromOffsetPath(editable, bookmark.e.path);
                var eo = bookmark.e.offset;
                return new WrappedRange(sc, so, ec, eo);
            },

            /**
             * @method
             *
             * create WrappedRange from paraBookmark
             *
             * @param {Object} bookmark
             * @param {Node[]} paras
             * @return {WrappedRange}
             */
            createFromParaBookmark: function (bookmark, paras) {
                var so = bookmark.s.offset;
                var eo = bookmark.e.offset;
                var sc = dom.fromOffsetPath(list.head(paras), bookmark.s.path);
                var ec = dom.fromOffsetPath(list.last(paras), bookmark.e.path);

                return new WrappedRange(sc, so, ec, eo);
            }
        };
    })();

    /**
     * @class defaults
     *
     * @singleton
     */
    var defaults = {
        /** @property */
        version: '0.0.1',

        /**
         *
         * for event options, reference to EventHandler.attach
         *
         * @property {Object} options
         * @property {String/Number} [options.width=null] set editor width
         * @property {String/Number} [options.height=null] set editor height, ex) 300
         * @property {String/Number} options.minHeight set minimum height of editor
         * @property {String/Number} options.maxHeight
         * @property {String/Number} options.focus
         * @property {Number} options.tabsize
         * @property {Boolean} options.styleWithSpan
         * @property {Fucntion} [options.onInit] initialize
         * @property {Fucntion} [options.onsubmit]
         */
        options: {
            width: null, // set editor width
            height: null, // set editor height, ex) 300

            minHeight: null, // set minimum height of editor
            maxHeight: null, // set maximum height of editor

            focus: false, // set focus to editable area after initializing sunnynote

            tabsize: 4, // size of tab ex) 2 or 4
            styleWithSpan: true, // style with span (Chrome and FF only)

            shortcuts: true, // enable keyboard shortcuts

            // language
            direction: null, // text direction, ex) 'rtl'

            // callbacks
            oninit: null, // initialize
            onfocus: null, // editable has focus
            onblur: null, // editable out of focus
            onenter: null, // enter key pressed
            onkeyup: null, // keyup
            onkeydown: null, // keydown
            onsubmit: null,

            keyMap: {
                pc: {
                    'ENTER': 'insertParagraph',
                    'CTRL+Z': 'undo',
                    'CTRL+Y': 'redo',
                    'CTRL+B': 'bold',
                    'CTRL+I': 'italic',
                    'CTRL+U': 'underline'
                },

                mac: {
                    'ENTER': 'insertParagraph',
                    'CMD+Z': 'undo',
                    'CMD+SHIFT+Z': 'redo',
                    'CMD+B': 'bold',
                    'CMD+I': 'italic',
                    'CMD+U': 'underline'
                }
            }
        }
    };

    /**
     * @class core.key
     *
     * Object for keycodes.
     *
     * @singleton
     * @alternateClassName key
     */
    var key = {
        /**
         * @method isEdit
         *
         * @param {Number} keyCode
         * @return {Boolean}
         */
        isEdit: function (keyCode) {
            return list.contains([8, 9, 13, 32], keyCode);
        },
        /**
         * @property {Object} nameFromCode
         * @property {String} nameFromCode.8 "BACKSPACE"
         */
        nameFromCode: {
            '8': 'BACKSPACE',
            '9': 'TAB',
            '13': 'ENTER',
            '32': 'SPACE',

            // Number: 0-9
            '48': 'NUM0',
            '49': 'NUM1',
            '50': 'NUM2',
            '51': 'NUM3',
            '52': 'NUM4',
            '53': 'NUM5',
            '54': 'NUM6',
            '55': 'NUM7',
            '56': 'NUM8',

            // Alphabet: a-z
            '66': 'B',
            '69': 'E',
            '73': 'I',
            '74': 'J',
            '75': 'K',
            '76': 'L',
            '82': 'R',
            '83': 'S',
            '85': 'U',
            '89': 'Y',
            '90': 'Z',

            '191': 'SLASH',
            '219': 'LEFTBRACKET',
            '220': 'BACKSLASH',
            '221': 'RIGHTBRACKET'
        }
    };

    /**
     * @class editing.History
     *
     * Editor History
     *
     */
    var History = function ($editable) {
        var stack = [],
            stackOffset = -1;
        var editable = $editable[0];

        var makeSnapshot = function () {
            var rng = range.create();
            var emptyBookmark = {
                s: {
                    path: [],
                    offset: 0
                },
                e: {
                    path: [],
                    offset: 0
                }
            };

            return {
                contents: $editable.html(),
                bookmark: (rng ? rng.bookmark(editable) : emptyBookmark)
            };
        };

        var applySnapshot = function (snapshot) {
            if (snapshot.contents !== null) {
                $editable.html(snapshot.contents);
            }
            if (snapshot.bookmark !== null) {
                range.createFromBookmark(editable, snapshot.bookmark).select();
            }
        };

        /**
         * undo
         */
        this.undo = function () {
            if (0 < stackOffset) {
                stackOffset--;
                applySnapshot(stack[stackOffset]);
            }
        };

        /**
         * redo
         */
        this.redo = function () {
            if (stack.length - 1 > stackOffset) {
                stackOffset++;
                applySnapshot(stack[stackOffset]);
            }
        };

        /**
         * recorded undo
         */
        this.recordUndo = function () {
            stackOffset++;

            // Wash out stack after stackOffset
            if (stack.length > stackOffset) {
                stack = stack.slice(0, stackOffset);
            }

            // Create new snapshot and push it to the end
            stack.push(makeSnapshot());
        };

        // Create first undo stack
        this.recordUndo();
    };

    /**
     * @class editing.Style
     *
     * Style
     *
     */
    var Style = function () {
        /**
         * @method jQueryCSS
         *
         * passing an array of style properties to .css()
         * will result in an object of property-value pairs.
         * (compability with version < 1.9)
         *
         * @private
         * @param  {jQuery} $obj
         * @param  {Array} propertyNames - An array of one or more CSS properties.
         * @return {Object}
         */
        var jQueryCSS = function ($obj, propertyNames) {
            if (agent.jqueryVersion < 1.9) {
                var result = {};
                $.each(propertyNames, function (idx, propertyName) {
                    result[propertyName] = $obj.css(propertyName);
                });
                return result;
            }
            return $obj.css.call($obj, propertyNames);
        };

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
         * @param {Node} target - target element on event
         * @return {Object} - object contains style properties.
         */
        this.current = function (rng, target) {
            var $cont = $(dom.isText(rng.sc) ? rng.sc.parentNode : rng.sc);
            var properties = ['font-family', 'font-size', 'text-align', 'list-style-type', 'line-height'];
            var styleInfo = jQueryCSS($cont, properties) || {};

            styleInfo['font-size'] = parseInt(styleInfo['font-size'], 10);

            // document.queryCommandState for toggle state
            styleInfo['font-bold'] = document.queryCommandState('bold') ? 'bold' : 'normal';
            styleInfo['font-italic'] = document.queryCommandState('italic') ? 'italic' : 'normal';
            styleInfo['font-underline'] = document.queryCommandState('underline') ? 'underline' : 'normal';
            styleInfo['font-strikethrough'] = document.queryCommandState('strikeThrough') ? 'strikethrough' : 'normal';
            styleInfo['font-superscript'] = document.queryCommandState('superscript') ? 'superscript' : 'normal';
            styleInfo['font-subscript'] = document.queryCommandState('subscript') ? 'subscript' : 'normal';

            // list-style-type to list-style(unordered, ordered)
            if (!rng.isOnList()) {
                styleInfo['list-style'] = 'none';
            } else {
                var aOrderedType = ['circle', 'disc', 'disc-leading-zero', 'square'];
                var isUnordered = $.inArray(styleInfo['list-style-type'], aOrderedType) > -1;
                styleInfo['list-style'] = isUnordered ? 'unordered' : 'ordered';
            }

            var para = dom.ancestor(rng.sc, dom.isPara);
            if (para && para.style['line-height']) {
                styleInfo['line-height'] = para.style.lineHeight;
            } else {
                var lineHeight = parseInt(styleInfo['line-height'], 10) / parseInt(styleInfo['font-size'], 10);
                styleInfo['line-height'] = lineHeight.toFixed(1);
            }

            styleInfo.image = dom.isImg(target) && target;
            styleInfo.anchor = rng.isOnAnchor() && dom.ancestor(rng.sc, dom.isAnchor);
            styleInfo.ancestors = dom.listAncestor(rng.sc, dom.isEditable);
            styleInfo.range = rng;

            return styleInfo;
        };
    };


    /**
     * @class editing.Typing
     *
     * Typing
     *
     */
    var Typing = function () {

        /**
         * insert tab
         *
         * @param {jQuery} $editable
         * @param {WrappedRange} rng
         * @param {Number} tabsize
         */
        this.insertTab = function ($editable, rng, tabsize) {
            var tab = dom.createText(new Array(tabsize + 1).join(dom.NBSP_CHAR));
            rng = rng.deleteContents();
            rng.insertNode(tab, true);

            rng = range.create(tab, tabsize);
            rng.select();
        };

        /**
         * insert paragraph
         */
        this.insertParagraph = function () {
            var rng = range.create();

            // deleteContents on range.
            rng = rng.deleteContents();

            // Wrap range if it needs to be wrapped by paragraph
            rng = rng.wrapBodyInlineWithPara();

            // finding paragraph
            var splitRoot = dom.ancestor(rng.sc, dom.isPara);

            var nextPara;
            // on paragraph: split paragraph
            if (splitRoot) {
                nextPara = dom.splitTree(splitRoot, rng.getStartPoint());
            } else {
                var next = rng.sc.childNodes[rng.so];
                nextPara = $(dom.emptyPara)[0];
                if (next) {
                    rng.sc.insertBefore(nextPara, next);
                } else {
                    rng.sc.appendChild(nextPara);
                }
            }

            range.create(nextPara, 0).normalize().select();
        };

    };

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
        this.currentStyle = function (target) {
            var rng = range.create();
            return rng ? rng.isOnEditable() && style.current(rng, target) : false;
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
                    if (modules.editor[eventName]) {
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

        };

        this.detach = function (layoutInfo) {
            layoutInfo.holder().off();
            layoutInfo.editable().off();

        };
    };

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


    // jQuery namespace for sunnynote
    /**
     * @class $.sunnynote
     *
     * sunnynote attribute
     *
     * @mixin defaults
     * @singleton
     *
     */
    $.sunnynote = $.sunnynote || {};

    // extends default settings
    //  - $.sunnynote.version
    //  - $.sunnynote.options
    //  - $.sunnynote.lang
    $.extend($.sunnynote, defaults);

    var renderer = new Renderer();
    var eventHandler = new EventHandler();

    $.extend($.sunnynote, {
        /** @property {Renderer} */
        renderer: renderer,
        /** @property {EventHandler} */
        eventHandler: eventHandler,
        /** 
         * @property {Object} core
         * @property {core.agent} core.agent
         * @property {core.dom} core.dom
         * @property {core.range} core.range
         */
        core: {
            agent: agent,
            dom: dom,
            range: range
        }
    });


    /*
     * extend $.fn
     */
    $.fn.extend({
        /**
         * @method
         * Initialize sunnynote
         *  - create editor layout and attach Mouse and keyboard events.
         *
         * ```
         * $("#sunnynote").sunnynote( { options ..} );
         * ```
         *
         * @member $.fn
         * @param {Object|String} options reference to $.sunnynote.options
         * @return {this}
         */
        sunnynote: function () {
            // check first argument's type
            //  - {String}: External API call {{module}}.{{method}}
            //  - {Object}: init options
            var type = $.type(list.head(arguments));
            var isExternalAPICalled = type === 'string';
            var isInitOptions = type === 'object';

            // extend default options with custom user options
            var options = isInitOptions ? list.head(arguments) : {};
            options = $.extend({}, $.sunnynote.options, options);

            this.each(function (idx, holder) {
                var $holder = $(holder);

                // if layout isn't created yet, createLayout and attach events
                if (!renderer.hasNoteEditor($holder)) {
                    renderer.createLayout($holder, options);

                    var layoutInfo = renderer.layoutInfoFromHolder($holder);

                    eventHandler.attach(layoutInfo, options);
                    eventHandler.attachCustomEvent(layoutInfo, options);

                }
            });

            // callback on init
            if (!isExternalAPICalled && this.length && options.oninit) {
                options.oninit();
            }

            var $first = this.first();
            if ($first.length) {
                var layoutInfo = renderer.layoutInfoFromHolder($first);

                // external API
                if (isExternalAPICalled) {
                    var moduleAndMethod = list.head(list.from(arguments));
                    var args = list.tail(list.from(arguments));

                    // TODO now external API only works for editor
                    var params = [moduleAndMethod, layoutInfo.editable()].concat(args);
                    return eventHandler.invoke.apply(eventHandler, params);
                } else if (options.focus) {
                    // focus on first editable element for initialize editor
                    layoutInfo.editable().focus();
                }
            }

            return this;
        },

        /**
         * @method
         *
         * get the HTML contents of note or set the HTML contents of note.
         *
         * * get contents
         * ```
         * var content = $("#sunnynote").code();
         * ```
         * * set contents
         *
         * ```
         * $("#sunnynote").code(html);
         * ```
         *
         * @member $.fn
         * @param {String} [html] - HTML contents(optional, set)
         * @return {this|String} - context(set) or HTML contents of note(get).
         */
        code: function (html) {
            // get the HTML contents of note
            if (html === undefined) {
                var $holder = this.first();
                if (!$holder.length) {
                    return;
                }

                var layoutInfo = renderer.layoutInfoFromHolder($holder);
                var $editable = layoutInfo && layoutInfo.editable();

                if ($editable && $editable.length) {
                    return layoutInfo.editable().html();
                }
                return dom.isTextarea($holder[0]) ? $holder.val() : $holder.html();
            }

            // set the HTML contents of note
            this.each(function (i, holder) {
                var layoutInfo = renderer.layoutInfoFromHolder($(holder));
                var $editable = layoutInfo && layoutInfo.editable();
                if ($editable) {
                    $editable.html(html);
                }
            });

            return this;
        },

        /**
         * @method
         *
         * destroy Editor Layout and detach Key and Mouse Event
         *
         * @member $.fn
         * @return {this}
         */
        destroy: function () {
            this.each(function (idx, holder) {
                var $holder = $(holder);

                if (!renderer.hasNoteEditor($holder)) {
                    return;
                }

                var info = renderer.layoutInfoFromHolder($holder);
                var options = info.editor().data('options');

                eventHandler.detach(info, options);
                renderer.removeLayout($holder, info);
            });

            return this;
        }
    });
}));