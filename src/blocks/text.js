'use strict';

/*
  Text Block
*/

/*
    ATTENTION - contains a lot of duplicate code - see framed.js
 */

var $                     = require('jquery');
var _                     = require('../lodash.js');
var contentEditableHelper = require('../helpers/content-editable-helper.js');
var Block                 = require('../block');
var eventBus              = require('../event-bus.js');
var evt                   = require('etudiant-mod-mediator');
var Modal                 = require('etudiant-mod-modal');
var ModalHelper           = require('../helpers/modal.class.js');
var Slider                = require('../helpers/slider.class.js');
var stToHTML              = require('../to-html');
var subBlockManager       = require('../sub_blocks/index.js');
var xhr                   = require('etudiant-mod-xhr');

var modalHelper = new ModalHelper();

var sel;
var range;

function getTemplate(params) {
    var template = '<div class="frame"  style="box-sizing:border-box; display:inline-block; width:100%; background-color:' + params.frameColor + '; border: 3px solid ' + params.frameBorder + '">';
    template += '</div>';
    return template;
}

// @todo to refactor - duplicate code - see framed.js
function textBlockListeners(textBlock){
    textBlock.on('click', function(){
        if ($(this).hasClass('st-block-control-ui-btn')) {
            return;
        }
        sel = window.getSelection();
        range = sel.getRangeAt(0);
    });

    textBlock.on('click', function(e){
        if ($(this).hasClass('st-block-control-ui-btn')) {
            return;
        }
        modalHelper.sel = window.getSelection();
        modalHelper.range = modalHelper.sel.getRangeAt(0);
    });

    textBlock.on('keypress', function(e){
        modalHelper.sel = window.getSelection();
        modalHelper.range = modalHelper.sel.getRangeAt(0);
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
            var selection = window.getSelection();
            range = selection.getRangeAt(0);
            var newline = document.createElement('br');

            range.deleteContents();
            range.insertNode(newline);
            range.setStartAfter(newline);
            range.setEndAfter(newline);
            range.collapse(false);
            selection.removeAllRanges();
            modalHelper.sel.addRange(range);
        }
    });
}

// @todo refactor duplicate code - see text.js
function getModalMedias(block){
    var filterUrl = block.globalConfig.apiUrl + '/edt/media/filters/' + block.globalConfig.application;
    var initialMediaUrl = block.globalConfig.apiUrl + '/edt/media?application=' + block.globalConfig.application + '&type=image&limit=20';

    Promise.all([
        xhr.get(filterUrl, {
            data: {
                access_token: block.globalConfig.accessToken
            }
        }),
        xhr.get(initialMediaUrl, {
            data: {
                access_token: block.globalConfig.accessToken
            }
        })
    ])
    .then(function(data) {
        var modalTemplateFilters = data[0];
        var modalTemplateStep1 = data[1];

        // eventBus.trigger('button:control-0:enable');

        var mediasArray = subBlockManager.jsonInit(modalTemplateStep1, modalTemplateFilters);
        var filteredImages = subBlockManager.build('filteredImage', null, mediasArray[0]);
        var slides = [];

        Object.keys(modalTemplateStep1.content).forEach(function(k){
            modalHelper.filteredImagesTab['row-' + modalTemplateStep1.content[k].id] = filteredImages[k];
            slides.push(filteredImages[k].renderSmall(modalTemplateStep1.content[k]));
        });

        var params = {
            contents: slides,
            itemsPerSlide: 5,
            increment: 2
        };

        var slider = new Slider(params);

        // slider.eventBus = eventBus;

        //Subcribe modals to mediator
        evt.subscribe('modal-gallery-step-1', function(param, channel) {
            channel.stopPropagation();
            modalHelper.openModalStep1(modalHelper.modalStep1, slider);
            var $modal = $(modalHelper.modalStep1.$elem.children('.modal-inner-content')[0]);
            var fields = modalHelper.filterBarFormatter(modalTemplateFilters);
            var filterBar = modalHelper.loadFilterBar(block.globalConfig.apiUrl, block.globalConfig.accessToken, fields, $modal);

            slider.alwaysAppendToDOM($modal);

            filterBar.on('search', function(returnedData){
                var filtersObj = filteredImages[0].parseFilters(modalTemplateFilters);
                // Prepare all selects options, then bind them in the object;
                Object.keys(returnedData).forEach(function(key){
                    var list = '';
                    var formats = returnedData[key].format_ids;

                    Object.keys(formats).forEach(function(k){
                        var optionsTemplate = _.template('<option data-picture="<%= image %>" value="<%= format %>"><%= format %></option>');

                        list = list + optionsTemplate({
                            image: returnedData[key].file,
                            format: filtersObj[formats[k]]
                        });

                    });

                    returnedData[key].format_ids = list;
                });
                filteredImages = subBlockManager.build('filteredImage', returnedData, null);

                // reset slides to an empty array
                slides = [];


                Object.keys(returnedData).forEach(function(k){
                    modalHelper.filteredImagesTab['row-' + returnedData[k].id] = filteredImages[k];
                    slides.push(filteredImages[k].renderSmall(returnedData[k], 90));
                });

                slider.reset(slides);
                sliderControls(slider);
                modalHelper.selectUpdater();
                modalHelper.updateZoom(modalHelper.filteredImagesTab);
            });

            modalHelper.selectUpdater();
            modalHelper.updateZoom(modalHelper.filteredImagesTab);

            $('body .modal-footer .before').addClass('disabled');
            modalHelper.sliderControls(slider);

            modalHelper.synchronizeAndOpenStep2(param);
        });

        evt.subscribe('modal-gallery-step-2', function(param) {
            if (param.filteredImage !== undefined) {
                modalHelper.modalTemplateStep2 = param.filteredImage.renderLarge();
            }
            modalHelper.openModalStep2(modalHelper.modalStep2);
            modalHelper.synchronizeAndCloseStep2(param);
        });
        block.ready();
        evt.publish('modal-gallery-step-1', block); //Call the modal event
    }).catch(function(err){
        console.error(err);
        console.error('Something went wrong');
    });
}


