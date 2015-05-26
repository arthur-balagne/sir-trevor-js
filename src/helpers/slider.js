var $ = require('jquery');
var _ = require('../lodash');

var Slide = require('./slide.js');

var canGoTo = function(index) {
    return !(index < 0 || index > this.slides.length - 1);
};

var calculateSliderDimensions = function(reset) {
    this.$slides = this.$slideContainer.find('.st-slider-slide');

    if (this.$slides.length > 0) {
        this.$slides.css('width', (this.$elem.width() / this.config.increment) + 'px');
        this.$slideContainer.css('width', (this.$slides[0].clientWidth * this.$slides.length) + 'px');

        if (reset) {
            this.currentIndex = 0;
            this.$slideContainer.css('left', '0%');
        }
    }
};

var checkButtons = function() {
    if (this.currentIndex === 0) {
        this.eventBus.trigger('buttons:prev:disable');
    }
    else {
        this.eventBus.trigger('buttons:prev:enable');
    }

    if (this.currentIndex === this.slides.length - 1) {
        this.eventBus.trigger('buttons:next:disable');
    }
    else {
        this.eventBus.trigger('buttons:next:enable');
    }
};

var checkProgress = function() {
    var progress = Math.round((this.currentIndex / this.slides.length) * 100);

    if (progress > 50 && this.hasEmitted !== true) {
        this.eventBus.trigger('progress');
        this.hasEmitted = true;
    }
};

var prepareSlides = function(slides, itemsPerSlide, indexModifier) {
    var prepared = [];

    _.chunk(slides, itemsPerSlide).forEach(function(slideContent, index) {
        prepared.push(new Slide(
            indexModifier ? indexModifier + index : index,
            slideContent,
            itemsPerSlide
        ));
    });

    return prepared;
};

var registerButtons = function() {
    var prevButton = this.$elem.find('.st-slider-controls button[data-direction="prev"]');
    var nextButton = this.$elem.find('.st-slider-controls button[data-direction="next"]');

    this.$elem.on('click', '.st-slider-controls button', function(e) {
        e.preventDefault();
        if (this[$(e.currentTarget).data('direction')]) {
            this[$(e.currentTarget).data('direction')].call(this);
        }
    }.bind(this));

    this.eventBus.on('buttons:prev:disable', function() {
        prevButton.attr('disabled', 'disabled');
    });
    this.eventBus.on('buttons:prev:enable', function() {
        prevButton.removeAttr('disabled');
    });
    this.eventBus.on('buttons:next:disable', function() {
        nextButton.attr('disabled', 'disabled');
    });
    this.eventBus.on('buttons:next:enable', function() {
        nextButton.removeAttr('disabled');
    });
};

var renderControls = function(controls) {
    var controlTemplate = _.template([
        '<div class="st-slider-controls">',
            '<%= buttons %>',
        '</div>'
    ].join('\n'));

    var buttonTemplate = _.template([
        '<button <%= button_attr %>>',
            '<span><%= button_text %></span>',
        '</button>'
    ].join('\n'));

    var buttonMarkup = '';

    Object.keys(controls).forEach(function(key) {
        buttonMarkup += buttonTemplate({
            button_attr: 'data-direction="' + key + '"',
            button_text: controls[key]
        });
    });

    return controlTemplate({
        buttons: buttonMarkup
    });
};

var sliderTemplate = _.template([
    '<div class="st-block__slider">',
        '<div class="st-slider">',
            '<div class="st-slider-container">',
                '<%= content %>',
            '</div>',
        '</div>',
        '<%= controls %>',
    '</div>'
].join('\n'));

// PUBLIC

var Slider = function() {
    this.constructor.apply(this, arguments);
};

Slider.prototype = {

    constructor: function(params) {
        this.eventBus = Object.assign({}, require('../events.js'));

        this.slides = [];
        this.template = sliderTemplate;

        this.$container = params.container;

        this.config = {
            itemsPerSlide: params.itemsPerSlide,
            increment: params.increment,
            controls: params.controls,
            autoBind: params.autoBind
        };

        if (params.contents) {
            this.slides = prepareSlides(params.contents, this.config.itemsPerSlide);
        }

        if (this.config.autoBind) {
            this.$container.append(this.render());
            this.ready();
        }
    },

    render: function() {
        var slidesMarkup = '';
        var controlsMarkup = '';

        if (this.config.controls) {
            controlsMarkup = renderControls(this.config.controls);
        }

        this.slides.forEach(function(slide) {
            slidesMarkup += slide.render();
        });

        return this.template({
            content: slidesMarkup,
            controls: controlsMarkup
        });
    },

    ready: function() {
        this.$elem = $(this.$container).find('.st-block__slider');
        this.$slideContainer = this.$elem.find('.st-slider-container');

        if (!this.isReady) {

            if (this.config.controls) {
                registerButtons.call(this);
            }

            calculateSliderDimensions.call(this, true);
            checkButtons.call(this);

            this.isReady = true;
        }
    },

    update: function(additionalSlides) {
        var indexModifier;
        var slidesMarkup = '';
        var lastSlide = this.slides[this.slides.length - 1];

        indexModifier = this.slides.indexOf(lastSlide) + 1;

        if (!lastSlide.isFull()) {
            this.$slides.last().remove();

            indexModifier = this.slides.indexOf(lastSlide);

            while (!lastSlide.isFull()) {
                lastSlide.addItem(additionalSlides.pop());
            }
        }

        var newSlides = prepareSlides(additionalSlides, this.config.itemsPerSlide, indexModifier);

        this.slides = this.slides.concat(newSlides);

        this.slides.slice(indexModifier, this.slides.length).forEach(function(slide) {
            slidesMarkup += slide.render();
        });

        this.$slideContainer.append(slidesMarkup);

        calculateSliderDimensions.call(this, false);
        checkButtons.call(this);
        this.hasEmitted = false;
    },

    reset: function(newSlides) {
        var slidesMarkup = '';
        this.slides = [];

        this.slides =  prepareSlides(newSlides, this.config.itemsPerSlide);

        this.slides.forEach(function(slide) {
            slidesMarkup += slide.render();
        });

        this.$slideContainer.html(slidesMarkup);

        calculateSliderDimensions.call(this, true);
        checkButtons.call(this);
        this.hasEmitted = false;
    },

    goTo: function(index) {
        this.$slideContainer.css('left', '-' + ((100 / this.config.increment).toFixed(2) * index) + '%');

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
