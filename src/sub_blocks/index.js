var $ = require('jquery');

var subBlocks = {
    jcs: require('./jcsSubBlock.js'),
    video: require('./videoSubBlock.js'),
    image: require('./imageSubBlock.js')
};

function buildSingleBlock(type, contents, subType) {
    return new subBlocks[type](contents, subType);
}

var SubBlockManager = {

    bindEventsToContainer: function(container, callback) {
        container.on('click', '[data-sub-block-id]', function(event) {
            var $target = $(event.target);

            if ($target.hasClass('st-sub-block-link')) {
                window.open($target.attr('href'), '_blank');
            }
            else {
                var id = $target.data('data-sub-block');

                callback(id);
            }
        });
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
