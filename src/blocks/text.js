"use strict";

/*
  Text Block
*/

var evt = require('etudiant-mod-mediator');
var Block = require('../block');
var stToHTML = require('../to-html');
var $ = require('jquery');
var q  = require('q');
var Modal = require('etudiant-mod-modal');
var zoom = require('etudiant-mod-zoom');
var Slider   = require('../helpers/slider.class.js');
var eventBus = require('../event-bus.js');
var subBlockManager = require('../sub_blocks/index.js');
var FilterBar = require('../helpers/filterbar.class.js');
var xhr = require('etudiant-mod-xhr');



var apiUrl = 'http://api.letudiant.lk/edt/media';
var sel;
var range;

module.exports = Block.extend({

    type: 'text',
    controllable: true,
    formattable: true,
    title: function() { return i18n.t('blocks:text:title'); },
    editorHTML: '<div class="st-required text-block st-text-block" contenteditable="true"></div>',
    icon_name: 'text',
    eventBus: eventBus,
    controls_position: 'bottom',
    controls_visible: true,
    controls: [
        {
            slug: 'show-picture',
            'icon': 'image',
            sleep: true,
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var block = this;
                evt.publish('modal-gallery-step-1', block); //Call the modal event
            }
        }
    ],

     onBlockRender: function() {
        this.filteredImagesTab = '';

        var textBlock = this.$inner.find('.st-text-block');

        textBlock.on('keypress', function(e){
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            if (e.keyCode === 13) {
                //console.log(e.keyCode);
                //document.execCommand('insertHTML', false, '<br>');
                e.preventDefault();
                e.stopPropagation();
                var selection = window.getSelection();
                var range = selection.getRangeAt(0);
                var newline = document.createElement('br');

                range.deleteContents();
                range.insertNode(newline);
                range.setStartAfter(newline);
                range.setEndAfter(newline);
                range.collapse(false);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        // Ajax job before rendering modal
        q.all([ xhr.get('http://api.letudiant.lk/edt/media/filters/ETU_ETU'),
                xhr.get('http://api.letudiant.lk/edt/media?application=ETU_ETU&type=image') ])
        .then(function(data){
            modalTemplateFilters = data[0];
            modalTemplateStep1 = data[1];
            eventBus.trigger('button:control-0:enable');
            var mediasArray = subBlockManager.jsonInit(modalTemplateStep1, modalTemplateFilters);
            var filteredImages = subBlockManager.build('filteredImage', mediasArray[0], null);
            var slides = [];
            Object.keys(modalTemplateStep1.content).forEach(function(k){
                filteredImagesTab['row-' + modalTemplateStep1.content[k].id] = filteredImages[k];
                slides.push(filteredImages[k].renderSmall(modalTemplateStep1.content[k]));
            });
            var params = {
                contents: slides,
                itemsPerSlide: 5,
                increment: 2
            };
            var slider = new Slider(params);
            slider.eventBus = eventBus;

            //Subcribe modals to mediator
            evt.subscribe('modal-gallery-step-1', function(param, channel) {
                debugger;
                channel.stopPropagation();
                openModalStep1(modalStep1, slider);
                var $modal = $(modalStep1.$elem.children('.modal-inner-content')[0]);
                var fields = filterBarFormatter(modalTemplateFilters);
                var filterBar = loadFilterBar(fields, $modal);
                slider.alwaysAppendToDOM($modal);
                filterBar.on('search', function(returnedData){
                    var filtersObj = filteredImages[0].parseFilters(modalTemplateFilters);
                    var wrapper = {
                        content: returnedData
                    };
                    filteredImages = subBlockManager.build('filteredImage', returnedData, null);
                    slides = [];
                    var size = filtersObj[filterBar.nextSearch.format];
                    Object.keys(returnedData).forEach(function(k){
                        filteredImagesTab['row-' + returnedData[k].id] = filteredImages[k];
                        slides.push(filteredImages[k].renderSmall(data[k], size));
                    });
                    slider.reset(slides);
                    sliderControls(slider);
                    selectUpdater();
                    updateZoom(filteredImagesTab);
                });
                selectUpdater();
                updateZoom(filteredImagesTab);

                $('body .modal-footer .before').hide();
                sliderControls(slider);

                synchronizeAndOpenStep2(param);
            });
            evt.subscribe('modal-gallery-step-2', function(param) {
                openModalStep2(modalStep2);
                synchronizeAndCloseStep2(param);
            });
        });
    },
    _serializeData: function() {
        var data = {};
        var textBlock = this.getTextBlock().html();
        if (textBlock !== undefined && textBlock.length > 0) {
            data.text = this.toMarkdown(textBlock);
        }
        else {
            data.text = '';
        }
        return data;
    },
    setAndLoadData: function(blockData) {
        this.setData(blockData);
        this.beforeLoadingData();
    },
    getTextBlock: function() {
        this.text_block = this.$('.st-text-block');
        return this.text_block;
    },

    setData: function(blockData) {
        var content = this.getTextBlock();
        var frameText =  content.html();
        if (frameText.length > 0) {
            var framedContent = content.find('img');
            if (framedContent.data('object') === undefined) {
                var html = content.html();
                blockData.text = html;
                return blockData.text;
            }
            blockData.images = {};
            content.find('img').each(function(){
                var id = $(this).data('id');
                blockData.images[id] = JSON.parse(decodeURIComponent($(this).data('object')));
                $('img.picture-' +id).replaceWith('#' + id);

                if ($(this).hasClass('f-left')) {
                    blockData.images[id].align = 'f-left';
                }
                else {
                    blockData.images[id].align = 'f-right';
                }
            });

            blockData.text = content.html();
        }
        Object.assign(this.blockStorage.data, blockData || {});
    },

    loadData: function(data){
        this.imagesData = data.images;
        var ids = data.text.match(/#\w+/g);
        var that = this;

        Object.keys(ids).forEach(function(value) {
            var val = ids[value].split('#')[1];
            var url = 'http://api.letudiant.lk/edt/media/' + val;
            var tpl = '';
            /**
             * Callback function to fetch the blocks data from the API
             */
            var promise = function(urlParam) {
                    xhr.get(urlParam).then(function(result) {
                    result.content.size = data.images[val].size;
                    result.content.legend = data.images[val].legend;
                    var filteredBlock = subBlockManager.buildOne('filteredImage', null, null);

                    result.content.legend = data.images[val].legend;
                    result.content.size = data.images[val].size;
                    result.content.align = data.images[val].align;

                    filteredBlock.media = result.content;
                    tpl = filteredBlock.renderBlock();
                    data.text = data.text.replace('#' + val, tpl);

                    that.getTextBlock().html(data.text);
                });

            };
            promise(url);
        });
        this.getTextBlock().html(stToHTML(data.text));

    },
    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '$1');
    }
});
