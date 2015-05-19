'use strict';

var $         = require('jquery');
var Slider    = require('../helpers/slider.js');
var FilterBar = require('../helpers/filterbar.js');

var registerSliderUpdate = function() {
    this.slider.EventBus.on('slider:progress', function() {
        console.log('the slider has gone 50 percent through');
        // this.slider.update();
    }.bind(this));
};

module.exports = {

    mixinName: 'Filterable',

    initializeFilterable: function() {

        if (this.filterConfig) {

            var filterBar = new FilterBar(this, this.$inner, this.filterConfig);

            this.$inner.html(filterBar.render());

            filterBar.ready();
        }
    },

    onFilter: function(filterResults) {

        if (!(this.slider instanceof Slider)) {
            var sliderConfig = this.filterConfig.sliderConfig;

            sliderConfig.blockReference = this.$inner;
            sliderConfig.contents = this.filterConfig.slideContentBuilder(filterResults);

            this.slider = new Slider(sliderConfig);

            this.$inner.append(this.slider.render());

            registerSliderUpdate.call(this);
        }
        else {
            this.slider.reset(results);
        }

        this.slider.ready();
    }

};
