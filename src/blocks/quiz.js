'use strict';

/*
  Quiz Block
*/

var _        = require('../lodash');
var Block    = require('../block');
var stToHTML = require('../to-html');

var Slider    = require('../helpers/slider.js');
var FilterBar = require('../helpers/filterbar.js');

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

var registerSliderUpdate = function() {
    this.slider.eventBus.on('progress', function() {
        this.filterBar.moreResults();
    }.bind(this));

    this.filterBar.eventBus.on('update', function(results) {
        var updated = this.filterable.slideContentBuilder(results);

        this.slider.update(updated);
    }.bind(this));
};

var registerSlideReset = function() {
    this.filterBar.eventBus.on('search', function(results) {
        var contents = this.filterable.slideContentBuilder(results);

        this.slider.reset(contents);
    }.bind(this));
};

module.exports = Block.extend({

    chooseable: {
        name: 'contentType',
        options: [
            {
                title: 'Sondage',
                value: 'sondage'
            },
            {
                title: 'Quiz',
                value: 'quiz'
            },
            {
                title: 'Test de personnalité',
                value: 'test'
            }
        ]
    },

    onChoose: function(choices) {
        this.filterBar = new FilterBar({
            url: choices.contentType,
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
            limit: 20,
            container: this.$inner
        })

        this.slider = new Slider({
            next: 'Next',
            prev: 'Prev',
            itemsPerSlide: 3,
            increment: 2,
            container: this.$inner
        });

        registerSlideReset.call(this);
        registerSliderUpdate.call(this);
    },

    type: 'Quiz',

    title: function() {
        return 'Quiz';
    },

    editorHTML: '',

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
