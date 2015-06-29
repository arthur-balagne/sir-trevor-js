var $             = require('jquery');
var _             = require('../../lodash.js');
var eventablejs   = require('eventablejs');
var BasicSubBlock = require('../basic.class.js');

var renderField = require('../../helpers/field-builder.js');

var innerStaticTemplate = [
    '<%= legend %>',
    '<label><%= copyrightLabel %>&copy;</label> <span><%= copyright %></span>'
].join('\n');

var innerEditTemplate = [
    '<div class="st-sub-block-edit">',
        '<%= fields %>',
    '</div>'
].join('\n');

var footerTemplate = [
    '<footer>',
        '<button class="st-btn" data-button-type="save" type="button">',
            '<%= save %>',
        '</button>',
    '</footer>'
].join('\n');

function getFooter() {
    return _.template(footerTemplate, {
        save: i18n.t('sub_blocks:media:save')
    });
}

function saveSubBlock(field, subBlock) {
    var toSave = {};
    var name = field.name;
    var value = $(field).val();

    toSave[name] = value;

    subBlock.toSave = Object.assign({}, subBlock.toSave, toSave);
}

function watchFields(subBlock) {
    var $fields = subBlock.$elem.find('input, select');

    $fields.on('keyup', _.debounce(function() {
        saveSubBlock(this, subBlock);
    }, 400));

    $fields.on('change', function() {
        saveSubBlock(this, subBlock);
    });
}

var BasicMediaSubBlock = function() {
    this.toSave = {};

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

        if ('ready' in this) {
            this.ready();
        }

        this.$elem.on('click', '[data-button-type="save"]', function() {
            this.save();
        }.bind(this));
    },

    save: function() {
        this.trigger('save', this.toSave);
    },

    renderEditable: function() {
        this.isEditable = true;

        var fieldMarkup = '';

        fieldMarkup += renderField({
            label: i18n.t('sub_blocks:media:legend'),
            name: 'legende',
            type: 'text',
            value: this.contents.legend
        });

        fieldMarkup += renderField({
            label: i18n.t('sub_blocks:media:copyright'),
            name: 'copyrights',
            multiple: true,
            type: 'select',
            options: this.contents.copyrights
        });

        fieldMarkup += renderField({
            label: i18n.t('sub_blocks:media:category'),
            name: 'id_categorie',
            type: 'select',
            options: this.contents.categories
        });

        var editArea = _.template(innerEditTemplate, { fields: fieldMarkup });

        return _.template(this.outerTemplate,
            {
                id: this.id,
                type: this.type,
                file: this.contents.file,
                editArea: editArea,
                footer: getFooter()
            }
        );
    },

    renderLarge: function(extraData) {
        extraData = extraData || {};

        var legend = renderField({
            label: i18n.t('sub_blocks:media:legend'),
            name: 'legend',
            value: this.contents.legend
        });

        var editArea = _.template(innerStaticTemplate, {
            legend: legend,
            copyright: this.contents.copyright,
            copyrightLabel: i18n.t('sub_blocks:media:copyright')
        });

        var outerTemplateData = {
                id: this.id,
                type: this.type,
                file: this.contents.file,
                editArea: editArea,
                footer: getFooter()
        };

        if (extraData) {
            Object.keys(extraData).forEach(function(extraDataKey) {
                outerTemplateData[extraDataKey] = extraData[extraDataKey];
            });
        }

        return _.template(this.outerTemplate, outerTemplateData);
    }
};

Object.assign(BasicMediaSubBlock.prototype, prototype, eventablejs);

module.exports = BasicMediaSubBlock;
