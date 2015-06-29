'use strict';

/*
  Framed
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

var modalHelper = new ModalHelper();

var apiUrl = 'http://api.letudiant.lk/edt/media';
var sel;
var range;


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
            var originalSize = filteredImages[rowId].media.file;
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
function textBlockListenners(textBlock){
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



module.exports = Block.extend({
    type: 'framed',
    title: function() { return i18n.t('blocks:framed:title'); },
    icon_name: 'quote',
    controllable: true,
    formattable: true,
    activable: true,
    editorHTML: '<div class="st-text-block" contenteditable="true"></div>',
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
        var template = getTemplate({
            frameColor: '#536A4C',
            frameBorder: '#6C8365'
        });
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

        this.$framed = $(template);


        var textBlock = this.getTextBlock();
        textBlockListenners(textBlock);

        textBlock.wrap(this.$framed);

        q.all([ xhr.get('http://api.letudiant.lk/edt/media/filters/ETU_ETU'),
                xhr.get('http://api.letudiant.lk/edt/media?application=ETU_ETU&type=image&limit=20') ])
        .then(function(data){
            modalTemplateFilters = data[0];
            modalTemplateStep1 = data[1];
            eventBus.trigger('button:control-0:enable');
            var mediasArray = subBlockManager.jsonInit(modalTemplateStep1, modalTemplateFilters);
            var filteredImages = subBlockManager.build('filteredImage', mediasArray[0], null);
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
            slider.eventBus = eventBus;

            //Subcribe modals to mediator
            evt.subscribe('modal-gallery-step-1', function(param, channel) {
                channel.stopPropagation();
                modalHelper.openModalStep1(modalHelper.modalStep1, slider);

                var $modal = $(modalHelper.modalStep1.$elem.children('.modal-inner-content')[0]);
                var fields = modalHelper.filterBarFormatter(modalTemplateFilters);
                var filterBar = modalHelper.loadFilterBar(fields, $modal);

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
                        slides.push(filteredImages[k].renderSmall(returnedData[k], size));
                    });

                    slider.reset(slides);
                    sliderControls(slider);
                    modalHelper.selectUpdater();
                    modalHelper.updateZoom(modalHelper.filteredImagesTab);
                });

                modalHelper.selectUpdater();
                modalHelper.updateZoom(modalHelper.filteredImagesTab);

                $('body .modal-footer .before').addClass('disabled');
                sliderControls(slider);

                modalHelper.synchronizeAndOpenStep2(param);
            });

            evt.subscribe('modal-gallery-step-2', function(param) {
                if (param.filteredImage !== undefined) {
                    modalTemplateStep2 = param.filteredImage.renderLarge();
                }
                modalHelper.openModalStep2(modalHelper.modalStep2);
                modalHelper.synchronizeAndCloseStep2(param);
            });
        }).catch(function(){
            console.error('Something went wrong');
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

    getTextBlock: function() {
        this.text_block = this.$('.st-text-block');
        return this.text_block;
    },
    setData: function(blockData) {
        var content = this.getTextBlock();
        $('.wrapper').contents().unwrap();
        $('.wrapper').remove();
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
        this.imagesData = data.images;
        var ids = data.text.match(/#\w+/g);
        var that = this;
        if (ids === null){
            return this.getTextBlock().html(stToHTML(data.text));
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
                    that.loading();
                    result.content.size = data.images['row-' + val].size;
                    result.content.legend = data.images['row-' + val].legend;
                    var filteredBlock = subBlockManager.buildOne('filteredImage', null, null);
                    result.content.align = data.images['row-' + val].align;
                    filteredBlock.media = result.content;
                    tpl = filteredBlock.renderBlock();
                    data.text = data.text.replace('#' + val, tpl);
                    that.getTextBlock().html(data.text);
                    if (data.images['row-' + val].link !== undefined) {
                        that.getTextBlock().find('img.picture-'+val).wrap('<a href="'+ data.images['row-' + val].link +'"></a>');
                    }
                    filteredBlock.bindHover(that, filteredBlock);
                    that.ready();
                }).catch(function(error){
                    console.log(error);
                    console.error('Something went wrong');
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
