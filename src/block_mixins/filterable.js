'use strict';

var $   = require('jquery');
var _   = require('../lodash');
var xhr = require('etudiant-mod-xhr');

var tFilterContainer = [
    '<div id="<%= id %>" class="st-block__filter">',
        '<%= filter_header %>',
        '<div class="st-block__filter-result"></div>',
        '<%= filter_footer %>',
    '</div>'
].join('\n');

var tFilterHeader = [
    '<header class="st-block__filter-header">',
        '<input type="search" />',
        '<select>',
            '<%= options %>',
        '</select>',
    '</header>'
].join('\n');

var tFilterHeaderOption = '<option value="<%= value %>"><%= label %></option>';

var tFilterFooter = [
    '<footer class="st-block__filter-footer">',
        '<%= filter_buttons %>',
    '</footer>'
].join('\n');

var tFilterButton = [
    '<button <%= button_attr %>>',
        '<span><%= button_text %></span>',
    '</button>'
].join('\n');

var buildHeader = function(options) {
    var optionMarkup = '';

    options.forEach(function(option) {
        optionMarkup += _.template(tFilterHeaderOption)({
            value: option.value,
            label: option.label
        });
    });

    var header = _.template(tFilterHeader)({
        options: optionMarkup
    });

    return header;
};

var buildFooter = function(buttons) {
    var buttonMarkup = '';

    Object.keys(buttons).forEach(function(key) {
        buttonMarkup += _.template(tFilterButton)({
            button_attr: 'data-' + key,
            button_text: buttons[key]
        });
    });

    var footer = _.template(tFilterFooter)({
        filter_buttons: buttonMarkup
    });

    return footer;
};

var launchSearch = function() {
    // must enter search state
};

var renderResults = function() {
    // results of ajax call
};

var FilterBar = function(container, config) {
    this.$container = container;
    this.id = 'st-block__filter-' + Date.now(),
    this.config = config;
};

FilterBar.prototype = {
    render: function() {
        var rendered = _.template(tFilterContainer)({
            id: this.id,
            filter_header: buildHeader(this.config.header.options),
            filter_footer: buildFooter(this.config.footer)
        });

        return rendered;
    },

    inject: function() {

    },

    ready: function() {
        this.$container.on('keyup', 'div#' + this.id, _.debounce(function() {
            this.search();
        }.bind(this), 200));

        this.$container.on('change', 'div#' + this.id, function(event) {
            this.search();
        }.bind(this));
    },

    search: function() {
        // this.$inner.
    }
};

module.exports = {

    mixinName: 'Filterable',

    initializeFilterable: function() {

        if (this.filterConfig) {

            var filterBar = new FilterBar(this.$inner, this.filterConfig);

            this.$inner.html(filterBar.render());

            filterBar.ready();
        }

        /*
            fulltext
            id_thematique
            limit
            offset
         */
    }
};
