var $ = require('jquery');
var _ = require('../lodash.js');
var Media = require('../helpers/media.class.js');

var subBlockTypes = {
    jcs: {
        sondage: require('./jcs/sondageJcsSubBlock.js'),
        quiz: require('./jcs/quizJcsSubBlock.js'),
        profil: require('./jcs/testJcsSubBlock.js'),
    },
    video: require('./videoSubBlock.js'),
    image: require('./imageSubBlock.js'),
    filteredImage: require('./filteredImageSubBlock.js')
};

function buildSingleBlock(type, contents, subType) {
    if (typeof subBlockTypes[type] === 'function') {
        return new subBlockTypes[type](contents);
    }
    else if (typeof subBlockTypes[type][subType] === 'function') {
        return new subBlockTypes[type][subType](contents);
    }
    else {
      throw new Error('No matching type or subtype found for ' + type + ' and/or ' + subType);
    }
}

function handleClick(event) {
    if ($(event.target).hasClass('st-sub-block-link')) {
        window.open($target.attr('href'), '_blank');
    }
    else {
        var id = $(event.currentTarget).data('sub-block-id').toString();
<<<<<<< HEAD

        event.data.callback(id, event.currentTarget);
=======
        event.data.callback(id);
>>>>>>> 41fc64b5712f0d797a7bb953f112d5174fd09b59
    }
}
var  media = new Media();

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
            if (subBlock.id.toString() === id.toString()) {
                retrievedSubBlock = subBlock;
                return true;
            }
        });
        if (retrievedSubBlock) {
            return retrievedSubBlock;
        }
        return false;
    },


    jsonInit: function(jsonMedias, jsonFilters) {
        var params = {
            medias: jsonMedias,
            filters: jsonFilters,
            mediasType: 'filteredImage'
        }
        media.init(params);
        var filters = media.parseImagesFilters();
        var medias = media.parseImagesMedias();

        var formatedArray = new Array();
        formatedArray.push(medias);
        return formatedArray;
    },

    render: function(subBlocks) {
        return subBlocks.map(function(subBlock) {
            return subBlock.renderSmall();
        });
    },

    buildSingle: buildSingleBlock,

    build: function(type, contents, subType) {
        return contents.map(function(singleContent) {
            return buildSingleBlock(type, singleContent, subType);
        });
    },
    buildOne: function(type, contents, subType) {
        return buildSingleBlock(type, contents, subType);
    }
};

module.exports = SubBlockManager;
