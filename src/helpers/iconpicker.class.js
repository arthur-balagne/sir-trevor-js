'use strict';

var $                = require('jquery');
var eventablejs      = require('eventablejs');
var _                = require('../lodash.js');
var Modal            = require('etudiant-mod-modal');
var xhr              = require('etudiant-mod-xhr');
var Slider           = require('./slider.class.js');
var FileUploader     = require('../extensions/file-uploader.js');
var CopyrightPicker  = require('./copyrightPicker.class.js');

var iconPickerHtml = [
'<div class="icon-picker"><div class="droppable st-block__upload-container">',
    i18n.t('blocks:illustrated:placeholder:drop'),
'</div></div>'
].join('\n');


function triggerChangeIllustratedPicture(iconPicker, pictureInformations){
    iconPicker.blockRef.imageId = pictureInformations.id;
    iconPicker.trigger('picture:change', pictureInformations);

    if (iconPicker.blockRef.$el.find('figure').find('img').attr('alt').length === 0) {
        iconPicker.copyrightPicker = new CopyrightPicker(iconPicker.blockRef);
        iconPicker.copyrightPicker.on('copyright:changed', function() {

            iconPicker.blockRef.addMessage('Copyright mis à jour', 'st-block-displaying-message');

            window.setTimeout(function() {
                iconPicker.blockRef.resetMessages();
            }, 3000);
                });
            }

    iconPicker.modal.close();

}

function bindClickOnIcons(block) {
    block.slider.$elem.on('click', 'img', function(){
        triggerChangeIllustratedPicture(block, {
            src: $(this).attr('src'),
            copyright: $(this).attr('alt'),
            id: $(this).data('id')
        });
    });
}

function getMedia(uploadedMediaUrl, iconPicker) {
    xhr.get(uploadedMediaUrl)
    .then(function(imageData){
        triggerChangeIllustratedPicture(iconPicker, {
            src: imageData.content.thumbnail,
            copyright: imageData.content.copyright,
            id: imageData.content.id
        });
    })
    .catch(function(err){
        console.log(err);
    });
}

function onDrop(transferData, iconPicker) {

    var file = transferData.files[0];

    if (/image|video/.test(file.type)) {
        var fileUploader = new FileUploader(iconPicker.blockRef, iconPicker.blockRef.globalConfig.apiUrl + 'edt/media/upload');
        var uploadedMedia;
        iconPicker.blockRef.loading();
        var uploadPromise = fileUploader.upload(file);

        uploadPromise.then(function(returnedData) {
            uploadedMedia = iconPicker.blockRef.globalConfig.apiUrl + 'edt/media/' + returnedData.idMedia;
        })
        .catch(function(err) {
            console.log(err);
        });

        uploadPromise.then(function() {
            iconPicker.blockRef.ready();
            iconPicker.modal.close();

            return getMedia(uploadedMedia, iconPicker);
        }).catch(function(err) {
            console.log(err);
        });

    }
}

function createDropzone(iconPicker) {
    iconPicker.blockRef.$editor.$dropzone = $(iconPicker.modal.$elem.children('.droppable')[0]); // assign dropzone to an area
    iconPicker.blockRef.$editor.$dropzone.dropArea().bind('drop', function(ev){
        ev.preventDefault();
        ev = ev.originalEvent;

        onDrop(ev.dataTransfer, iconPicker);
        iconPicker.blockRef.$editor.$dropzone.dropArea().unbind('drop');
    });

}

function createArrayOfIcons(icons) {
    var iconsArray = [];
    icons.forEach(function(icon) {
        var file = icon.file.replace('original', '90x90');
        var single = _.template('<img data-id=<%= id %> src="<%= icon %>" alt="<%= alt %>" >', { icon: file, alt: icon.copyright, id: icon.id });
        iconsArray.push(single);
    });
    return iconsArray;
}

function getIcons(iconPicker) {

    xhr.get(iconPicker.apiUrl)
    .then(function(iconData) {
        var iconsArray = createArrayOfIcons(iconData.content);

        var modalInner = iconPicker.modal.$elem.children('.modal-content')[0];

        if (iconPicker.modal.$elem.children('.icon-picker') === false) {
            $(modalInner).append(iconPickerHtml);
        }
        createDropzone(iconPicker);

        iconPicker.modal.open();

        if (iconPicker.slider === undefined) {
            var params = {
                contents: iconsArray,
                itemsPerSlide: 5,
                increment: 1,
                container: $(modalInner),
                controls: {
                    next: 'Next',
                    prev: 'Prev'
                }
            };

            iconPicker.slider = new Slider(params); //@TODO  Teach the slider how to handle native element & jquery elements;
            iconPicker.slider.on('progress', function() {
                var offset = iconPicker.slider.currentIndex * iconPicker.slider.config.itemsPerSlide;
                xhr.get('http://api.letudiant.lk/edt/media?application=ETU_ETU&type=image&limit=20&offset=' + offset)
                .then(function(updatedIconData) {
                    iconsArray = createArrayOfIcons(updatedIconData.content);
                    iconPicker.slider.update(iconsArray);
                })
                .catch(function(err){
                    console.log(err);
                });
            });
        }

        bindClickOnIcons(iconPicker);
    })
    .catch(function(err) {
        console.log(err);
        console.error('Somehting went wrong');
    });
}

var IconPicker = function(param) {
    this.init(param);
};

var prototype = {

    init: function(param) {
        var self = this;
        this.apiUrl = param.apiUrl;
        this.blockRef = param.blockRef;
        this.modalTriggerElement = param.modalTriggerElement;
        this.modal = new Modal({
            slug: 'icons-modal',
            animation: 'fade',
            theme: 'media'
        });

        this.modal.render({
            header: '<header>' + i18n.t('blocks:illustrated:modal:header') + '</header>',

            content: '',

            footer: {
                ok: i18n.t('blocks:illustrated:modal:close')
            }
        });

        this.modalTriggerElement.on('click', function(ev) {
            ev.stopPropagation();
            if ($(this).children().length < 2) {
                getIcons(self);
            }

        });

        this.modalTriggerElement.on('click', 'img', function(ev) {
            ev.stopPropagation();
            getIcons(self);

        });
    },

    destroy: function() {
        this.modal.destroy();
        this.prototype = null;

    }

};

IconPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = IconPicker;
