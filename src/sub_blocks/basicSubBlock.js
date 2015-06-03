var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(contents, type) {
        this.id = contents.id;

        this.contents = Object.assign({}, contents, {
            type: type
        });

        this.contents.url = this.contents.url ? this.contents.url : '';
    },

    renderSmall: function() {
        return this.smallTemplate(this.contents);
    },

    renderLarge: function() {
        return this.largeTemplate(this.contents);
    }
};

module.exports = BasicSubBlock;
