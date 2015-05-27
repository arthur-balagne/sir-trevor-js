'use strict';

/*
  Jeux, Concours et Sondages Block
*/

var Block    = require('../block');
var stToHTML = require('../to-html');

var Slider    = require('../helpers/slider.js');
var FilterBar = require('../helpers/filterbar.js');

var apiUrl = 'http://api.letudiant.lk/jcs/';

var subBlockManager = require('../sub_blocks/index.js');

// @DEV
function getMock(){
    return require('../filtermock.json');
}
//@DEV END

function registerClickOnContents(block) {
    if (block.hasRegisteredClick !== true) {
        block.hasRegisteredClick = true;

        subBlockManager.bindEventsToContainer(block.$inner, function(selectedSubBlockId) {
            debugger;
            block.slider.destroy();
            block.filterBar.destroy();

            var selectedSubBlock = subBlockManager.getSubBlockById(selectedSubBlockId, block.subBlocks);

            block.setAndLoadData(selectedSubBlock.contents);

            // block.$inner.append(selectedSubBlock.renderBlock());
        });
    }
}

function filterOnUpdate(block, contentType) {
    block.slider.eventBus.on('progress', function() {
        block.filterBar.moreResults();
    });

    block.filterBar.eventBus.on('update', function(results) {
        var additionalSubBlocks = subBlockManager.build(contentType, results);
        var subBlockMarkup = subBlockManager.render(additionalSubBlocks);

        block.subBlocks = block.subBlocks.concat(additionalSubBlocks);

        block.slider.update(subBlockMarkup);
    });
}

function filterOnSearch(block, contentType) {
    block.filterBar.eventBus.on('search', function(results) {
        block.subBlocks = subBlockManager.build(contentType, results);

        var subBlockMarkup = subBlockManager.render(block.subBlocks);

        block.slider.reset(subBlockMarkup);

        registerClickOnContents(block);
    });
}

module.exports = Block.extend({

    chooseable: {
        name: 'contentType',
        options: [
            {
                title: 'Sondage',
                value: 'sondage'
            },
            {
                title: 'Quiz',
                value: 'quiz'
            },
            {
                title: 'Test de personnalité',
                value: 'test'
            }
        ]
    },

    onChoose: function(choices) {
        this.subBlocks = [];
        this.selectedContentType = choices.contentType;

        var filterBarUrl = apiUrl + this.selectedContentType + '/search';

        var getFilterOptions = function() {
            return new Promise(function(resolve, reject) {
                var mock = getMock();
                resolve(mock.content.thematics);
            });
        };

        getFilterOptions()
            .then(function(filterOptionsRaw) {
                var filterOptions = filterOptionsRaw.map(function(filterOption) {
                    return {
                        value: filterOption.id,
                        label: filterOption.label
                    };
                });

                this.filterBar = new FilterBar({
                    url: filterBarUrl,
                    fields: [
                        {
                            type: 'search',
                            name: 'q',
                            label: 'Rechercher'
                        },
                        {
                            type: 'select',
                            name: 'thematique',
                            label: 'Thematique',
                            options: filterOptions
                        }
                    ],
                    limit: 20,
                    container: this.$inner
                });

                this.slider = new Slider({
                    controls: {
                        next: 'Next',
                        prev: 'Prev'
                    },
                    itemsPerSlide: 3,
                    increment: 2,
                    container: this.$inner
                });

                filterOnSearch(this, this.selectedContentType);
                filterOnUpdate(this, this.selectedContentType);

                this.filterBar.search();
            }.bind(this));
    },

    type: 'Jcs',

    title: function() {
        return 'Jeux';
    },

    editorHTML: '',

    icon_name: 'text',

    loadData: function(data) {
        debugger;
        // this.getTextBlock().html(stToHTML(data.text, this.type));
    },

    beforeBlockRender: function() {
    },

    onBlockRender: function() {
    }
});
