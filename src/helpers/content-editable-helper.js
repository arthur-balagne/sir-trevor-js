'use strict'

var _   = require('../lodash.js');

var sel;
var range;

exports.updateSelection = function(selection, blockRange) {
    sel = selection;
    range = blockRange;
};

exports.getSelectedContent = function(block) {
    var html = '';

    if (sel !== undefined) {
        sel.removeAllRanges();
        range.setStart(block.getTextBlock().get(0), 0);
        sel.addRange(range);
        if (sel.rangeCount) {

            var container = document.createElement('div');
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
            return html;
        }
    }
    else {
        console.error('your browser isnt supported yet');
    }
};

exports.getTextAfterParagraph = function(block, paragraph ) {
    var textAfter = block.getTextBlock().html().replace(paragraph, '');

    return textAfter;
};

// @todo put the pasteHTMLAtCaret here
// @todo put findCursorPosition here
// @todo put resetCursorPosition here
