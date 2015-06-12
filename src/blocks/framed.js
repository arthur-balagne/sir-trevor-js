'use strict';

/*
  Framed
*/

var evt = require('etudiant-mod-mediator');
var $ = require('jquery');
var Formatters = require('../formatters');
var Block = require('../block');
var stToHTML = require('../to-html');
var Modal = require('etudiant-mod-modal');
var q  = require('q');
var zoom = require('etudiant-mod-zoom');
var Slider   = require('../helpers/slider.class.js');
var eventBus = require('../event-bus.js');
var subBlockManager = require('../sub_blocks/index.js');
var FilterBar = require('../helpers/filterbar.class.js');
var xhr = require('etudiant-mod-xhr');


var apiUrl = 'http://api.letudiant.lk/edt/media';

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
    $.each($('.slide-row .sizes'), function(key){
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

function setEndOfContenteditable(contentEditableElement, html){
    var range;
    var selection;
    if(document.createRange) {
        range = document.createRange();
        debugger;
        range.selectNodeContents(contentEditableElement.$('.st-text-block')[0]); //Pick the green area
        if(html !== undefined) {
            debugger;
            var caretPos = range.endOffset;
            range.insertNode($(html)[0]); //Insert node in range
        }
        range.collapse(false);
        contentEditableElement.$editor.selected = true
        selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

    }
    else {
        console.log('All you"base are belong to us !!!');
    }
}

/**
 * Grab all data's, update the sirTrevor block,  then to open next modal
 * @param  {object} block the sir trevor block object to update
 */
function synchronizeAndOpenStep2(block) {
    $('.modal-gallery-step-1').on('click', '.validate', function(e){
        e.preventDefault();
        e.stopPropagation();
        var row = $(this).attr('class').split(' ')[1];
        var picture = updateData(row);
        var filteredImage = filteredImagesTab[row];
        filteredImage.media.size = picture.sizes;
        filteredImage.resize(picture.sizes);
        filteredImage.media.custom = filteredImage.resize(picture.sizes);
        modalTemplateStep2 = filteredImagesTab[row].renderLarge();

        var blockId = block.blockID;
        var imageBlock2 = filteredImage.renderBlock();

        //$('#' + blockId).find('.st-text-block').html( $('#' + blockId).find('.st-text-block').html() + imageBlock2 );
        setEndOfContenteditable(block, imageBlock2);

        filteredImage.bindRemoveEvent(block, filteredImage.media.id);
        filteredImage.bindTogglEvent(block, filteredImage.media.id);
        filteredImage.bindUpdateEvent(block, filteredImage.media.id);
        startStep2(block);
        $('.preview').attr('src', filteredImagesTab[row].media.imageResized);
        $('.size').text(picture.sizes);
    });
}

/**
 * Grab all data's, update the sirTrevor block,  then to close actual modal
 * @param  {object} block the sir trevor block object to update
 *
 */
function synchronizeAndCloseStep2(block) {
    var blockId = block.blockID;
    $('.modal-gallery-step-1').off('click', '.validate');
    var rowId = $('body .modal-gallery-step-2 .position').data('row');
    var position = $('.position').find(':selected').val();

    $('[data-modal-dismiss]').on('click', function(){
        var id = $('.modal-row-picture').data('id');
        if(undefined === block.imagesData){
            block.imagesData =  [];
        }
        block.imagesData.push(filteredImagesTab['row-' + id].media);
    })

    $('.framed-picture.framed-picture-' + rowId).addClass(position);

    $('.position').on('change', function(){
        var id = $(this).data('row');
        position = $(this).find(':selected').val();
        $('.framed-picture-' + id).removeClass('f-right').removeClass('f-left').addClass(position);

    })

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
        var imageId = $(this).data('row');
        var position = $('.position').find(':selected').val();
    $('.framed-picture.framed-picture-' + rowId).addClass(position);
    });

    $('body .modal-gallery-step-2').on('click', '.ok', function() {
        //Update legend
         var pictureLegend = $('body .modal-gallery-step-2 .picture-legend').val();
        if (pictureLegend.length !== 0) {
            $('#' + blockId + ' .frame legend').text(pictureLegend);
        }

        //Update link
        if ($('.picture-link').val().length !== 0) {
            if ($('#' + blockId + ' .framed-picture').parents().first().hasClass('frame-link')){
                $('#' + blockId + ' .framed-picture').unwrap();
            }
            $('#' + blockId + ' .framed-picture').wrap('<a class="frame-link" target="_blank" href="' + $('.picture-link').val() + '">');
        }

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
            var originalSize = filteredImages[rowId].media.image;
        }
        else {
            return false;
        }
        var newSize = changeOriginalPictureSize(originalSize, zoomedSize);

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

function filterBarFormatter(jsonFilters) {
    var tabCategories = [];
    tabCategories.push({
        label: "Toutes les catégories",
        value: 0
    })
    Object.keys(jsonFilters.content.categories).forEach(function(k){
        var categorie = jsonFilters.content.categories[k];
        tabCategories.push({ value: categorie.id , label: categorie.label }) ;
    });

    var tabFormats = [];
    tabFormats.push({
        label: "Tous les formats",
        value: 0
    })
    Object.keys(jsonFilters.content.formats).forEach(function(k){
        var formats = jsonFilters.content.formats[k];
        tabFormats.push({ value: formats.id , label: formats.label }) ;
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

function loadFilterBar(fields, modal) {
    var filterBar = new FilterBar({
        url: apiUrl,
        fields: fields,
        application: 'etu_etu',
        app: 'etu_etu',
        limit: '20',
        container: modal,
        before: true
    });
    return filterBar;
}

module.exports = Block.extend({
    type: 'framed',
    title: function() { return i18n.t('blocks:framed:title'); },
    icon_name: 'quote',
    controllable: true,
    formattable:true,
    activable: true,
    _previousSelection: '',
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
        },
        {
            slug: 'update-picture',
            'icon': 'image1',
            sleep: true,
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var block = this.$framed;
                evt.publish('modal-gallery-step-2', block);
            }

        },
        {
            slug: 'toggle-picture',
            'icon': 'image-',
            sleep: true,
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var block = this.$framed;
                removePicture(e, block);
            }
        }

    ],
    onBlockRender: function() {
        var template = getTemplate({
            frameColor: '#536A4C',
            frameBorder: '#6C8365',
            frameDisplay: 'block',
            frameTextDisplay: 'block',
            frameTextWidth: '100%',
            framePictureWidth: 'auto',
            framePictureHeight: 'auto',
            framedPictureDisplay: 'hidden'
        });

        this.$framed = $(template);
        this.filteredImagesTab = '';

        var textBlock = this.$inner.find('.st-text-block');

        textBlock.wrap(this.$framed);

        // Ajax job before rendering modal
        q.all([ xhr.get('http://api.letudiant.lk/edt/media/filters/ETU_ETU'),
                xhr.get('http://api.letudiant.lk/edt/media?application=ETU_ETU') ])
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
                channel.stopPropagation();
                openModalStep1(modalStep1, slider);
                var $modal = $(modalStep1.$elem.children('.modal-inner-content')[0]);
                var fields = filterBarFormatter(modalTemplateFilters);
                var filterBar = loadFilterBar(fields, $modal);
                slider.alwaysAppendToDOM($modal);

                filterBar.on('search', function(data){
                    var filtersObj = filteredImages[0].parseFilters(modalTemplateFilters);
                    var wrapper = {
                        content: data
                    };
                    var mediasArray = subBlockManager.jsonInit(wrapper, modalTemplateFilters);
                    filteredImages = subBlockManager.build('filteredImage', data, null);
                    slides = [];
                    var size = filtersObj[filterBar.nextSearch.format];
                    Object.keys(data).forEach(function(k){
                        filteredImagesTab['row-' + data[k].id] = filteredImages[k];
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

    setData: function(blockData) {
        debugger;
        if(data === undefined) {
            var data = {};
        }
        var content = this.getTextBlock();
        if (content.length > 0) {
            var framedContent = content.find('.framed-picture');
            if(framedContent.data('object') === undefined) {
                var html = content.html();
                return data.text = html;
            }
            var frameData = framedContent.data('object');
            framedContent.replaceWith('#' + framedContent.data('object').id + ' ');
            var id = framedContent.data('object').id;
            data.text = content.html();
            data.images = {};
            data.images[id] = blockData.images[id] = framedContent.data('object');
        }

        Object.assign(this.blockStorage.data, blockData || {});
    },

    loadData: function(data){
        this.imagesData = data.images;
        var ids = data.text.match(/#\w+/g);
        var jsonObject = [];
        Object.keys(ids).forEach(function(value){
            var val = ids[value].split('#')[1];
            Object.keys(data.images).forEach(function(k){
                if(data.images[k].id == val) {
                    jsonObject.push(data.images[k]);
                    var filteredBlock = subBlockManager.buildOne('filteredImage', null, null);
                    filteredBlock.media = jsonObject[0];

                    var tpl = filteredBlock.renderBlock();
                    tpl = tpl + ' ';
                }
                data.text = data.text.replace(ids[value], tpl);
            });
            console.log(data.text);

        });
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },
    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '> $1');
    }

});
