'use strict';

/*
  Quiz Block
*/

var _        = require('../lodash');
var Block    = require('../block');
var stToHTML = require('../to-html');

var Slider    = require('../helpers/slider.js');
var FilterBar = require('../helpers/filterbar.js');

var registerClickSlideContents = function() {
    if (this.hasRegisteredClick !== true) {
        this.$inner.on('click', 'div[data-slide-item]', function(e) {
            console.log(this);
        });

        this.hasRegisteredClick = true;
    }
};

var slideContentBuilder = function(slideContents) {
    return slideContents.map(function(slideContent) {
        return _.template([
            '<div data-slide-item="<%= id %>" class="st-block__quiz">',
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

var filterUpdate = function() {
    this.slider.eventBus.on('progress', function() {
        this.filterBar.moreResults();
    }.bind(this));

    this.filterBar.eventBus.on('update', function(results) {
        var updated = slideContentBuilder(results);

        this.slider.update(updated);
    }.bind(this));
};

var filterReset = function() {
    this.filterBar.eventBus.on('search', function(results) {
        var contents = slideContentBuilder(results);

        this.slider.reset(contents);

        registerClickSlideContents.call(this);
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
        this.selectedContentType = choices.contentType;

        this.filterBar = new FilterBar({
            url: this.selectedContentType,
            fields: [
                {
                    type: 'search',
                    name: 'fulltext',
                    label: 'Rechercher'
                },
                {
                    type: 'select',
                    name: 'id_thematique',
                    label: 'Thematique',
                    options: [ {
                        label: 'Thematique 1',
                        value: 1
                    }, {
                        label: 'Thematique 2',
                        value: 2
                    }, {
                        label: 'Thematique 3',
                        value: 3
                    }, {
                        label: 'Thematique 4',
                        value: 4
                    } ]
                }
            ],
            limit: 20,
            container: this.$inner
        });

        this.slider = new Slider({
            next: 'Next',
            prev: 'Prev',
            itemsPerSlide: 3,
            increment: 2,
            container: this.$inner
        });

        filterReset.call(this);
        filterUpdate.call(this);

        this.filterBar.search();
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
    },

    onBlockRender: function() {
    }
});
