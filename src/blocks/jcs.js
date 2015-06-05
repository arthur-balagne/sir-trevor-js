'use strict';

/*
  Jeux, Concours et Sondages Block
*/

var $        = require('jquery');
var xhr      = require('etudiant-mod-xhr');
var animate  = require('velocity-commonjs/velocity.ui');

var Block    = require('../block');
var stToHTML = require('../to-html');

var Slider    = require('../helpers/slider.class.js');
var FilterBar = require('../helpers/filterbar.class.js');
var Spinner   = require('../helpers/spinner.class.js');

var apiUrl = 'http://api.letudiant.lk/jcs/';
var filterOptionsUrl = apiUrl + 'thematique/list';

var subBlockManager = require('../sub_blocks/index.js');

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
        var additionalSubBlocks = subBlockManager.build('jcs', results, contentType);
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

module.exports = Block.extend({

    stateable: true,

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
        this.$spinner = new Spinner();
        this.subBlocks = [];
        this.selectedContentType = choices.contentType;

        var filterBarUrl = apiUrl + this.selectedContentType + '/search';

        this.$spinner.appendTo(this.$inner);

        return xhr.get(filterOptionsUrl)
            .then(function(result) {
                return result.content;
            }, function(err) {
                console.error(err);
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

                filterSearch(this, this.selectedContentType);
                filterUpdate(this, this.selectedContentType);

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

    },

    beforeBlockRender: function() {
    },

    onBlockRender: function() {
    }
});
