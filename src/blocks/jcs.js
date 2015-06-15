'use strict';

/*
  Jeux, Concours et Sondages Block
*/

var xhr = require('etudiant-mod-xhr');

var _     = require('../lodash.js');
var Block = require('../block');

var SubBlockSearch  = require('../helpers/sub-block-search.class.js');
var subBlockManager = require('../sub_blocks/index.js');

var chooseableConfig = {
    name: 'contentType',
    options: [
        {
            title: i18n.t('sub_blocks:jcs:poll'),
            value: 'poll'
        }, {
            title: i18n.t('sub_blocks:jcs:quiz'),
            value: 'quiz'
        }, {
            title: i18n.t('sub_blocks:jcs:personality'),
            value: 'personality'
        }
    ]
};

function onChoose(choices) {
    var block = this;

    block.subBlockType = choices.contentType;

    var thematicOptionsUrl = block.globalConfig.apiUrl + block.type + '/thematic/list/' + block.subBlockType;

    var thematicOptionsPromise = xhr.get(thematicOptionsUrl)
        .then(function(result) {
            return result.content.map(function(filterOption) {
                return {
                    value: filterOption.id,
                    label: filterOption.label
                };
            });
        })
        .catch(function(err) {
            console.error(err);
        })
        .then(function(formatedFilterOptions) {
            return {
                name: 'thematic',
                options: formatedFilterOptions
            };
        });

    var filterConfig = {
        url: block.globalConfig.apiUrl + block.type + '/' + block.subBlockType + '/search',
        fields: [
            {
                type: 'search',
                name: 'query',
                placeholder: 'Rechercher'
            }, {
                type: 'select',
                name: 'thematic',
                placeholder: 'Thematique',
                options: thematicOptionsPromise
            }
        ],
        limit: 20,
        container: block.$inner,
        application: block.globalConfig.application
    };

    var sliderConfig = {
        controls: {
            next: 'Next',
            prev: 'Prev'
        },
        itemsPerSlide: 2,
        increment: 2,
        container: block.$inner
    };

    this.subBlockSearch = new SubBlockSearch({
        apiUrl: block.globalConfig.apiUrl,
        block: block,
        filterConfig: filterConfig,
        sliderConfig: sliderConfig
    });

    this.subBlockSearch.on('ready', function() {
        console.log('subBlockSearch triggered ready');
    });

    this.subBlockSearch.on('selected', function(selectedSubBlock) {
        this.setData({
            id: selectedSubBlock.id,
            application: selectedSubBlock.contents.application,
            type: selectedSubBlock.type
        });

        this.slider.destroy();
        this.filterBar.destroy();

        this.getBlock().html(selectedSubBlock.renderLarge());
    }.bind(this));
}

module.exports = Block.extend({

    chooseable: true,

    type: 'jcs',

    title: function() {
        return i18n.t('blocks:jcs:title');
    },

    editorHTML: '<div class="st-jcs-block"></div>',

    icon_name: 'poll',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            this.loading();

            var retrieveUrl = this.globalConfig.apiUrl + this.type + '/' + data.type + '/' + data.id + '/' + data.application;

            xhr.get(retrieveUrl)
                .then(function(subBlockData) {
                    var subBlock = subBlockManager.buildSingle(this.type, subBlockData.content, data.type);

                    this.$editor.html(subBlock.renderLarge());

                    this.ready();
                }.bind(this))
                .catch(function(err) {
                    throw new Error('No block returned for id:' + this.subBlockData.id + ' on app:' + this.subBlockData.application + ' ' + err);
                }.bind(this));
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    }
});
