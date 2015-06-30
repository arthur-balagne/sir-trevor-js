var _            = require('../lodash.js');
var xhr          = require('etudiant-mod-xhr');
var eventablejs  = require('eventablejs');

var renderField = require('./field-builder.js');

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

var filterBarTemplate = [
    '<div class="st-block__filter-wrapper">',
        '<form name="" class="st-block__filter">',
            '<%= fields %>',
        '</form>',
    '</div>'
].join('\n');

var FilterBar = function() {
    this.init.apply(this, arguments);
};

var prototype = {
    init: function(params) {
        this.app = params.app;
        this.url = params.url;
        this.limit = params.limit;
        this.type = params.type;
        this.fields = params.fields;
        this.application = params.application;
        this.subType = params.subType;
        this.template = filterBarTemplate;

        if (params.container) {
            if (params.before === true) {
                params.container.before(this.render(this.fields));
                this.bindToDOM(params.container.parent());
            }
            else {
                params.container.append(this.render(this.fields));
                this.bindToDOM(params.container);
            }
        }
    },

    render: function() {
        var fieldMarkup = '';

        this.fields.forEach(function(field) {
            fieldMarkup += renderField(field);
        });

        return _.template(filterBarTemplate, { fields: fieldMarkup });
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

        this.trigger(eventName + ':start');

        search = Object.assign(search, searchBuilder(this.$elem), {
            limit: this.limit,
            application: this.app,
            type: this.type
        });

        if (this.application) {
            search.application = this.application;
        }

        if (this.subType) {
            search.type = this.subType;
        }

        this.nextSearch = search;

        var searchUrl = xhr.paramizeUrl(this.url, search);

        xhr.get(searchUrl)
            .then(function(searchResult) {
                if (searchResult.content) {
                    this.trigger(eventName + ':result', searchResult.content);
                    this.nextSearch.offset = this.nextSearch.offset ? this.nextSearch.offset += searchResult.content.length : searchResult.content.length;
                }
                else {
                    this.trigger(eventName + ':no-result');
                }
            }.bind(this), function(err) {
                this.trigger(eventName + ':error', err);
            }.bind(this));
    },

    moreResults: function() {
        this.search(this.nextSearch, 'update');
    },

    destroy: function() {
        this.$elem.parent().remove();
    }
};

FilterBar.prototype = Object.assign({}, prototype, eventablejs);

module.exports = FilterBar;
