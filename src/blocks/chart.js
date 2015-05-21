'use strict';

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');

module.exports = Block.extend({

    chooseable: {
        'name': 'chartType',
        'options': [
            {
                'icon': 'pie',
                'title': 'Pie Chart',
                'value': 'pie',
                'subChoice': {
                    'name': 'pieColor',
                    'options': [
                        {
                            'title': 'Blue',
                            'value': 'blue'
                        },
                        {
                            'title': 'Red',
                            'value': 'red'
                        }
                    ]
                }
            },
            {
                'icon': 'bar',
                'title': 'Bar Chart',
                'value': 'bar'
            }
        ]
    },

    type: 'Chart',

    onChoose: function(choice) {
        console.log(choice);
    },

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
