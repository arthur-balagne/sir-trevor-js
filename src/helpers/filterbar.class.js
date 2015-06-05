var eventablejs = require('eventablejs');
var _   = require('../lodash.js');
var xhr = require('etudiant-mod-xhr');

var renderSelect = function(field) {
    field.label = field.label || '';
    field.placeholder = field.placeholder || '';

    var selectTemplate = _.template([
        '<div class="st-block__filter-field">',
            '<label for="<%= name %>">',
                '<%= label %>',
            '</label>',
            '<select id="<%= name %>" name="<%= name %>">',
                '<option value="" selected disabled><%= placeholder %></option>',
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
        placeholder: field.placeholder,
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

var searchBuilder = function($elem) {
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

var FilterBar = function() {
    this.init.apply(this, arguments);
};

var prototype = {
    init: function(params) {
        this.app = params.app;
        this.url = params.url;
        this.limit = params.limit;
        this.fields = params.fields;
        this.template = filterBarTemplate;

        if (params.container) {
            params.container.append(this.render(this.fields));
            this.bindToDOM(params.container);
        }
    },

    render: function() {
        var fieldMarkup = '';

        this.fields.forEach(function(field) {
            fieldMarkup += renderField(field);
        });

        return this.template({
            fields: fieldMarkup
        });
    },

    bindToDOM: function(container) {
        this.$elem = container.find('.st-block__filter');

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
            limit: this.limit,
            application: this.app
        });

        var searchUrl = xhr.paramizeUrl(this.url, search);

        this.nextSearch = search;

        xhr.get(searchUrl)
            .then(function(results) {
                this.trigger(eventName, results.content);

                this.nextSearch.offset = this.nextSearch.offset ? this.nextSearch.offset += results.content.length : results.content.length;
            }.bind(this), function(err) {
                this.trigger('noResult');
            }.bind(this));
    },

    moreResults: function() {
        this.search(this.nextSearch, 'update');
    },

    destroy: function() {
        this.$elem.remove();
    }
};

FilterBar.prototype = Object.assign({}, prototype, eventablejs);

module.exports = FilterBar;
