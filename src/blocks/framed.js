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


function openModalStep1(modalStep, template) {
    var tpl = template !== undefined ? template : modalTemplateStep1;
    modalStep.render({
        header: '<header>Image</header>',
        head: modalTemplateFilters,
        content: tpl,
        footer: {
            next: 'Suite',
            before: 'Précédent'
        }
    });

    $.each($('.modal-row-picture img'), function() {
        $(this).attr('src', changeOriginalPictureSize($(this).attr('src'), '240x120'));
    });

    modalStep.open();

    var zoom = require('zoom.js');
    zoom.listen();
}


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
    $('.picture-legend').val($('.framed-picture legend').val());
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

function synchronizeAndOpenStep2(block) {
    $('.modal-gallery-step-1').on('click', '.validate', function(e){
        e.preventDefault();
        e.stopPropagation();
        var row = $(this).attr('class').split(' ')[1];
        var picture = updateData(row);
        var blockId = block.blockID;        //Update the picture
        var $picture = $('#' + blockId + ' .framed-picture img');
        var $pictureContainer = $('#' + blockId + ' .framed-picture');
        $picture.attr('src', picture.url);
        $picture.attr('sizes', picture.sizes);
        $pictureContainer.removeClass('hidden');
        $pictureContainer.css('display', 'inline-block');
        startStep2(block);
        $('.preview').attr('src', $picture.attr('src'));
        $('.size').text(picture.sizes);

    });
}

function synchronizeAndCloseStep2(block) {
    // Remove click handler on step 1
    var blockId = block.blockID;
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

    $('#modal-gallery-step-2 .ok').on('click', function() {
        if ($('.picture-legend').val().length !== 0) {
            $('#' + blockId + ' .frame legend').text($('.picture-legend').val());
        }
        else {
            $('#' + blockId + ' .frame legend').text('&copy L\'Etudiant.');
        }
        if ($('.picture-link').val().length !== 0) {
            if($('#' + blockId + ' .framed-picture').parents().first().hasClass('frame-link')){
                $('#' + blockId + ' .framed-picture').unwrap();
            }
            $('#' + blockId + ' .framed-picture').wrap('<a class="frame-link" target="_blank" href="' + $('.picture-link').val() + '">');
        }
        var position = $('.position').find(':selected').val();
        updatePicturePosition(position);
    });
}

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

function updateZoom() {
    // 1 bind listener sur le change du select
    // 2 Quand la taille change j'update data-image de modal-row-picture-{id}
    $('#modal-gallery-step-1').on('change', '.modal-row .sizes', function(){
        var zoomedSize = $(this).find(':selected').val();
        var rowId = $(this).parent().parent().attr('class').split(' ')[1];
        var originalSize = $('.modal-row-picture.' + rowId).data('image');
        $('.modal-row-picture.' + rowId).data('zoom', changeOriginalPictureSize(originalSize, zoomedSize));
        //console.log($('.modal-row-picture.' + rowId).data('zoom'));
    });
}

function getTemplate(params) {
    var template = '';
    template += '<div class="frame" style="box-sizing:border-box; display:inline-block; width:100%; background-color:' + params.frameColor + '; border: 3px solid ' + params.frameBorder + '">';
        template += '<div class="framed-picture hidden" style="display:' + params.framedPictureDisplay + '; vertical-align:top; width:' + params.framePictureWidth + '; height:auto"><img data-width="180" data-height="80" alt="placeholder" src="http://placehold.it/180x80/sports/6"><br><legend>&copy L etudiant </legend></div>';
            template += '<div class="st-required st-text-block framed"  style="width:' + params.frameTextWidth + '; vertical-align:top; display:' + params.frameTextDisplay + ' " contenteditable="true">';
        template += '</div>';
    template += '</div>';
    return template;
}

function togglePicture(ev, block) {
    ev.preventDefault();
    var framePicture = block.find('.framed-picture');
    framePicture.toggleClass('hidden');
    if (framePicture.hasClass('hidden')) {
        framePicture.css('display', 'none');
    }
    else {
        framePicture.css('display', 'inline-block');
    }
}

function changeOriginalPictureSize(src, size) {
    if (src.indexOf('original') > 0){
        src = src.replace('original', size);
        return src;
    }
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

// Url validation
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

function ajaxWatcher() {
    $('#modal-gallery-step-1').on('change', '.modal-search .sizes', function(){
        var size = $(this).find(':selected').val();
        var modalTemplateSized = mediaForm.getTemplateMediasBySize(size);
        modalTemplateSized.then(function(data){
            openModalStep1(modalStep1, data);
            var newSelector = $('#modal-gallery-step-1').find('.modal-search .sizes');
            newSelector.val(size).prop('selected', true);
        });
    });

    $('#modal-gallery-step-1').on('change', '.modal-search .categories', function(){
        var size = $(this).find(':selected').val();
        var modalTemplateSized = mediaForm.getTemplateMediasByCategory(size);
        modalTemplateSized.then(function(data){
            openModalStep1(modalStep1, data);
            var newSelector = $('#modal-gallery-step-1').find('.modal-search .categories');
            newSelector.val(size).prop('selected', true);
        });
    });

    $('#modal-gallery-step-1').on('keyup', '.modal-search .search', function(){
        var text = $(this).val();
        var modalTemplateSized = mediaForm.getTemplateMediasByKeyword(text);
        modalTemplateSized.then(function(data){
            openModalStep1(modalStep1, data);
        });
    });
}

module.exports = Block.extend({
    type: 'framed',
    title: function() { return i18n.t('blocks:framed:title'); },
    icon_name: 'quote',
    controllable: true,
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
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var block = this.$framed;
                evt.publish('modal-gallery-step-2', block);
            }

        },
        {
            slug: 'add-picture',
            'icon': 'image+',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var block = this.$framed;
                togglePicture(e, block);
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
        modalTemplateFilters = mediaForm.getTemplateFilters();
        modalTemplateStep1 = mediaForm.getTemplateMedias();
        // Ajax job before rendering modal
        q.all([ modalTemplateFilters, modalTemplateStep1 ]).then(function(data){

            modalTemplateFilters = data[0];
            modalTemplateStep1 = data[1];

            //Subcribe modals to mediator
            evt.subscribe('modal-gallery-step-1', function(param, channel) {
                channel.stopPropagation();

                openModalStep1(modalStep1);
                updateZoom();
                ajaxWatcher();
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
