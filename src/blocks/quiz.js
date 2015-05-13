'use strict';

/*
  Quiz Block
*/

var _        = require('../lodash');
var Block    = require('../block');
var stToHTML = require('../to-html');
var Slider   = require('../helpers/slider.js');

module.exports = Block.extend({

    filterable: true,

    filterConfig: {
        url: 'http://localhost:3000/content',
        options: [ {
            label: 'label 1',
            value: 1
        }, {
            label: 'label 2',
            value: 2
        }, {
            label: 'label 3',
            value: 3
        }, {
            label: 'label 4',
            value: 4
        } ]
    },

    slider: {},

    onFilter: function(filterResults) {
        var results = filterResults.map(function(result) {
            return _.template([
                '<div class="st-block__quiz">',
                    '<img src="<%= image %>" />',
                    '<span><%= title %></span>',
                    '<span><%= description %></span>',
                '</div>'
            ].join('\n'))({
                image: result.image,
                title: result.title,
                description: result.description
            });
        });

        if (!(this.slider instanceof Slider)) {
            this.slider = new Slider({
                contents: results,
                next: 'Next',
                prev: 'Prev',
                blockRef: this.$inner,
                itemsPerSlide: 3
            });

            this.$inner.append(this.slider.render());

            this.slider.EventBus.on('penultimateSlide', function() {
                // console.log('events are being passed just fine');

            }.bind(this));
        }
        else {
            this.slider.reset(results);
        }

        this.slider.ready();
    },

    type: 'Quiz',

    title: function() {
        return 'Quiz';
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
