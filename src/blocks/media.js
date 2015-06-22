'use strict';

/*
  Media block - images et vidéos
*/

var $   = require('jquery');
var xhr = require('etudiant-mod-xhr');

var _     = require('../lodash.js');
var Block = require('../block');
var utils = require('../utils');

var SubBlockSearch = require('../helpers/sub-block-search.class.js');
var subBlockManager = require('../sub_blocks/index.js');

var chooseableConfig = {
    name: 'contentType',
    options: [
        {
            title: i18n.t('sub_blocks:image'),
            value: 'image'
        }, {
            title: i18n.t('sub_blocks:video'),
            value: 'video'
        }
    ]
};

function prepareCopyrights(copyrights) {
    return copyrights.map(function(copyright) {
        return {
            value: copyright.id,
            label: copyright.name
        };
    });
}

function onChoose(choices) {
    var block = this;

    block.subBlockType = choices.contentType;

    var categoryOptionsUrl = block.globalConfig.apiUrl + 'edt/' + block.type + '/filters/' + block.globalConfig.application;

    var categoryOptionsPromise = xhr.get(categoryOptionsUrl)
        .then(function(result) {
            block.copyrights = prepareCopyrights(result.content.copyrights);

            return result.content.categories.map(function(category) {
                return {
                    value: category.id,
                    label: category.label
                };
            });
        })
        .catch(function(err) {
            console.error(err);
        })
        .then(function(formattedCategories) {
            return {
                name: 'category',
                options: formattedCategories
            };
        });

    var filterConfig = {
        url: block.globalConfig.apiUrl + 'edt/' + block.type,
        fields: [
            {
                type: 'search',
                name: 'query',
                placeholder: 'Rechercher'
            }, {
                type: 'select',
                name: 'category',
                placeholder: 'Category',
                options: categoryOptionsPromise
            }
        ],
        limit: 20,
        container: block.$inner,
        application: block.globalConfig.application,
        subType: block.subBlockType
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
        this.$inner.prepend(this.$inputs);
    }.bind(this));

    this.subBlockSearch.on('selected', function(selectedSubBlock) {
        this.setData({
            id: selectedSubBlock.contents.id,
            type: block.subBlockType
        });

        this.subBlockSearch.destroy();
        this.subBlockSearch = null;

        // this.$editor.html(selectedSubBlock.renderLarge());
        this.$inputs.hide();
        this.$editor.show();
    }.bind(this));
}

module.exports = Block.extend({
    type: 'media',

    title: function() {
        return i18n.t('blocks:medias:title');
    },

    chooseable: true,
    droppable: true,
    uploadable: true,

    icon_name: 'image',

    editorHTML: '<div class="st-medias-block"></div>',

    loadData: function(data) {
        if (!_.isEmpty(data)) {
            this.loading();

            var retrieveUrl = this.globalConfig.apiUrl + 'edt/' + this.type + '/' + data.id;

            xhr.get(retrieveUrl)
                .then(function(rawSubBlockData) {
                    var subBlockData = Object.assign({}, rawSubBlockData.content, data);

                    var mediaSubBlock = subBlockManager.buildSingle(this.type, data.type, subBlockData);

                    // this.$editor.html(mediaSubBlock.renderLarge());

                    this.ready();
                }.bind(this))
                .catch(function(err) {
                    throw new Error('No block returned for id:' + this.subBlockData.id + ' on app:' + this.subBlockData.application + ' ' + err);
                }.bind(this));
        }
    },

    onBlockRender: function() {
        if (_.isEmpty(this.blockStorage.data)) {
            this.$inputs.detach();

            this.$inputs.find('input').on('change', function(e) {
                this.onDrop(e.currentTarget);
            }.bind(this));

            this.createChoices(chooseableConfig, onChoose.bind(this));
        }
    },

    onDrop: function(transferData) {
        var file = transferData.files[0];
        var urlAPI = (typeof window.URL !== 'undefined') ? window.URL : (typeof window.webkitURL !== 'undefined') ? window.webkitURL : null;

        if (/image|video/.test(file.type)) {
            this.loading();


            this.$dropzone.html($('<img>', {
                'class': 'placeholder-image',
                src: urlAPI.createObjectURL(file)
            }));

            this.$uploader.hide();

            this.subBlockSearch.destroy();
            this.subBlockSearch = null;

            // this.uploader(
                // file,
                // function(uploadData) {
                    // var retrieveUrl = this.globalConfig.apiUrl + 'edt' + '/' + this.type + '/' + uploadData.idMedia;
                    var retrieveUrl = 'http://api.letudiant.lk/edt/media/281615';

                    xhr.get(retrieveUrl)
                        .then(function(subBlockData) {
                            this.$inputs.hide();

                            var mediaSubBlock = subBlockManager.buildSingle(this.type, this.subBlockType, subBlockData.content);

                            mediaSubBlock.activateEditable(this.copyrights);

                            mediaSubBlock.appendTo(this.$editor);

                            this.$editor.show();

                            // mediaSubBlock.appendTo(this.$editor);

                            // mediaSubBlock.registerEvents();

                            this.ready();

                            // this.$editor.html(mediaSubBlock.renderLarge());
                            // mediaSubBlock.bindToRenderedElement(this.$editor.find('.st-sub-block'));
                        }.bind(this))
                        .catch(function(err) {
                            throw new Error('No block returned for id:' + uploadData.idMedia + ' ' + err);
                        }.bind(this));

                    // this.setData(uploadedMediaData);
                    // this.ready();
                // },
                // function(error) {
                    // this.addMessage(i18n.t('blocks:image:upload_error'));
                    // this.ready();
                    // console.error(error);
                // }
            // );
        }
    }
});