module.exports = Block.extend({
    type: 'text',
    controllable: true,
    formattable: true,
    paragraphable: true,
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
                this.loading();
                getModalMedias(this);
            }
        },
        {
            slug: 'add-paragraph',
            'icon': 'Paragraph',
            sleep: true,
            eventTrigger: 'click',
            fn: function(ev) {
                ev.preventDefault();
                ev.stopPropagation();

                var block = this;

                contentEditableHelper.updateSelection(sel, range);

                var firstParagraph = contentEditableHelper.getSelectedContent(block);
                var secondParagraph = contentEditableHelper.getTextAfterParagraph(block, firstParagraph)

                this.getTextBlock().html(firstParagraph);
                this.instanceID = block.blockID;

                var data = { text: secondParagraph } ;

                block = this.mediator.trigger('block:create', 'text', data);
            }
        }
    ],

     onBlockRender: function() {
        modalHelper.modalStep1 = new Modal({
            slug: 'gallery-step-1',
            animation: 'fade',
            theme: 'medias'
        });
        modalHelper.modalStep2 = new Modal({
            slug: 'gallery-step-2',
            animation: 'fade',
            theme: 'media'
        });

        var textBlock = this.getTextBlock();
        textBlockListeners(textBlock);

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
    setData: function(blockData) {
        var content = this.getTextBlock();
        this.$editor.find('.wrapper').contents().unwrap();
        this.$editor.find('.wrapper').remove();
        $('.st-block__control-ui-elements').remove();
        var frameText =  content.html().replace(/(<\/?div>)/ig, '');
        var framedContent;
        if (frameText.length > 0) {
            framedContent = content.find('figure');
            if (framedContent.length === 0) {
                blockData.text = frameText;
            }
            else{
                blockData.images = {};
                blockData.text = frameText;
                framedContent.each(function(){ // replace all found figures with #id
                    var id = $(this).find('img').data('id');
                    blockData.images['row-' + id] = {};
                    var obj = {
                        id: $(this).find('img').data('id'),
                        legend: $(this).find('.legend').val(),
                        size: $(this).find('img').data('width')
                    };
                    if ($(this).find('img').parent().prop('tagName') === 'A'){
                        obj.link = $(this).find('img').parent().attr('href');
                    }
                    Object.assign(blockData.images['row-' + id], obj);

                    if ($(this).hasClass('f-left')) {
                        blockData.images['row-' + id].align = 'f-left';
                    }
                    else {
                        blockData.images['row-' + id].align = 'f-right';
                    }
                    $('.picture-' + id).parent().replaceWith('#' + id + ' ');
                    blockData.text = content.html();

                });
            }
        }
        Object.assign(this.blockStorage.data, blockData || {});
    },

    loadData: function(data){
        var ids = '';
        var self = this;

        this.imagesData = data.images;

        if (data.text !== undefined) {
            ids = data.text.match(/#\w+/g);
        }

        if (ids === null) {
            self.getTextBlock().html(data.text);
            return data;
        }

        Object.keys(ids).forEach(function(value) {
            var val = ids[value].split('#')[1];

            var url = self.globalConfig.apiUrl + '/edt/media/' + val;

            /**
             * Callback function to fetch the blocks data from the API
             */
            xhr.get(url, {
                data: {
                    access_token: self.globalConfig.accessToken
                }
            })
            .then(function(result) {
                result.content = Object.assign(result.content, {
                    size: data.images[val].size,
                    legend: data.images[val].legend,
                    align: data.images[val].align
                });

                var filteredBlock = subBlockManager.buildOne('filteredImage', null, null);

                filteredBlock.media = result.content;

                var tpl = filteredBlock.renderBlock();

                data.text = data.text.replace('#' + val, tpl);

                self.getTextBlock().html(data.text);
            })
            .catch(function(error) {
                console.error('Error retrieving image :', error);
            });
        });
        this.getTextBlock().html(stToHTML(data.text));

    }
});
