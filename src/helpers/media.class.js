'use strict'

var _ = require('../lodash.js');

// @todo most likely needs to be refactored into filteredImageSubBlock

/**
 * Constructor
 */
var Media = function() {
};

Media.prototype = {

    init: function(params) {
        this.medias = params.medias,
        this.filters = params.filters
    },

    parseImagesFilters: function() {
        var formatsObj = {};
        var jsonFilters = this.filters;
        Object.keys(jsonFilters.content).forEach(function(key, value) {
            var formatsTabObject = jsonFilters.content.formats;
            Object.keys(formatsTabObject).forEach(function(k, val) {
                var formatObject = formatsTabObject[k];
                var id = formatObject.id;
                var label = formatObject.label;
                formatsObj[id] = label;
            });
        });
        this.filterObj = formatsObj;
        return formatsObj;
    },

    /**
     * Parse a json list of images
     * @param  {JSON} jsonMedias
     * @param  {OBJECT} filters
     * @return {Array}
     */
    parseImagesMedias: function() {
        var rowsTab = [];
        var jsonMedias = this.medias;
        var filters = this.filters.content;
        var filterObj = this.filterObj;
        var optionsTemplate = _.template('<option data-picture="<%= image %>" value="<%= format %>"><%= format %></option>');

        Object.keys(jsonMedias.content).forEach(function(key, value) {
            var formatsTabObject = jsonMedias.content;
            Object.keys(formatsTabObject[value].format_ids).forEach(function(k, val) {
                formatsTabObject[value].format_ids[k] = optionsTemplate({
                    image: formatsTabObject[value].file,
                    format: filterObj[formatsTabObject[value].format_ids[k]]
                })
            });
            rowsTab.push(formatsTabObject[value])
        });

        return rowsTab;
    }
};

module.exports = Media;
