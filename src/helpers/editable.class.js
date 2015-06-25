'use strict'
//var eventablejs = require('eventablejs');
var _   = require('../lodash.js');

/**
 * Constructor
 */
var Edit = function() {
};
var sel;
var range;

var prototype = {

    updateSelection: function(selection) {
        sel = selection;
        this.updateRange();
    },
    updateRange: function() {
        range = sel.getRangeAt(0);
    },
    /**
    * Grab datas after the cursor
    * @return {[type]} [description]
    */
    getSelectedContent: function($block) {
        var html = '';
        if (sel !== undefined) {
            sel.removeAllRanges();
            range.setStart($block.getTextBlock().get(0), 0);
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
    },
    getTextAfterParagraph: function(block, paragraph ) {
        var textAfter = block.getTextBlock().html().replace(paragraph, '');
        return textAfter;
    }

};

Edit.prototype = Object.assign({}, prototype);

module.exports = Edit;
