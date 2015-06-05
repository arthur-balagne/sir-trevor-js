var $ = require('jquery');
var _ = require('../lodash.js');

var subBlockTypes = {
    jcs: require('./jcsSubBlock.js'),
    video: require('./videoSubBlock.js'),
    image: require('./imageSubBlock.js'),
    filteredImage: require('./filteredImageSubBlock.js')
};

function buildSingleBlock(type, contents, subType) {
    return new subBlockTypes[type](contents, subType);
}

function handleClick(event) {
    if ($(event.target).hasClass('st-sub-block-link')) {
        window.open($target.attr('href'), '_blank');
    }
    else {
        var id = $(event.currentTarget).data('sub-block-id').toString();

        event.data.callback(id);
    }
}

var SubBlockManager = {

    bindEventsOnContainer: function(container, callback) {
        container.on('click', '[data-sub-block-id]', { callback: callback }, handleClick);
    },

    unBindEventsOnContainer: function(container) {
        container.off('click', handleClick);
    },

    getSubBlockById: function(id, subBlocks) {
        var retrievedSubBlock;

        subBlocks.some(function(subBlock) {
            if (subBlock.id === id) {
                retrievedSubBlock = subBlock;
                return true;
            }
        });

        if (retrievedSubBlock) {
            return retrievedSubBlock;
        }

        return false;
    },

    parseFilters: function(jsonFilters) {
        var formatsObj = {};
        Object.keys(jsonFilters.content).forEach(function(key, value) {
            var formatsTabObject = jsonFilters.content.formats;
            Object.keys(formatsTabObject).forEach(function(k, val) {
                var formatObject = formatsTabObject[k];
                var id = formatObject.id;
                var label = formatObject.label;
                formatsObj[id] = label;
            });
        });
        return formatsObj;
    },
    /**
     * Parse a json lits of images
     * @param  {JSON} jsonMedias
     * @param  {OBJECT} filters
     * @return {Array}
     */
    parseMedias: function(jsonMedias, filters) {
        console.log(jsonMedias);
        var rowsTab = [];
        var optionsTemplate = _.template('<option data-picture="<%= image %>" value="<%= format %>"><%= format %></option>');

        Object.keys(jsonMedias.content).forEach(function(key, value) {
            var formatsTabObject = jsonMedias.content;
            Object.keys(formatsTabObject[value].format_ids).forEach(function(k, val) {
                formatsTabObject[value].format_ids[k] = optionsTemplate({
                    image: formatsTabObject[value].image,
                    format: filters[formatsTabObject[value].format_ids[k]]
                })
            });
            rowsTab.push(formatsTabObject[value])
        });
        return rowsTab;
    },

    jsonInit: function(jsonMedias, jsonFilters) {
        var filters = this.parseFilters(jsonFilters);
        var medias = this.parseMedias(jsonMedias, filters);
        var formatedArray = new Array();
        formatedArray.push(medias);
        return formatedArray;
    },

    render: function(subBlocks) {
        return subBlocks.map(function(subBlock) {
            return subBlock.renderSmall();
        });
    },

    build: function(type, contents, subType) {
        return contents.map(function(singleContent) {
            return buildSingleBlock(type, singleContent, subType);
        });
    }
};

module.exports = SubBlockManager;
