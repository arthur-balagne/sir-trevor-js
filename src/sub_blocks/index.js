var $ = require('jquery');

var subBlocks = {
    quiz: require('./quizSubBlock.js'),
    sondage: require('./sondageSubBlock.js'),
    test: require('./testSubBlock.js'),
    video: require('./videoSubBlock.js'),
    image: require('./imageSubBlock.js')
};

function buildSingleBlock(type, contents) {
    return new subBlocks[type](type, contents);
}

var SubBlockManager = {

    bindEventsToContainer: function(container, callback) {
        container.on('click', '[data-sub-block-id]', function(event) {
            var id = $(event.target.srcElement).data('data-sub-block');

            callback(id);
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
            return subBlock.render();
        });
    },

    build: function(type, contents) {
        return contents.map(function(singleContent) {
            return buildSingleBlock(type, singleContent);
        });
    }
};

module.exports = SubBlockManager;
