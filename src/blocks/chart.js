'use strict';

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

    chooseable: true,

    choices: [
        {
            icon: 'pie',
            title: 'Pie Chart',
            name: 'pie',
            choices: [
                {
                    icon: 'pie-2',
                    title: 'Pie Chart with Bloo',
                    name: 'subpie',
                    choices: [
                        {
                            icon: 'pie-2',
                            title: 'Hello mother',
                            name: 'subpie1'
                        },
                        {
                            icon: 'pie-3',
                            title: 'Do you want to play a game ?',
                            name: 'subpie12'
                        }
                    ]
                },
                {
                    icon: 'pie-3',
                    title: 'Pie Chart with Floo',
                    name: 'subpie2'
                }
            ]
        },
        {
            icon: 'bar',
            title: 'Bar Chart',
            name: 'bar'
        }
    ],

    onChoose: function(chosen) {
        this.$inner.html('You chose ' + JSON.stringify(chosen));
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
