var $   = require('jquery');
var _   = require('../lodash.js');
var xhr = require('etudiant-mod-xhr');

var FilterBar = function(params) {
    this.blockReference = params.blockReference;
    this.$container = this.blockReference.$inner;
    this.options = params.options;
    this.url = params.url;
    this.limit = params.limit;

    this.eventBus = Object.assign({}, require('../events.js'));

    this.template = _.template([
        '<div class="st-block__filter">',
            '<input type="search" />',
            '<select>',
                '<%= options %>',
            '</select>',
        '</div>'
    ].join('\n'));

    this.$container.append(this.render());
    this.ready();
};

FilterBar.prototype = {
    render: function() {
        var optionMarkup = '';
        var optionTemplate = _.template('<option value="<%= value %>"><%= label %></option>');

        this.options.forEach(function(option) {
            optionMarkup += optionTemplate({
                value: option.value,
                label: option.label
            });
        });

        return this.template({
            options: optionMarkup
        });
    },

    ready: function() {
        this.$elem.on('keyup', 'input[type="search"]', _.debounce(function(event) {
            this.search();
        }.bind(this), 300));

        this.$elem.on('change', 'select', function(event) {
            this.search();
        }.bind(this));
    },

    search: function(search, eventName) {
        search = search || {};
        eventName = eventName || 'search';

        var fulltext = this.$elem.find('input[type="search"]').val();

        if (fulltext) {
            search.fulltext = fulltext;
        }

        var id = this.$elem.find('select').val();

        if (id) {
            search.id_thematique = id;
        }

        search.limit = this.limit;

        var searchUrl = xhr.paramizeUrl(this.url);
        // var searchUrl = xhr.paramizeUrl(this.url, search);

        xhr.get(searchUrl)
            .then(function(results) {
                this.eventBus.trigger(eventName, results);

                this.nextSearch = search;

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
    }
};

Object.defineProperty(FilterBar.prototype, '$elem', {
    get: function $elem() {
        return this.$container.find('.st-block__filter');
    }
});

module.exports = FilterBar;
