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
 * Change the keyword 'original' with another string
 * @param  {string} src  the original value from API
 * @param  {string} size the newpicture size
 * @return {string} Well formated string with the new size
 */
function changeOriginalPictureSize(src, size) {
    if (src === undefined) {
        return false;
    }
    if (src.indexOf('original') > 0) {
        src = src.replace('original', size);
        return src;
    }
}

/**
 * Hydrate a modal with well formated HTML
 * @param  {obj} modalStep The modal object
 * @param  {string} template  well formated template
 */
function openModalStep1(modalStep, template) {
    var tpl = template.render() !== undefined ? template.render() : modalTemplateStep1;

    modalStep.render({
        header: '<header>Image</header>',
        content: tpl,
        footer: {
            next: 'Suite',
            before: 'Précédent'
        }
    });

    zoom.init({
        scope: '.modal-gallery-step-1',
        container: '.modal'
    });
    modalStep.open();
}

/**
 * Hydrate a modal with well formated HTML
 */
function openModalStep2(modal) {
    modal.render({
        header: '<header>Image</header>',
        content: modalTemplateStep2,
        footer: {
            ok: 'Ok',
            dismiss: 'Annuler'
        }
    });
    modal.open();
}

function selectUpdater() {
    $.each($('.slide-row .sizes'), function(){
        if ($(this).children().length === 1) {
            $(this).addClass('hidden');
            $(this).parent().append('<p class="size">' + $(this).children().val() + '</p>');
        }
        else {
            $(this).removeClass('hidden');
        }
    });
}

function startStep2(block) {
    modalStep1.close();
    eventBus.trigger('button:control-0:enable');
    evt.publish('modal-gallery-step-2', block);
}

/**
 * Grab all data's, update the sirTrevor block,  then to open next modal
 * @param  {object} block the sir trevor block object to update
 */
function synchronizeAndOpenStep2(block) {
    $('.modal-gallery-step-1').one('click', '.validate', function(e){

        e.preventDefault();
        e.stopPropagation();

        var row = $(this).attr('class').split(' ')[1];
        var picture = updateData(row);
        var filteredImage = filteredImagesTab[row];
        var imageBlock;

        filteredImage.media.size = picture.sizes;
        filteredImage.resize(picture.sizes);
        filteredImage.media.custom = filteredImage.resize(picture.sizes);
        filteredImage.media.align = 'f-right';
        modalTemplateStep2 = filteredImagesTab[row].renderLarge();
        imageBlock = filteredImage.renderBlock();
        startStep2(block);
        $('.preview').attr('src', filteredImagesTab[row].media.imageResized);
        $('.size').text(picture.sizes);
        $('.st-text-block').focus();
        if (sel === undefined) {
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            if (range.collapsed) {
                range.collapse(false);
            }
        }
        else {
            sel.removeAllRanges();
            sel.addRange(range);
            var el = document.createElement('div');
            el.innerHTML = imageBlock;
            var frag = document.createDocumentFragment(), node, lastNode;
            while ((node = el.firstChild)) {
                lastNode = frag.appendChild(node);
            }
            range.insertNode(frag);
            if (lastNode) {
                range = range.cloneRange();
                range.setStartAfter(lastNode);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        filteredImage.bindHover(block, filteredImage);

    });
}

/**
 * Grab all data's, update the sirTrevor block,  then to close actual modal
 * @param  {object} block the sir trevor block object to update
 *
 */
function synchronizeAndCloseStep2(block) {
    var rowId = $('body .modal-gallery-step-2 .position').data('row');
    var position = $('.position').find(':selected').val();

    $('[data-modal-dismiss]').on('click', function(){
        if (undefined === block.imagesData){
            block.imagesData = [];
        }
        var pictureLegend = $('body .modal-gallery-step-2 .picture-legend').val();
        if (pictureLegend.length !== 0) {
            $('.picture-' + rowId + ' span.legend').html(pictureLegend);
        }

        var pictureLink = $('body .modal-gallery-step-2 .picture-link').val();
        if (pictureLink.length !== 0) {
            $('.picture-' + rowId).data('link', pictureLink);
        }
    });


    $('.picture-' + rowId).addClass(position);

    $('.position').on('change', function(){
        var id = $(this).data('row');
        position = $(this).find(':selected').val();
        $('.picture-' + id).removeClass('f-right').removeClass('f-left').addClass(position);
    });

    $('.picture-link').on('keyup', function() {
        var internal = validateInternalUrl($('.picture-link').val());
        if (!internal) {
            $('.external-link').text('Lien externe');
        }
        else {
            $('.external-link').text('');
        }
    });

    $('body .modal-gallery-step-2').on('change', '.position', function() {
        position = $('.position').find(':selected').val();
        $('.framed-picture.framed-picture-' + rowId).addClass(position);
    });
}

/**
 * Helper function to create a picture object
 * @param  {string} row Id or Class of the picture
 * @return {object}     Picture object
 */
function updateData(row) {
    var picture = {};
    picture.url = $('.modal-row-picture.' + row).data('image');
    picture.sizes = $('.modal-row-content.' + row + ' .sizes').find(':selected').val();
    picture.width = picture.sizes.split('x')[0];
    picture.height = picture.sizes.split('x')[1];
    picture.name = picture.url;
    return picture;
}

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
        var newSize = changeOriginalPictureSize(originalSize, zoomedSize);

        $('.modal-row-picture.' + rowId).attr('data-image', newSize);
    });
}


