var BasicSubBlock = function() {
    this.init.apply(this, arguments);
};

BasicSubBlock.prototype = {
    init: function(type, contents) {
        this.contents = Object.assign({}, contents, {
            type: type
        });
    },

    render: function() {
        return this.template(this.contents);
    },

    renderLarge: function() {
        return this.largeTemplate(this.contents);
    }
};

module.exports = BasicSubBlock;
