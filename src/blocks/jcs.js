'use strict';

/*
  Jeux, Concours et Sondages Block
*/

var Block    = require('../block');
var stToHTML = require('../to-html');

var Slider    = require('../helpers/slider.class.js');
var FilterBar = require('../helpers/filterbar.class.js');

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
            block.slider.destroy();
            block.filterBar.destroy();

            var selectedSubBlock = subBlockManager.getSubBlockById(selectedSubBlockId, block.subBlocks);

            block.setAndLoadData(selectedSubBlock.contents);

            block.$inner.append(selectedSubBlock.renderLarge());

            subBlockManager.unBindEventsOnContainer(block.$inner);
        });
    }
}

function filterOnUpdate(block, contentType) {
    block.slider.eventBus.on('progress', function() {
        block.filterBar.moreResults();
    });

    block.filterBar.eventBus.on('update', function(results) {
        var additionalSubBlocks = subBlockManager.build('jcs', results, contentType);
        var subBlockMarkup = subBlockManager.render(additionalSubBlocks);

        block.subBlocks = block.subBlocks.concat(additionalSubBlocks);

        block.slider.update(subBlockMarkup);
    });
}

function filterOnSearch(block, contentType) {
    block.filterBar.eventBus.on('search', function(results) {
        block.subBlocks = subBlockManager.build('jcs', results, contentType);

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
                value: 'profil'
            }
        ]
    },

    onChoose: function(choices) {
        this.subBlocks = [];
        this.selectedContentType = choices.contentType;

        var filterBarUrl = apiUrl + this.selectedContentType + '/search';

        return new Promise(function(resolve, reject) {
            var mock = getMock();
            resolve(mock.content.thematics);
        })
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
                        name: 'query',
                        label: 'Rechercher'
                    },
                    {
                        type: 'select',
                        name: 'thematic',
                        label: 'Thematique',
                        placeholder: 'Sélectionnez une thématique',
                        options: filterOptions
                    }
                ],
                limit: 20,
                app: 'ETU_ETU',
                container: this.$inner
            });

            this.slider = new Slider({
                controls: {
                    next: 'Next',
                    prev: 'Prev'
                },
                itemsPerSlide: 2,
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
        // this.getTextBlock().html(stToHTML(data.text, this.type));
    },

    beforeBlockRender: function() {
    },

    onBlockRender: function() {
    }
});
