'use strict';

/*
  Text Block
*/

var evt = require('etudiant-mod-mediator');
var $ = require('jquery');
var Block = require('../block');
var stToHTML = require('../to-html');
var q  = require('q');
var Modal = require('etudiant-mod-modal');
var Slider   = require('../helpers/slider.class.js');
var eventBus = require('../event-bus.js');
var subBlockManager = require('../sub_blocks/index.js');
var FilterBar = require('../helpers/filterbar.class.js');
var xhr = require('etudiant-mod-xhr');
var _   = require('../lodash.js');
var Spinner = require('spin.js');
var ModalHelper   = require('../helpers/modal.class.js');
var Editor = require('../helpers/editable.class.js');

var modalHelper = new ModalHelper();

var apiUrl = 'http://api.letudiant.lk/edt/media';
var sel;
var range;

// create our modals
var modalStep1 = new Modal({
    slug: 'gallery-step-1',
    animation: 'fade',
    theme: 'medias'
});
var modalStep2 = new Modal({
    slug: 'gallery-step-2',
    animation: 'fade',
    theme: 'media'
});
// modal templates;
var modalTemplateFilters;
var modalTemplateStep1;
var modalTemplateStep2;
var filteredImagesTab = [];

/**
 * Helper function to update the all data's image with the selected size value.
 */
function updateZoom(filteredImages) {
    $('#modal-gallery-step-1').on('change', '.modal-row-content .sizes', function(e) {
        e.stopPropagation();
        e.preventDefault();
        var zoomedSize = $(this).find(':selected').val();
        var rowId = $(this).parent().parent().attr('class').split(' ')[1];
        if (filteredImages !== undefined) {
            var originalSize = filteredImagesTab[rowId].media.file;
        }
        else {
            return false;
        }
        var newSize = modalHelper.changeOriginalPictureSize(originalSize, zoomedSize);

        $('.modal-row-picture.' + rowId).attr('data-image', newSize);
    });
}

function getTemplate(params) {
    var template = '<div class="frame"  style="box-sizing:border-box; display:inline-block; width:100%; background-color:' + params.frameColor + '; border: 3px solid ' + params.frameBorder + '">';
    template += '</div>';
    return template;
}

/**
 * Helper function to validate internal or external url
 */
function validateInternalUrl(url) {
    var hostNames = [
        'http://www.letudiant.fr',
        'http://www.editor-poc.lh',
        'http://www.letudiant.fr/trendy'
    ];
    var internal;
    var internal = false;
    Object.keys(hostNames).forEach(function(k){
        var hostname = hostNames[k];
        if (url.indexOf(hostname) >= 0) {
           internal = true;
        }
        else if (url.slice(0, 1) === '#'){
            internal = true;
        }
        else if (url.slice(0, 1) === '/'){
            internal = true;
        }
    });

    return internal;
}
/**
 * Show/Hide controls depending on events
 *
 */
function sliderControls(slider){

    slider.on('buttons:prev:disable', function() {
        $('body .modal-footer .before').addClass('disabled');
    });

    slider.on('buttons:prev:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .before').removeClass('disabled');
    });

    slider.on('buttons:next:disable', function() {
        $('body .modal-footer .next').addClass('disabled');
    });

    slider.on('buttons:next:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .next').removeClass('disabled');
    });

    slider.on('buttons:all:disable', function() {
        $('body .modal-footer').hide();
    });

    $('body .modal-footer').on('click', '.before', function(){
        slider.prev();
    });

    $('body .modal-footer ').on('click', '.next', function(){
        slider.next();
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
                evt.publish('modal-gallery-step-1', block); //Call the modal event
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

                var editor = new Editor();
                var block = this;
                editor.updateSelection(sel, range);
                var firstParagraph = editor.getSelectedContent(this);
                var secondParagraph = editor.getTextAfterParagraph(block, firstParagraph)
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
        textBlock.on('click', function(){
            if ($(this).hasClass('st-block-control-ui-btn')) {
                return;
            }

            sel = window.getSelection();
            range = sel.getRangeAt(0);
        });
        //Log selection and range
        if (modalHelper.sel !== undefined) {
            modalHelper.range = modalHelper.sel.getRangeAt(0);
        }
        textBlock.on('click', function(e){
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
        // Ajax job before rendering modal
        q.all([ xhr.get('http://api.letudiant.lk/edt/media/filters/ETU_ETU'),
                xhr.get('http://api.letudiant.lk/edt/media?application=ETU_ETU&type=image') ])
        .then(function(data){
            var mediasArray = subBlockManager.jsonInit(data[1], data[0]);

            var filteredImages = subBlockManager.build('filteredImage', mediasArray[0], null);
            var slides = [];
            Object.keys(data[1].content).forEach(function(k){
                modalHelper.filteredImagesTab['row-' + data[1].content[k].id] = filteredImages[k];
                slides.push(filteredImages[k].renderSmall(data[1].content[k]));
            });

            modalTemplateFilters = data[0];
            modalTemplateStep1 = data[1];
            eventBus.trigger('button:control-0:enable');

            var params = {
                contents: slides,
                itemsPerSlide: 5,
                increment: 2
            };
            var slider = new Slider(params);
            slider.eventBus = eventBus;

            //Subcribe modals to mediator
            evt.subscribe('modal-gallery-step-1', function(param, channel) {
                channel.stopPropagation();
                modalHelper.openModalStep1(modalStep1, slider);
                var $modal = $(modalStep1.$elem.children('.modal-inner-content')[0]);
                var fields = modalHelper.filterBarFormatter(modalTemplateFilters);
                var filterBar = modalHelper.loadFilterBar(fields, $modal);
                slider.alwaysAppendToDOM($modal);
                filterBar.on('search', function(returnedData){
                    var filtersObj = filteredImages[0].parseFilters(modalTemplateFilters);
                    filteredImages = subBlockManager.build('filteredImage', returnedData, null);
                    slides = [];
                    var size = filtersObj[filterBar.nextSearch.format];

                    Object.keys(returnedData).forEach(function(k){
                        filteredImagesTab['row-' + returnedData[k].id] = filteredImages[k];
                        slides.push(filteredImages[k].renderSmall(data[k], size));
                    });
                    slider.reset(slides);
                    sliderControls(slider);
                    modalHelper.selectUpdater();
                    modalHelper.updateZoom(modalHelper.filteredImagesTab);
                });
                modalHelper.selectUpdater();
                modalHelper.updateZoom(modalHelper.filteredImagesTab);

                $('body .modal-footer .before').hide();
                sliderControls(slider);

                modalHelper.synchronizeAndOpenStep2(param);
            });
            evt.subscribe('modal-gallery-step-2', function(param) {
                modalHelper.openModalStep2(modalStep2);
                modalHelper.synchronizeAndCloseStep2(param);
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
            }
            else {
                blockData.images = {};
                content.find('img').each(function(){
                    var id = $(this).data('id');
                    blockData.images[id] = JSON.parse(decodeURIComponent($(this).data('object')));
                    $('img.picture-' + id).replaceWith('#' + id);

                    if ($(this).hasClass('f-left')) {
                        blockData.images[id].align = 'f-left';
                    }
                    else {
                        blockData.images[id].align = 'f-right';
                    }
                });
            }


            blockData.text = content.html();
        }
        Object.assign(this.blockStorage.data, blockData || {});
    },

    loadData: function(data){
        this.imagesData = data.images;
        var ids = '';
        var that = this;
        if (data.text !== undefined) {
            ids = data.text.match(/#\w+/g);
        }

        if (ids === null) {
            that.getTextBlock().html(data.text);
            return data;
        }

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
