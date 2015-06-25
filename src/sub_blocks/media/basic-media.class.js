var $             = require('jquery');
var _             = require('../../lodash.js');
var eventablejs   = require('eventablejs');
var BasicSubBlock = require('../basic.class.js');

function watchFields(subBlock) {
    var $fields = subBlock.$elem.find('input, select');

    $fields.on('keyup', _.debounce(function(e) {
        var toSave = {};

        var name = this.name;
        var value = $(this).val();

        toSave[name] = value;

        subBlock.save(toSave);
    }, 400));

    $fields.on('change', function() {
        var toSave = {};

        var name = this.name;
        var value = $(this).val();

        toSave[name] = value;

        subBlock.save(toSave);
    });
}

var BasicMediaSubBlock = function() {
    BasicSubBlock.apply(this, arguments);
};

BasicMediaSubBlock.prototype = Object.create(BasicSubBlock.prototype);

BasicMediaSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {
    addData: function(data) {
        this.contents = Object.assign(this.contents, data);
    },

    bindToRenderedHTML: function() {
        this.$elem = $('[data-sub-block-id="' + this.id + '"]');

        watchFields(this);
    },

    save: function(saveData) {
        this.trigger('save', saveData);
    }
};

Object.assign(BasicMediaSubBlock.prototype, prototype, eventablejs);

module.exports = BasicMediaSubBlock;
