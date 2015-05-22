var $ = require('jquery');
var _ = require('../lodash');

var Slide = require('./slide.js');

var canGoTo = function(index) {
    if (index < 0 || index > this.slides.length - 1) {
        return false;
    }

    return true;
};

var calculateSliderDimensions = function(reset) {
    this.$slides = this.$slideContainer.find('.st-slider-slide');

    if (this.$slides.length > 0) {
        this.$slides.css('width', (this.$elem.width() / this.increment) + 'px');
        this.$slideContainer.css('width', (this.$slides[0].clientWidth * this.$slides.length) + 'px');

        if (reset) {
            this.currentIndex = 0;
            this.$slideContainer.css('left', '0%');
        }
    }
};

var checkButtons = function() {
    var prevButton = this.$elem.find('.st-slider-controls button[data-direction="prev"]');
    var nextButton = this.$elem.find('.st-slider-controls button[data-direction="next"]');

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

var checkProgress = function() {
  var progress = Math.round((this.currentIndex / this.slides.length) * 100);

  if (progress > 50 && this.hasEmitted !== true) {
    this.eventBus.trigger('progress', 'hi there');
    this.hasEmitted = true;
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

var registerButtons = function() {
    this.$elem.on('click', '.st-slider-controls button', function(e) {
        e.preventDefault();
        if (this[$(e.currentTarget).data('direction')]) {
            this[$(e.currentTarget).data('direction')].call(this);
        }
    }.bind(this));
};

// PUBLIC

var Slider = function() {
    this.template = _.template([
        '<div class="st-block__slider">',
            '<div class="st-slider">',
                '<div class="st-slider-container">',
                    '<%= content %>',
                '</div>',
            '</div>',
            '<div class="st-slider-controls">',
                '<%= buttons %>',
            '</div>',
        '</div>'
    ].join('\n'));

    this.constructor.apply(this, arguments);
};

Slider.prototype = {

    constructor: function(params) {
        this.$container = params.container;
        this.slides = [];
        this.itemsPerSlide = params.itemsPerSlide;
        this.increment = params.increment;
        this.eventBus = Object.assign({}, require('../events.js'));

        this.buttonConfig = {
            next: params.next,
            prev: params.prev
        };

        if (params.contents) {
            prepareSlides.call(this, params.contents);
        }

        this.$container.append(this.render());
        this.ready();
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
        this.$elem = $(this.$container).find('.st-block__slider');
        this.$slideContainer = this.$elem.find('.st-slider-container');

        if (!this.isReady) {

            registerButtons.call(this);

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

        this.$slideContainer.append(markup);

        calculateSliderDimensions.call(this, false);
        checkButtons.call(this);
        this.hasEmitted = false;
    },

    reset: function(newSlides) {
        var slides = '';
        this.slides = [];

        prepareSlides.call(this, newSlides);

        this.slides.forEach(function(slide) {
            slides += slide.render();
        });

        this.$slideContainer.html(slides);

        calculateSliderDimensions.call(this, true);
        checkButtons.call(this);
        this.hasEmitted = false;
    },

    goTo: function(index) {
        this.$slideContainer.css('left', '-' + ((100 / this.increment).toFixed(2) * index) + '%');

        this.currentIndex = index;

        checkProgress.call(this);
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

        if (canGoTo.call(this, newIndex)) {
            this.goTo(newIndex);
        }
    },

    destroy: function() {
        this.$elem.remove();
    }
};

module.exports = Slider;
