'use strict';

/*
  Quiz Block
*/

var _        = require('../lodash');
var Block    = require('../block');
var stToHTML = require('../to-html');
var Slider   = require('../helpers/slider.js');

var slideContentBuilder = function(slideContents) {
    return slideContents.map(function(slideContent) {
        return _.template([
            '<div class="st-block__quiz">',
            '<img src="<%= image %>" />',
            '<span><%= title %></span>',
            '<span><%= description %></span>',
            '</div>'
        ].join('\n'))({
            image: slideContent.image,
            title: slideContent.title,
            description: slideContent.description
        });
    });
};

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
        } ],
        slideContentBuilder: slideContentBuilder,
        sliderConfig: {
          next: 'Next',
          prev: 'Prev',
          itemsPerSlide: 3,
          increment: 2
        }
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
