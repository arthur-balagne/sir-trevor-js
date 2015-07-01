'use strict';

var $ = require('jquery');
var eventablejs = require('eventablejs');
var _   = require('../lodash.js');
var Modal = require('etudiant-mod-modal');
var xhr = require('etudiant-mod-xhr');
var Slider    = require('./slider.class.js');


var modal = new Modal({
    slug: 'icons-modal',
    animation: 'fade',
    theme: 'media'
});

var iconPickerHtml = '<div class="icon-picker"><div contenteditable="false" class="droppable">Uploader et associer une nouvelle image</div></div>';

function dropEvent(block){
    $(block).on('dragover dragenter', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
    });
    $(block).on('drop', function(ev){
        ev.preventDefault();
        ev.stopPropagation();
        console.log(ev);
        // var file = ev.originalEvent.dataTransfer.files[0];
        // var urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;
        // that.$el.find('figure img').attr('src', urlAPI.createObjectURL(file));

        // Need the server to send a 200response or the POST upload will fail

        // that.uploader(
        //     file,
        //     function(data) {
        //         that.setData(data);
        //         that.ready();
        //     },
        //     function(error) {
        //         that.addMessage(i18n.t('blocks:image:upload_error'));
        //         that.ready();
        //     }
        // );
    });
}

function generateContainer(icons) {
    var iconsArray = [];
    Object.keys(icons).forEach(function(k){
        var file = icons[k].file.replace('original', '90x90');
        var single = _.template('<img src="<%= icon %>" alt="<%= alt %>">')({ icon: file, alt: icons[k].legend  });
        iconsArray.push(single);
    });
    return iconsArray;
}
function getIcons(url, modal){
    xhr.get(url)
    .then(function(iconData) {
        var iconsArray = generateContainer(iconData.content);

        var slider = new Slider({
            contents: iconsArray,
            itemsPerSlide: 5,
            increment: 2
        });
        //modal-icons-modal
        //slider.appendToDOM($(modalContainer).find('.modal-content'));
        debugger;
        var modalInner = modal.$elem.children('.modal-content');
        modalInner.append(iconPickerHtml);
        dropEvent(modal.$elem.children('.modal-content .droppable'));
        //debugger;
        //slider.appendToDOM($(modalContainer).find('.modal-content'));
        //slider.render();
        modal.open();
    })
    .catch(function(err) {
        console.error('Somehting went wrong');
    });
}

var IconPicker = function(param) {
    this.apiUrl = param.apiUrl;
    this.blockRef = param.blockRef;
    this.modalTriggerElement = param.modalTriggerElement;
    this.init();
};

var prototype = {

    init: function(){
        var self = this;

        modal.render({
            // @todo i18n the texts - move to locales.js
            header: '<header>Image</header>',

            content: '',

            footer: {
                next: 'Ok'
            }
        });
        this.modalTriggerElement.on('click', function() {
            var icons = getIcons(self.apiUrl, modal);
            // @TODO put waiting animation here
        });
    }
}

IconPicker.prototype = Object.assign({}, prototype, eventablejs);

module.exports = IconPicker;
