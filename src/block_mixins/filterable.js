'use strict';

var Slider    = require('../helpers/slider.js');
var FilterBar = require('../helpers/filterbar.js');

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

module.exports = {

    mixinName: 'Filterable',

    initializeFilterable: function() {
        this.filterBar = new FilterBar(Object.assign({}, this.filterable.bar, {
            container: this.$inner
        }));

        this.slider = new Slider(Object.assign({}, this.filterable.slider, {
            container: this.$inner
        }));

        registerSlideReset.call(this);
        registerSliderUpdate.call(this);
    }
};
