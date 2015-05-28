var $ = require('jquery');

var subBlockTypes = {
    jcs: require('./jcsSubBlock.js'),
    video: require('./videoSubBlock.js'),
    image: require('./imageSubBlock.js')
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

    bindEventsToContainer: function(container, callback) {
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
