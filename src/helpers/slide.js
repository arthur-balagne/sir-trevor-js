var _ = require('lodash');

var Slide = function() {
    this.template = _.template([
        '<div class="etu-slider-slide">',
            '<%= slide_content %>',
        '</div>'
    ].join('\n'));

    this.init.apply(this, arguments);
};

Slide.prototype = {

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

module.exports = Slide;
