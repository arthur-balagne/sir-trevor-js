var $ = require('jquery');

var subBlockTypes = {
    jcs: {
        sondage: require('./jcs/sondageJcsSubBlock.js'),
        quiz: require('./jcs/quizJcsSubBlock.js'),
        profil: require('./jcs/testJcsSubBlock.js'),
    },
    video: require('./videoSubBlock.js'),
    image: require('./imageSubBlock.js')
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

        event.data.callback(id, event.currentTarget);
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
    }
};

module.exports = SubBlockManager;