/**
 * Helper function to validate internal or external url
 */
function validateInternalUrl(url) {
    var hostname = new RegExp(location.host);
    var internal;
    if (hostname.test(url)){
       internal = true;
    }
    else if (url.slice(0, 1) === '#'){
        internal = true;
    }
    else if (url.slice(0, 1) === '/'){
        internal = true;
    }
    else {
        internal = false;
    }
    return internal;
}
/**
 * Show/Hide controls depending on events
 *
 */
function sliderControls(slider){
    slider.on('buttons:prev:disable', function() {
        $('body .modal-footer .before').hide();
    });

    slider.on('buttons:prev:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .before').show();
    });

    slider.on('buttons:next:disable', function() {
        $('body .modal-footer .next').hide();
    });

    slider.on('buttons:next:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .next').show();
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


/**
 * Deliver filterbar fields parameters
 *
 */
function filterBarFormatter(jsonFilters) {
    var tabCategories = [];
    tabCategories.push({
        label: 'Toutes les catégories',
        value: 0
    });
    Object.keys(jsonFilters.content.categories).forEach(function(k){
        var categorie = jsonFilters.content.categories[k];
        tabCategories.push({
            value: categorie.id,
            label: categorie.label
        });
    });

    var tabFormats = [];
    tabFormats.push({
        label: 'Tous les formats',
        value: 0
    });
    Object.keys(jsonFilters.content.formats).forEach(function(k){
        var formats = jsonFilters.content.formats[k];
        tabFormats.push({
            value: formats.id,
            label: formats.label
        });
    });

    var fields = [
        {
            type: 'search',
            name: 'q',
            label: 'Rechercher'
        },
        {
            type: 'select',
            name: 'category',
            label: 'Catégories',
            placeholder: 'Sélectionnez une catégorie',
            options: tabCategories
        },
        {
            type: 'select',
            name: 'format',
            label: 'Formats',
            placeholder: 'Sélectionnez un format',
            options: tabFormats
        }
    ];
    return fields;
}

/**
 * Filterbar launcher
 */
function loadFilterBar(fields, modal) {
    var filterBar = new FilterBar({
        url: apiUrl,
        fields: fields,
        application: 'etu_etu',
        app: 'etu_etu',
        limit: '20',
        type: 'image',
        container: modal,
        before: true
    });
    return filterBar;
}
/**
 * Grab datas after the cursor
 * @return {[type]} [description]
 */
function getSelectedContent($block) {
    var before = '';
    if (sel !== undefined) {
        sel.removeAllRanges();
        sel.addRange(range);
        range = sel.getRangeAt(0);
        range.collapse(true);
        range.setStart($block.getTextBlock().get(0), 0);
        before = range.toString();
        return before;
    }
    else {
        console.error('your browser isnt supported yet');
    }
}


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
        },
        {
            slug: 'add-paragraph',
            'icon': 'Paragraph',
            sleep: true,
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var block = this;
                var firstParagraph = getSelectedContent(this);
                var secondParagraph = this.getTextBlock().html().replace(firstParagraph, '');
                this.getTextBlock().html(firstParagraph);
                this.instanceID = block.blockID;

                var data = { text: secondParagraph } ;

                var block = this.mediator.trigger('block:create', 'text', data);
            }
        }
    ],

     onBlockRender: function() {
        this.filteredImagesTab = '';
        var textBlock = this.$inner.find('.st-text-block');
        textBlock.on('click', function(e){

            if($(this).hasClass('st-block-control-ui-btn')){
                return
            }
            console.log('Updated Selection');
            sel = window.getSelection();
            range = sel.getRangeAt(0);
        });
        textBlock.on('keypress', function(e){
            e.stopPropagation();
            sel = window.getSelection();
            range = sel.getRangeAt(0);
            if (e.keyCode === 13) {
                console.log('Enter pressed');
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
            var mediasArray = subBlockManager.jsonInit(data[1], data[0]);

            var filteredImages = subBlockManager.build('filteredImage', mediasArray[0], null);
            var slides = [];
            Object.keys(data[1].content).forEach(function(k){
                filteredImagesTab['row-' + data[1].content[k].id] = filteredImages[k];
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
            }
            else {
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
