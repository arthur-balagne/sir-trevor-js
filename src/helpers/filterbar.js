var _   = require('../lodash.js');
var xhr = require('etudiant-mod-xhr');

var renderSelect = function(field) {
    field.label = field.label || '';

    var selectTemplate = _.template([
        '<div class="st-block__filter-field">',
            '<label for="<%= name %>">',
                '<%= label %>',
            '</label>',
            '<select id="<%= name %>" name="<%= name %>">',
                '<%= options %>',
            '</select>',
        '</div>'
    ].join('\n'));

    var optionTemplate = _.template('<option value="<%= value %>"><%= label %></option>');
    var optionMarkup = '';

    field.options.forEach(function(option) {
        optionMarkup += optionTemplate({
            value: option.value,
            label: option.label
        });
    });

    return selectTemplate({
        name: field.name,
        options: optionMarkup,
        label: field.label
    });
};

var renderStandardField = function(field) {
    field.label = field.label || '';

    var template = _.template([
        '<div class="st-block__filter-field">',
            '<label for="<%= name %>">',
                '<%= label %>',
            '</label>',
            '<input type="<%= type %>" name="<%= name %>" />',
        '</div>'
    ].join('\n'));

    return template({
        name: field.name,
        type: field.type,
        label: field.label
    });
};

var renderField = function(field) {
    var fieldMarkup;

    switch (field.type) {
        case 'select':
            fieldMarkup = renderSelect(field);
            break;
        default:
            fieldMarkup = renderStandardField(field);
            break;
    }

    return fieldMarkup;
};

var searchBuilder = function ($elem) {
    var search = {};
    var $fields = $elem.find('input, select');

    $fields.each(function() {
        if (this.value) {
            search[this.name] = this.value;
        }
    });

    return search;
};

var filterBarTemplate = _.template([
    '<form name="" class="st-block__filter">',
        '<%= fields %>',
    '</form>'
].join('\n'));

var FilterBar = function(params) {
    this.$container = params.container;
    this.url = params.url;
    this.limit = params.limit;

    this.eventBus = Object.assign({}, require('../events.js'));

    this.template = filterBarTemplate;

    this.$container.append(this.render(params.fields));
    this.ready();
};

FilterBar.prototype = {
    render: function(fields) {
        var fieldMarkup = '';

        fields.forEach(function(field) {
            fieldMarkup += renderField(field);
        });

        return this.template({
            fields: fieldMarkup
        });
    },

    ready: function() {
        this.$elem.on('keyup', 'input', _.debounce(function() {
            this.search();
        }.bind(this), 300));

        this.$elem.on('change', 'select', function() {
            this.search();
        }.bind(this));
    },

    search: function(search, eventName) {
        search = search || {};
        eventName = eventName || 'search';

        search = Object.assign(search, searchBuilder(this.$elem), {
            limit: this.limit
        });

        var searchUrl = xhr.paramizeUrl(this.url, search);

        this.nextSearch = search;

        xhr.get(searchUrl)
            .then(function(results) {
                this.eventBus.trigger(eventName, results);

                if (this.nextSearch.offset) {
                    this.nextSearch.offset += results.length;
                }
                else {
                    this.nextSearch.offset = results.length;
                }
            }.bind(this));
    },

    moreResults: function() {
        this.search(this.nextSearch, 'update');
    },

    destroy: function() {
        this.$elem.remove();
    }
};

Object.defineProperty(FilterBar.prototype, '$elem', {
    get: function $elem() {
        return this.$container.find('.st-block__filter');
    }
});

module.exports = FilterBar;
