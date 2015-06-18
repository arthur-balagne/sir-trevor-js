"use strict";

/*
  Text Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');
var Medium = require('medium-editor');
var $ = require('jquery');
var q  = require('q');
var Modal = require('etudiant-mod-modal');
var zoom = require('etudiant-mod-zoom');
var Slider   = require('../helpers/slider.class.js');
var eventBus = require('../event-bus.js');
var subBlockManager = require('../sub_blocks/index.js');
var FilterBar = require('../helpers/filterbar.class.js');
var xhr = require('etudiant-mod-xhr');

module.exports = Block.extend({

    type: "text",
    controllable: true,
    formattable: true,
    title: function() { return i18n.t('blocks:text:title'); },
    editorHTML: '<div class="st-required st-text-block" contenteditable="true"></div>',
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

    loadData: function(data){
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },
    getTextBlock: function() {
        this.text_block = this.$('.st-text-block');
        return this.text_block;
    },
     onBlockRender: function() {

        this.filteredImagesTab = '';

        var textBlock = this.getTextBlock();

        //Used to unify the contentEditable behavior
        var editor = new Medium('.st-text-block', {
            toolbar: false
        });


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
    }
});
