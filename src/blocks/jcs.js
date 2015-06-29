'use strict';

/*
  Jeux, Concours et Sondages Block
*/


var xhr     = require('etudiant-mod-xhr');
var animate = require('velocity-commonjs/velocity.ui');

var Block     = require('../block');
var Slider    = require('../helpers/slider.class.js');
var FilterBar = require('../helpers/filterbar.class.js');
var Spinner   = require('../helpers/spinner.class.js');

var subBlockManager = require('../sub_blocks/index.js');

var apiUrl = 'http://api.letudiant.lk/jcs/';
var filterOptionsUrl = apiUrl + 'thematique/list/';

var chooseableConfig = {
    name: 'contentType',
    options: [
        {
            title: 'Sondage',
            value: 'sondage'
        }, {
            title: 'Quiz',
            value: 'quiz'
        }, {
            title: 'Test de personnalité',
            value: 'profil'
        }
    ]
};

function registerClickOnContents(block) {
    if (block.hasRegisteredClick !== true) {
        block.hasRegisteredClick = true;

        subBlockManager.bindEventsOnContainer(block.$inner, function(selectedSubBlockId, clickedElem) {

            animate(clickedElem, 'callout.bounce', { duration: 400 })
                .then(function() {
                    block.slider.destroy();
                    block.filterBar.destroy();

                    var selectedSubBlock = subBlockManager.getSubBlockById(selectedSubBlockId, block.subBlocks);

                    block.setAndLoadData(selectedSubBlock.contents);

                    block.$inner.append(selectedSubBlock.renderLarge());

                    subBlockManager.unBindEventsOnContainer(block.$inner);
                });
        });
    }
}

function filterUpdate(block, contentType) {
    block.slider.on('progress', function() {
        block.filterBar.moreResults();
    });

    block.filterBar.on('update', function(results) {
        var additionalSubBlocks = subBlockManager.build(block.type, results, contentType);
        var subBlockMarkup = subBlockManager.render(additionalSubBlocks);

        block.subBlocks = block.subBlocks.concat(additionalSubBlocks);

        block.slider.update(subBlockMarkup);
    });
}

function filterSearch(block, contentType) {
    block.filterBar.on('search', function(results) {
        block.$spinner.fadeOut()
            .then(function() {
                block.subBlocks = subBlockManager.build('jcs', results, contentType);

                var subBlockMarkup = subBlockManager.render(block.subBlocks);

                block.slider.reset(subBlockMarkup);

                registerClickOnContents(block);
            });
    });

    block.filterBar.on('noResult', function() {
        block.subBlocks = [];

        block.$spinner.fadeOut()
            .then(function() {
                block.slider.reset();
            });
    });
}

function onChoose(choices) {
    var block = this;

    block.$spinner = new Spinner();
    block.subBlocks = [];
    block.selectedContentType = choices.contentType;

    var filterBarUrl = apiUrl + block.selectedContentType + '/search';

    block.$spinner.appendTo(block.$inner);

    return xhr.get(filterOptionsUrl + choices.contentType)
        .then(function(result) {
            return result.content;
        })
        .then(function(filterOptionsRaw) {

            var filterOptions = filterOptionsRaw.map(function(filterOption) {
                return {
                    value: filterOption.id,
                    label: filterOption.label
                };
            });

            block.filterBar = new FilterBar({
                url: filterBarUrl,
                fields: [
                    {
                        type: 'search',
                        name: 'query',
                        placeholder: 'Rechercher',
                    }, {
                        type: 'select',
                        name: 'thematic',
                        placeholder: 'Thematique',
                        options: filterOptions
                    }
                ],
                limit: 20,
                container: block.$inner
            });

            block.slider = new Slider({
                controls: {
                    next: 'Next',
                    prev: 'Prev'
                },
                itemsPerSlide: 2,
                increment: 2,
                container: block.$inner
            });

            filterSearch(block, block.selectedContentType);
            filterUpdate(block, block.selectedContentType);

            block.filterBar.search();
        })
        .catch(function(err) {
            console.error(err);
        });
}

module.exports = Block.extend({

    chooseable: true,

    type: 'jcs',

    title: function() {
        return i18n.t('blocks:sondage:title');
    },

    editorHTML: '',

    icon_name: 'poll',

    loadData: function(data) {
        if (data) {
            this.subBlockData = data;
        }
    },

    onBlockRender: function() {
        if (!this.subBlockData) {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
        else {
            var subBlock = subBlockManager.buildSingle(this.type, this.subBlockData, this.subBlockData.type);

            this.$inner.append(subBlock.renderLarge());
        }
    }
});
