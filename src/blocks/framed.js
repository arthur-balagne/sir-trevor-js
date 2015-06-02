'use strict';

/*
  Framed
*/
var evt = require('etudiant-mod-mediator');
var $ = require('jquery');
var mediaForm = require('etudiant-mod-mediaform');
var Block = require('../block');
var stToHTML = require('../to-html');
var Modal = require('etudiant-mod-modal');
var q  = require('q');
var zoom = require('etudiant-mod-zoom');
var Slider   = require('../helpers/slider.js');
var eventBus = Object.assign({}, require('../events.js'));

var FilterBar = require('../helpers/filterbar.js');

var apiUrl = 'http://localhost:3000/';


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
    if (src.indexOf('original') > 0){
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
    var tpl = template !== undefined ? template : modalTemplateStep1;
    modalStep.render({
        header: '<header>Image</header>',
        content: tpl,
        footer: {
            next: 'Suite',
            before: 'Précédent'
        }
    });

    $.each($('.modal-row-picture img'), function() {
        $(this).attr('src', changeOriginalPictureSize($(this).attr('src'), '158x117'));
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
    var sizes = $('.framed-picture img').attr('sizes');
    $('.preview').attr('src', $('.framed-picture img').attr('src'));
    $('.picture-legend').val($('.framed-picture legend').text());
    if ($('.frame-link').attr('href') !== undefined) {
        $('.picture-link').attr('value', $('.frame-link').attr('href'));
    }
    $('.size').text(sizes);
    modal.open();
}


function startStep2(block) {
        modalStep1.close();
        evt.publish('modal-gallery-step-2', block);
}
/**
 * Grab all data's, update the sirTrevor block,  then to open next modal
 * @param  {object} block the sir trevor block object to update
 */
function synchronizeAndOpenStep2(block) {
    $('.modal-gallery-step-1').on('click', '.validate', function(e){
        e.preventDefault();
        var row = $(this).attr('class').split(' ')[1];
        var picture = updateData(row);
        var blockId = block.blockID;
        $('#' + blockId + ' .framed-picture').html('<img alt="placeholder" src=""><br><legend>&copy L etudiant </legend></div>');
        $('.framed-picture img').attr('src', picture.url);
        $('.framed-picture img').css('display', 'inline-block');
        $('.framed-picture').removeClass('hidden');
        startStep2(block);
        $('.preview').attr('src', $('.framed-picture img').attr('src'));
        $('.size').text(picture.sizes);
    });
}
/**
 * Grab all data's, update the sirTrevor block,  then to close actual modal
 * @param  {object} block the sir trevor block object to update
 */
function synchronizeAndCloseStep2(block) {
    // Remove click handler on step 1
    var blockId = block.blockID;
    eventBus.trigger('button:control:enable');
    $('.modal-gallery-step-1').off('click', '.validate');

    $('.picture-link').on('keyup', function() {
        var internal = validateInternalUrl($('.picture-link').val());
        if (!internal) {
            $('.external-link').text('Lien externe');
        }
        else {
            $('.external-link').text('');
        }
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
        var position = $('.position').find(':selected').val();
        updatePicturePosition(position);
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
    picture.url = changeOriginalPictureSize(picture.url, picture.sizes);
    return picture;
}

/**
 * Helper function to update the all data's image with the selected size value.
 */
function updateZoom() {
    $.each($('body .modal-row-picture'), function(){
        var size = $('#formats option:eq(1)').html();
        var originalSize = $(this).data('image');
        var newSize = changeOriginalPictureSize(originalSize, size);
        $(this).attr('data-image', newSize);
    });
    $('#modal-gallery-step-1').on('change', '.modal-row-content .sizes', function(e){
        e.stopPropagation();
        e.preventDefault();
        var zoomedSize = $(this).find(':selected').val();
        var rowId = $(this).parent().parent().attr('class').split(' ')[1];
        var originalSize = $('.modal-row-picture.' + rowId).data('image');
        var newSize = changeOriginalPictureSize(originalSize, zoomedSize);
        $('.modal-row-picture.' + rowId).attr('data-image', newSize);
    });
}

function getTemplate(params) {
    var template = '';
    template += '<div class="frame" style="box-sizing:border-box; display:inline-block; width:100%; background-color:' + params.frameColor + '; border: 3px solid ' + params.frameBorder + '">';
        template += '<div class="framed-picture hidden" style="vertical-align:top; width:' + params.framePictureWidth + '; height:auto"></div>';
            template += '<div class="st-required st-text-block framed"  style="width:' + params.frameTextWidth + '; vertical-align:top; display:' + params.frameTextDisplay + ' " contenteditable="true">';
        template += '</div>';
    template += '</div>';
    return template;
}

function removePicture(ev, block) {
    ev.preventDefault();
    var framePicture = block.find('.framed-picture img');
    block.find('.framed-picture legend').remove();
    eventBus.trigger('button:control:disable');
    framePicture.remove();
}

function updatePicturePosition(side) {
    var framedPicture = $('.framed-picture');

    if (framedPicture.hasClass('hidden')) {
        return false;
    }
    else if (framedPicture.is('.f-left, .f-right')) {
        framedPicture.removeClass('f-left f-right');
    }
    framedPicture.addClass(side);
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
 * Helper function to convert text from mediaform module in array
 * @param  {string} text
 * @return {array}
 */
function convertPlainTextIntoSlides(text) {
    var rows = $(text).find('.modal-row');
    var rowsTab = [];
    $.each(rows, function(){
        rowsTab.push('<div class="slide-row">' + $(this).html() + '</div>');
    });

    return rowsTab;
}

/**
 * Update a slider
 * @param  {string} data        plain text from mediaform
 * @param  {object} slider      the slider to update
 * @param  {string} previewSize Previews sizes
 */
function ajaxUpdate(data, slider, previewSize) {
    var rowsTab = convertPlainTextIntoSlides(data);
    slider.reset(rowsTab);
    zoom.domUpdate('.modal');

    $.each($('.modal-row-picture img'), function() {
        var original = $(this).attr('src');
        $(this).attr('src', changeOriginalPictureSize(original, '158x117'));
    });
    $.each($('.modal-row-content'), function() {
        if ($(this).find('.sizes')[0].length === 1) {
            var actualPreview = $(this).find('.sizes').first().children('option').html();
            $(this).prepend('<p class="size">Taille : ' + actualPreview + '</p>');
            $(this).find('form').addClass('hidden');
        }
    });
    $.each($('.modal-row-picture'), function() {
        $(this).attr('data-image', changeOriginalPictureSize($(this).data('image'), previewSize));
    });
}
/**
 *  Wait for ui updates then launch refresh
 *
 */
function ajaxWatcher(slider) {
    $('#modal-gallery-step-1').on('change', '#formats', function(){
        var size = $(this).find(':selected').val();
        var sizeTxt = $(this).find(':selected').html();
        var modalTemplateSized = mediaForm.getTemplateMediasBySize(size);
        modalTemplateSized.then(function(data) {
            ajaxUpdate(data, slider, sizeTxt);

        });

    });

    $('#modal-gallery-step-1').on('change', '#categories', function() {
        var categories = $(this).find(':selected').val();
        var modalTemplateSized = mediaForm.getTemplateMediasByCategory(categories);
        modalTemplateSized.then(function(data){
            ajaxUpdate(data, slider);
        });
    });

    $('#modal-gallery-step-1').on('keyup', '.modal-search .search', function(){
        var text = $(this).val();
        var modalTemplateSized = mediaForm.getTemplateMediasByKeyword(text);
        modalTemplateSized.then(function(data){
            ajaxUpdate(data, slider);
        });
    });
}

function sliderControls(slider){

    slider.eventBus.on('buttons:prev:disable', function() {
        $('body .modal-footer .before').hide();
    });
    slider.eventBus.on('buttons:prev:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .before').show();
    });
    slider.eventBus.on('buttons:next:disable', function() {
        $('body .modal-footer .next').hide();
    });
    slider.eventBus.on('buttons:next:enable', function() {
        $('body .modal-footer').show();
        $('body .modal-footer .next').show();
    });
    slider.eventBus.on('buttons:all:disable', function() {
        $('body .modal-footer').hide();
    });

    $('body .modal-footer').on('click', '.before', function(){
        slider.prev();
    });

    $('body .modal-footer ').on('click', '.next', function(){
        slider.next();
    });
}
function loadFilterBar(fields, modal) {
    var filterBar = new FilterBar({
        url: apiUrl,
        fields: fields,
        limit: '',
        container: modal
    });
    return filterBar;
}

module.exports = Block.extend({
    type: 'framed',
    title: function() { return i18n.t('blocks:framed:title'); },
    icon_name: 'quote',
    controllable: true,
    activable: true,
    eventBus: eventBus,
    controls_position: 'bottom',
    controls_visible: true,
    controls: [
        {
            slug: 'show-picture',
            'icon': 'image',
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
            'icon': 'image+',
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

        this.$inner.prepend(template);
        this.$framed = this.$inner.find('.frame');

        //Handlebar formated template
        modalTemplateFilters = mediaForm.getArrayFilters();
        //modalTemplateFilters = mediaForm.getTemplateFilters();
        modalTemplateStep1 = mediaForm.getTemplateMedias();
        // Ajax job before rendering modal
        q.all([ modalTemplateFilters, modalTemplateStep1 ]).then(function(data){
            modalTemplateFilters = data[0];
            modalTemplateStep1 = data[1];
            modalTemplateFilters.unshift({
                    type: 'search',
                    name: 'fulltext',
                    label: 'Rechercher'
                });
            var rowsTab = convertPlainTextIntoSlides(modalTemplateStep1);
            var params = {
                contents: rowsTab,
                itemsPerSlide: 5,
                increment: 2
            };
            var slider = new Slider(params);
            //Subcribe modals to mediator
            evt.subscribe('modal-gallery-step-1', function(param, channel) {
                channel.stopPropagation();
                slider.isReady = false;
                openModalStep1(modalStep1, slider.render());
                var $modal = $(modalStep1.$elem.children('.modal-inner-content')[0]);
                var filterBar = loadFilterBar(modalTemplateFilters, $modal);

                var $modal1 = $(modalStep1.$elem.children('.modal-inner-content')[0]);
                slider.ready($modal1);

                updateZoom();
                ajaxWatcher(slider);
                //Bind event on controls
                $('body .modal-footer .before').hide();
                sliderControls(slider);

                synchronizeAndOpenStep2(param);
            });

            evt.subscribe('modal-gallery-step-2', function(param) {
                openModalStep2(modalStep2);
                synchronizeAndCloseStep2(param);
            });
        });

        modalTemplateStep2 = mediaForm.getTemplateMedia();
        return template;
    },
    loadData: function(data){
        this.getTextBlock().html(stToHTML(data.text, this.type));
        this.$('.st-picture-right').val(data.picture);
    },

    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '> $1');
    }

});
