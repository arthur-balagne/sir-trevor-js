'use strict';

var $           = require('jquery');
var eventablejs = require('eventablejs');
var _           = require('../lodash.js');
var Modal       = require('etudiant-mod-modal');
var xhr         = require('etudiant-mod-xhr');
var Slider      = require('./slider.class.js');
var FileUploader = require('../extensions/file-uploader.js');

var iconPickerHtml = '<div class="icon-picker"><div class="droppable st-block__upload-container">' + i18n.t('blocks:illustrated:placeholder:drop') + '</div></div>';

function dropEvent(iconPicker){
    $(iconPicker.modal.$elem.children('.droppable')[0]).off();
    $(iconPicker.modal.$elem.children('.droppable')[0]).on('dragover dragenter', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
    });


    $(iconPicker.modal.$elem.children('.droppable')[0]).on('drop', function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        iconPicker.blockRef.loading();

        var file = ev.originalEvent.dataTransfer.files[0];

        var urlAPI = (typeof window.URL !== 'undefined') ? window.URL : (typeof window.webkitURL !== 'undefined') ? window.webkitURL : null;
        if (/image/.test(file.type)) {

            var fileUploader = new FileUploader(iconPicker.blockRef, iconPicker.blockRef.globalConfig.apiUrl + 'edt/media/upload');

            var uploadedMedia;

            var uploadPromise = fileUploader.upload(file)
            .then(function(returnedData){
                uploadedMedia = iconPicker.blockRef.globalConfig.apiUrl + 'edt/media/' + returnedData.idMedia;
            });

            uploadPromise.then(function(){
                iconPicker.blockRef.ready();
                iconPicker.modal.close();
                xhr.get(uploadedMedia)

                .then(function(imageData) {
                   triggerChangeIllustratedPicture(iconPicker, {
                        src: imageData.content.thumbnail,
                        copyright: imageData.content.copyright,
                        id: imageData.content.id
                    });
                });
            });

            uploadPromise.catch(function(err){
                console.log(err);
            });
        }
    });
}

function createArrayOfIcons(icons) {
    var iconsArray = [];
    Object.keys(icons).forEach(function(k) {
        var file = icons[k].file.replace('original', '90x90');
        var single = _.template('<img data-id=<%= id %> src="<%= icon %>" alt="<%= alt %>" >', { icon: file, alt: icons[k].legend , id: icons[k].id });
        iconsArray.push(single);
    });
    return iconsArray;
}

function getIcons(url, block) {
    var block = block;
    xhr.get(url)
    .then(function(iconData) {
        var iconsArray = createArrayOfIcons(iconData.content);

        var modalInner = block.modal.$elem.children('.modal-content')[0];

        if (block.modal.$elem.children('.icon-picker') === false) {
            block.iconPicker = iconPickerHtml;
            $(modalInner).append(block.iconPicker);
            block.modal.$elem.children('.icon-picker').addClass('is-visible');
        }
        dropEvent(block);

        block.modal.open();

        if(block.slider === undefined) {
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
            block.slider = new Slider(params); //@TODO  Teach the slider how to handle native element & jquery elements;
        }

        bindClickOnIcons(block);
    })
    .catch(function(err) {
        console.log(err);
        console.error('Somehting went wrong');
    });
}


function bindClickOnIcons(block) {
    $.each(block.slider.$elem.find('img'), function(){
        $(this).on('click', function(){
            triggerChangeIllustratedPicture(block, {
                src: $(this).attr('src'),
                copyright: $(this).attr('alt'),
                id: $(this).data('id')
            });
        });
    });
}

function triggerChangeIllustratedPicture(block, pictureInformations){
    block.blockRef.imageId =  pictureInformations.id;
    block.trigger('picture:change', pictureInformations);

    block.modal.close();

}

var IconPicker = function(param) {
    this.apiUrl = param.apiUrl;
    this.blockRef = param.blockRef;
    this.modalTriggerElement = param.modalTriggerElement;
    this.modal = new Modal({
        slug: 'icons-modal',
        animation: 'fade',
        theme: 'media'
    });
    this.init();
};

var prototype = {

    init: function(){
        var self = this;

        this.modal.render({
            header: '<header>' + i18n.t('blocks:illustrated:modal:header') + '</header>',

            content: '',

            footer: {
                ok: i18n.t('blocks:illustrated:modal:close')
            }
        });

        if (this.modalTriggerElement.children().length !== 0){
            this.modalTriggerElement.on('click', 'img', function() {
                var icons = getIcons(self.apiUrl , self);
            })
        }
        else {
            this.modalTriggerElement.on('click', function() {
                var icons = getIcons(self.apiUrl , self);
                $(this).off('click');
            });

        }
    }
}

IconPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = IconPicker;
