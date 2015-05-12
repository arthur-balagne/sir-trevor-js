'use strict';

/*
  Quiz Block
*/

var $ = require('jquery');
var _ = require('../lodash');
var Block = require('../block');
var stToHTML = require('../to-html');

var EtuSlide = function() {
    this.template = _.template([
        '<div class="etu-slider-slide">',
            '<%= slide_content %>',
        '</div>'
    ].join('\n'));

    this.init.apply(this, arguments);
};

EtuSlide.prototype = {

    init: function(id, contents, max) {
        this.id = id;
        this.contents = contents;
        this.max = max;
    },

    isFull: function() {
        return this.max <= this.contents.length;
    },

    addItem: function(item) {
        this.contents.push(item);
    },

    render: function() {
        var markup = '';

        this.contents.forEach(function(content) {
            markup += content;
        });

        return this.template({
            slide_content: markup
        });
    }
};

var calculateSliderDimensions = function(reset) {
    this.$container = this.$elem.find('.etu-slider-container');
    this.$slides = this.$elem.find('.etu-slider-slide');

    this.$slides.css('width', (this.$elem.width() / 2) + 'px');

    this.$container.css('width', (this.$slides[0].clientWidth * this.$slides.length) + 'px');

    if (reset) {
        this.currentIndex = 0;
        this.$container.css('left', '0%');
    }
};

var chunkSlides = function(slides, indexModifier) {
    _.chunk(slides, this.itemsPerSlide).forEach(function(slideContent, index) {
        this.slides.push(new EtuSlide(
            indexModifier ? indexModifier + index : index,
            slideContent,
            this.itemsPerSlide
        ));
    }.bind(this));
};

var EtuSlider = function() {
    this.template = _.template([
        '<div class="st-block__slider">',
            '<div class="etu-slider">',
                '<div class="etu-slider-container">',
                    '<%= content %>',
                '</div>',
            '</div>',
            '<div class="etu-slider-controls">',
                '<%= buttons %>',
            '</div>',
        '</div>'
    ].join('\n'));

    this.build.apply(this, arguments);
};

EtuSlider.prototype = {
    build: function(params) {
        this.blockRef = params.blockRef;
        this.slides = [];
        this.itemsPerSlide = params.itemsPerSlide;

        this.buttonConfig = {
            next: params.next,
            prev: params.prev
        };

        chunkSlides.call(this, params.contents);
    },

    render: function() {
        var buttonTemplate = _.template([
            '<button <%= button_attr %>>',
                '<span><%= button_text %></span>',
            '</button>'
        ].join('\n'));

        var buttons = '';
        var slides = '';

        Object.keys(this.buttonConfig).forEach(function(key) {
            buttons += buttonTemplate({
                button_attr: 'data-direction="' + key + '"',
                button_text: this.buttonConfig[key]
            });
        }.bind(this));

        this.slides.forEach(function(slide) {
            slides += slide.render();
        });

        return this.template({
            content: slides,
            buttons: buttons
        });
    },

    ready: function() {
        this.$elem = $(this.blockRef).find('.st-block__slider');

        if (!this.isReady) {

            calculateSliderDimensions.call(this, true);

            this.$elem.on('click', '.etu-slider-controls button', function(e) {
                e.preventDefault();
                if (this[$(e.currentTarget).data('direction')]) {
                    this[$(e.currentTarget).data('direction')].call(this);
                }
            }.bind(this));

            this.checkButtons();

            this.isReady = true;
        }
    },

    update: function(extraContents) {
        var markup = '';
        var lastSlide = this.slides[this.slides.length - 1];

        if (!lastSlide.isFull()) {
            this.$slides.last().remove();

            while(!lastSlide.isFull()) {
                lastSlide.addItem(extraContents.pop());
            }
        }

        chunkSlides.call(this, extraContents, this.slides.indexOf(lastSlide));

        this.slides.slice(this.slides.indexOf(lastSlide), this.slides.length).forEach(function(slide) {
            markup += slide.render();
        });

        this.$container.append(markup);

        calculateSliderDimensions.call(this, false);

        this.checkButtons();
    },

    reset: function() {
        this.slides = [];
        this.$container.html('reset');
    },

    checkButtons: function() {
        var prevButton = this.$elem.find('.etu-slider-controls button[data-direction="prev"]');
        var nextButton = this.$elem.find('.etu-slider-controls button[data-direction="next"]');

        if (this.currentIndex === 0) {
            prevButton.attr('disabled', 'disabled');
        }
        else {
            prevButton.removeAttr('disabled');
        }

        if (this.currentIndex === this.slides.length - 1) {
            nextButton.attr('disabled', 'disabled');
        }
        else {
            nextButton.removeAttr('disabled');
        }
    },

    goTo: function(index) {
        if (index < 0 || index > this.slides.length - 1) {
            return;
        }

        this.$container.css('left', '-' + (50 * index) + '%');

        this.currentIndex = index;

        this.checkButtons();
    },

    prev: function() {
        this.goTo(this.currentIndex - 1);
    },

    next: function() {
        this.goTo(this.currentIndex + 1);
    }
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

        if (!(this.slider instanceof EtuSlider)) {
            this.slider = new EtuSlider({
                contents: results,
                next: 'Next',
                prev: 'Prev',
                blockRef: this.$inner,
                itemsPerSlide: 3
            });

            this.$inner.append(this.slider.render());
        }
        else {
            this.slider.update(results);
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
