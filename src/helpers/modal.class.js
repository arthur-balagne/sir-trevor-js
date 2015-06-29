var _  = require('../lodash.js');
var xhr = require('etudiant-mod-xhr');
var eventablejs = require('eventablejs');
var zoom = require('etudiant-mod-zoom');
var evt = require('etudiant-mod-mediator');
var $ = require('jquery');
var FilterBar = require('./filterbar.class.js');
var Modal = require('etudiant-mod-modal');
var eventBus = require('../event-bus.js');

var ModalHelper = function() {
    this.modalTemplateFilters;
    this.modalTemplateStep1;
    this.modalTemplateStep2;
    this.filteredImagesTab = [];
    this.sel = undefined;
    this.range = undefined;
}
var apiUrl = 'http://api.letudiant.lk/edt/media';


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
};


var prototype = {
    /**
    * Change the keyword 'original' with another string
    * @param  {string} src  the original value from API
    * @param  {string} size the newpicture size
    * @return {string} Well formated string with the new size
    */
    changeOriginalPictureSize: function (src, size) {
        if (src === undefined) {
            return false;
        }
        if (src.indexOf('original') > 0) {
            src = src.replace('original', size);
            return src;
        }
    },

    /**
    * Hydrate a modal with well formated HTML
    * @param  {obj} modalStep The modal object
    * @param  {string} template  well formated template
    */
     openModalStep1: function(modalStep, template) {
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
    },
    /**
    *   Hydrate a modal with well formated HTML
    */
    openModalStep2: function(modal) {
        modal.render({
            header: '<header>Image</header>',
            content: modalTemplateStep2,
            footer: {
                ok: 'Ok',
                dismiss: 'Annuler'
            }
        });
        modal.open();
    },
    selectUpdater: function() {
        $.each($('.slide-row .sizes'), function(){
            if ($(this).children().length === 1) {
                $(this).addClass('hidden');
                $(this).parent().append('<p class="size">' + $(this).children().val() + '</p>');
            }
            else {
                $(this).removeClass('hidden');
            }
        });
    },
    /**
    * Show/Hide controls depending on events
    *
    */
    sliderControls: function(slider){

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
    },
    startStep2: function(block) {
        this.modalStep1.close();
        eventBus.trigger('button:control-0:enable');
        evt.publish('modal-gallery-step-2', block);
    },
    /**
    * Helper function to create a picture object
    * @param  {string} row Id or Class of the picture
    * @return {object}     Picture object
    */
    updateData: function(row) {
        var picture = {};
        picture.url = $('.modal-row-picture.' + row).data('image');
        picture.sizes = $('.modal-row-content.' + row + ' .sizes').find(':selected').val();
        picture.width = picture.sizes.split('x')[0];
        picture.height = picture.sizes.split('x')[1];
        picture.name = picture.url;
        return picture;
    },

    /**
    * Deliver filterbar fields parameters
    *
    */
    filterBarFormatter: function(jsonFilters) {
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
    },


    /**
     * Helper function to update the all data's image with the selected size value.
     */
    updateZoom: function(filteredImages) {
        var that = this;
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
            var newSize = that.changeOriginalPictureSize(originalSize, zoomedSize);

            $('.modal-row-picture.' + rowId).attr('data-image', newSize);
        });
    },
    /**
    * Filterbar launcher
    */
    loadFilterBar: function(fields, modal) {
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
    },

    /**
    * Grab all data's, update the sirTrevor block,  then to open next modal
    * @param  {object} block the sir trevor block object to update
    */
    synchronizeAndOpenStep2: function(block) {

        var that = this;
        $('.modal-gallery-step-1 .validate').one('click', function(e){
            e.preventDefault();
            e.stopPropagation();
            var row = $(this).attr('class').split(' ')[1];
            var picture = that.updateData(row);
            var filteredImage = that.filteredImagesTab[row];
            var imageBlock;

            filteredImage.media.size = picture.sizes;
            filteredImage.resize(picture.sizes);
            filteredImage.media.custom = filteredImage.resize(picture.sizes);
            filteredImage.media.align = 'f-right';

            modalTemplateStep2 = that.filteredImagesTab[row].renderLarge();
            imageBlock = filteredImage.renderBlock();
            block.filteredImage = filteredImage;
            that.startStep2(block);
            $('.modal-gallery-step-2 .preview').attr('src', that.filteredImagesTab[row].media.imageResized);
            $('.modal-gallery-step-2 .size').text(picture.sizes);
            block.$el.focus()
            if (that.sel === undefined) {
                that.sel = window.getSelection();
                that.range = that.sel.getRangeAt(0);
                if (that.range.collapsed) {
                    that.range.collapse(false);
                }
            }
            else {
                that.sel.removeAllRanges();
                that.sel.addRange(that.range);
            }
            var el = document.createElement('div');
                el.innerHTML = imageBlock;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ((node = el.firstChild)) {
                    lastNode = frag.appendChild(node);
                }
                that.range.insertNode(frag);
                if (lastNode) {
                    that.range = that.range.cloneRange();
                    that.range.setStartAfter(lastNode);
                    that.range.collapse(true);
                    that.sel.removeAllRanges();
                    that.sel.addRange(that.range);
                }
            filteredImage.bindHover(block, filteredImage);
        });
    },
    /**
    * Grab all data's, update the sirTrevor block,  then to close actual modal
    * @param  {object} block the sir trevor block object to update
    *
    */
    synchronizeAndCloseStep2: function(block) {
        var rowId = $('body .modal-gallery-step-2 .position').data('row');
        var position = $('.position').find(':selected').val();
        var that = this;

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
                $('img.picture-' + rowId).data('link', pictureLink);
                if ($('img.picture-' + rowId).parent().prop('tagName') == 'A') {
                    $('img.picture-' + rowId).parent().attr('href', pictureLink);
                }
                else {
                    $('img.picture-' + rowId).wrap('<a href="'+pictureLink+'"></a>')
                }
            }
        });

        $('.picture-' + rowId).addClass(position);

        $('.position').on('change', function(){
            var id = $(this).data('row');
            position = $(this).find(':selected').val();
            $('img.picture-' + id).removeClass('f-right').removeClass('f-left').addClass(position);
            $('img.picture-' + id).closest('figure').removeClass('f-right').removeClass('f-left').addClass(position);
        });

        $('.picture-link').on('keyup', function(e) {
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
}

ModalHelper.prototype = Object.assign({}, prototype);
module.exports = ModalHelper;
