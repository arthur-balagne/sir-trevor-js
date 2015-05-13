var $ = require('jquery');
var _ = require('../lodash');

var Slide = require('./slide.js');

// PRIVATE

var registerButtonsClick = function() {
    this.$elem.on('click', '.etu-slider-controls button', function(e) {
        e.preventDefault();
        if (this[$(e.currentTarget).data('direction')]) {
            this[$(e.currentTarget).data('direction')].call(this);
        }
    }.bind(this));
};

var checkButtons = function() {
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
};

var isPenultimate = function() {
    if (this.currentIndex === this.slides.length - 2) {
        this.EventBus.trigger('penultimateSlide');
    }
};

var canGoTo = function(index) {
    if (index < 0 || index > this.slides.length - 1) {
        return false;
    }

    return true;
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

var prepareSlides = function(slides, indexModifier) {
    _.chunk(slides, this.itemsPerSlide).forEach(function(slideContent, index) {
        this.slides.push(new Slide(
            indexModifier ? indexModifier + index : index,
            slideContent,
            this.itemsPerSlide
        ));
    }.bind(this));
};

// PUBLIC

var Slider = function() {
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

Slider.prototype = {
    EventBus: require('../events.js'),

    build: function(params) {
        this.blockRef = params.blockRef;
        this.slides = [];
        this.itemsPerSlide = params.itemsPerSlide;

        this.buttonConfig = {
            next: params.next,
            prev: params.prev
        };

        prepareSlides.call(this, params.contents);
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

            registerButtonsClick.call(this);

            calculateSliderDimensions.call(this, true);
            checkButtons.call(this);

            this.isReady = true;
        }
    },

    update: function(additionalSlides) {
        var markup = '';
        var lastSlide = this.slides[this.slides.length - 1];

        if (!lastSlide.isFull()) {
            this.$slides.last().remove();

            while (!lastSlide.isFull()) {
                lastSlide.addItem(additionalSlides.pop());
            }
        }

        prepareSlides.call(this, additionalSlides, this.slides.indexOf(lastSlide));

        this.slides.slice(this.slides.indexOf(lastSlide), this.slides.length).forEach(function(slide) {
            markup += slide.render();
        });

        this.$container.append(markup);

        calculateSliderDimensions.call(this, false);
        checkButtons.call(this);
    },

    reset: function(newSlides) {
        var slides = '';
        this.slides = [];

        prepareSlides.call(this, newSlides);

        this.slides.forEach(function(slide) {
            slides += slide.render();
        });

        this.$container.html(slides);

        calculateSliderDimensions.call(this, true);
        checkButtons.call(this);
    },

    goTo: function(index) {
        this.$container.css('left', '-' + (50 * index) + '%');

        this.currentIndex = index;

        checkButtons.call(this);
    },

    prev: function() {
        var newIndex = this.currentIndex - 1;

        if (canGoTo.call(this, newIndex)) {
            this.goTo(newIndex);
        }
    },

    next: function() {
        var newIndex = this.currentIndex + 1;

        isPenultimate.call(this);

        if (canGoTo.call(this, newIndex)) {
            this.goTo(newIndex);
        }
    }
};

module.exports = Slider;
