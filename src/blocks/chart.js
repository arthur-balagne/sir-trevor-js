'use strict';

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

    filterable: true,

    filterConfig: {
        url: 'http://localhost:3000/content',
        header: {
            options: [
                {
                    label: 'label 1',
                    value: 1
                },
                {
                    label: 'label 2',
                    value: 2
                },
                {
                    label: 'label 3',
                    value: 3
                },
                {
                    label: 'label 4',
                    value: 4
                }
            ],
        },
        footer: {
            next: 'Next',
            prev: 'Prev'
        }
    },

    type: 'Chart',

    title: function() {
        return 'Chart';
    },

    editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',

    icon_name: 'text',

    loadData: function(data) {
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },

    beforeBlockRender: function() {
        console.log('beforeBlockRender');
    },

    onBlockRender: function() {
        console.log('onBlockRender');
    }
});
