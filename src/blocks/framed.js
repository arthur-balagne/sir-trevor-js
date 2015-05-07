'use strict';

/*
  Framed
*/

var evt = require('etudiant-mod-mediator');
var $ = require('jquery');
var mediaForm = require('etudiant-mod-mediaform');
var Block = require('../block');
var stToHTML = require('../to-html');

var params = {
    url: 'medias',
    size: '45x45'
};
var modalTemplate =  mediaForm.getTemplate(params);

//Subcribe my modal to mediator, this code can be placed evrywhere.
evt.subscribe('modal-gallery-step-1', function() {
    openModal();
    changeWidth();
});
function openModal() {
    var Modal = require('etudiant-mod-modal');
    var modal = new Modal({
        slug: 'gallery-step-1',
        animation: 'fade',
        theme: 'media'
    });

    modal.render({
        header: '<header>Image</header>',
        content: modalTemplate,
        footer: {
            ok: '',
            dismiss: 'Fermer'
        }
    });
    modal.open();
}

function changeWidth() {
    console.log('inside');
    var widthSelector = $('.modal-row-content select');
    var size = {
        width: 180, //Set the size to prevent weirdness
        height: 80
    };
    widthSelector.on('change', function() {
    console.log('inside changed');
        var selected = $(this).find(':selected').val();
        size.width = selected.split('x')[0];
        size.height = selected.split('x')[1];
        var picture = $('.framed-picture img').data('picture');
        $('.framed-picture img').data('width', size.width);
        $('.framed-picture img').data('height', size.height);
        $('.framed-picture img').attr('src', 'http://lorempixel.com/' + size.width + '/' + size.height + '/' + picture);
        console.log('http://lorempixel.com/' + size.width + '/' + size.height + '/'+picture);
    });

}

function getTemplate(params) {
    var template = '';
    template += '<div class="frame" style="box-sizing:border-box; display:inline-block; width:100%; background-color:' + params.frameColor + '; border: 3px solid ' + params.frameBorder + '">';
    template += '<div class="st-required st-text-block framed" style="width:' + params.frameTextWidth + '; vertical-align:top; display:' + params.frameTextDisplay + ' " contenteditable="true"></div>';
    template += '<div class="framed-picture hidden" style="display:' + params.framedPictureDisplay + '; vertical-align:top; width:' + params.framePictureWidth + '; height:auto"><img data-width="180" data-height="80" alt="placeholder" src="http://lorempixel.com/180/80/sports/56"><br><legend>Ma super légende &copy L etudiant </legend></div>';
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

module.exports = Block.extend({
    type: 'framed',
    title: function() { return i18n.t('blocks:framed:title'); },
    icon_name: 'quote',
    controllable: true,
    controls_position: 'bottom',
    controls_visible: true,
    controls: [
        {
            slug: 'add-picture',
            'icon': 'image+',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                var block = this.$framed;
                togglePicture(e, block);
            }
        },
        {
            slug: 'show-picture',
            'icon': 'image',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                var block = this.$framed;
                togglePicture(e, block);
                evt.publish('modal-gallery-step-1'); //Call the modal event
                $('.validate').on('click', function() {
                    var picture = $(this).data('picture');
                    var width = $('.framed-picture img').data('width');
                    var height = $('.framed-picture img').data('height');
                    $('.framed-picture img').attr('src', 'http://lorempixel.com/' + width + '/' + height + '/' + picture).css('display', block);
                    $('.framed-picture img').data('picture', picture);
                });
            }

        }
    ],
    onBlockRender: function() {
        var template = getTemplate({
            frameColor: '#536A4C',
            frameBorder: '#6C8365',
            frameDisplay: 'block',
            frameTextDisplay: 'inline-block',
            frameTextWidth: '80%',
            framePictureWidth: '20%',
            framePictureHeight: '80px',
            framedPictureDisplay: 'none'
        });
        this.$inner.prepend(template);
        this.$framed = this.$inner.find('.frame');
        return template;
    },
    loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
    this.$('.st-picture-right').val(data.picture);
    },

    toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg, "> $1");
    }

});
