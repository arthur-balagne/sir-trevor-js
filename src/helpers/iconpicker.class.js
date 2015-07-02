'use strict';

var $           = require('jquery');
var eventablejs = require('eventablejs');
var _           = require('../lodash.js');
var Modal       = require('etudiant-mod-modal');
var xhr         = require('etudiant-mod-xhr');
var Slider      = require('./slider.class.js');
var FileUploader = require('../extensions/file-uploader.js');



var iconPickerHtml = '<div class="icon-picker"><div class="droppable st-block__upload-container">Uploader et associer une nouvelle image</div></div>';

function dropEvent(iconPicker){
    $(iconPicker.modal.$elem.children('.droppable')[0]).on('dragover dragenter', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
    });

    $(iconPicker.modal.$elem.children('.droppable')[0]).on('drop', function(ev){
        ev.preventDefault();
        ev.stopPropagation();

        var file = ev.originalEvent.dataTransfer.files[0];

        var urlAPI = (typeof window.URL !== 'undefined') ? window.URL : (typeof window.webkitURL !== 'undefined') ? window.webkitURL : null;
        if (/image/.test(file.type)) {
            var fileUploader = iconPicker.blockRef.uploader;
            fileUploader.upload(file);
        }
    });
}

function createArrayOfIcons(icons) {
    var iconsArray = [];

    Object.keys(icons).forEach(function(k) {
        var file = icons[k].file.replace('original', '90x90');

        var single = _.template('<img src="<%= icon %>" alt="<%= alt %>" >', { icon: file, alt: icons[k].legend});
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
        }


        block.modal.open();

        if(!block.slider) {
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

        dropEvent(block);
        block.modal.$elem.children('.icon-picker').toggleClass('is-visible');

        bindClickOnIcons(block)
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
                copyright: $(this).attr('alt')
            });
        });
    });
}

function triggerChangeIllustratedPicture(block, pictureInformations){
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
            // @todo i18n the texts - move to locales.js
            header: '<header>Image</header>',

            content: '',

            footer: {
                next: 'Ok'
            }
        });
        this.modalTriggerElement.on('click', function() {
            var icons = getIcons(self.apiUrl, self);
            // @TODO put waiting animation here
        });
        return this;
    }
}

IconPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = IconPicker;
