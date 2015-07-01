'use strict';

/*
  Illustrated Block
*/

var Block       = require('../block');
var stToHTML    = require('../to-html');
var _           = require('../lodash.js');
var $           = require('jquery');
var ColorPicker = require('../helpers/colorpicker.class.js');
var IconPicker  = require('../helpers/iconpicker.class.js');

var blockTemplate = _.template([
    '<div class="st-text-block" contenteditable="true">',
        '<div class="illustrated">',
        '<figure class="empty" contenteditable="false">',
            '<img src="<%= imgSrc %>" alt="<%= imgAlt %>">',
        '</figure>',
        '<div class="title" style="<%= titleStyle %>"><%= titleText %></div>',
        '<div class="text"><%= text %></div>',
        '</div>',
    '</div>'].join('\n')
);

function changePictureOnClick($selected, $block) {
    var selectedSrc =  $selected.attr('src');
    $block.find('figure img').attr('src', selectedSrc);
}


module.exports = Block.extend({
    type: 'Illustrated',
    title: function() {
        return 'Valeur illustrée';
    },
    controllable: true,
    uploadable: true,
    controls_position: 'top',
    controls_visible: true,
    controls:
    [
        {
            slug: 'change-color',
            eventTrigger: 'click',
            fn: function(e) {
                this.colorPicker.toggleVisible();
            },
            html: '<span>Couleur</span>'
        }
    ],
    editorHTML: blockTemplate({
        text: 'Votre texte',
        titleText: 'Votre titre',
        titleStyle: '',
        imgSrc: '',
        imgAlt: ''
      }),
    icon_name: 'text',

    loadData: function(data) {
        var templateObject = {
            text: data.text,
            titleText: data.title.text
            // titleColor:
        };
        var tpl = '';

        templateObject.titleStyle = data.title.style !== undefined ? data.title.style : '';
        if (data.img !== undefined) {
            templateObject.imgSrc = data.img.src;
            templateObject.imgAlt = data.img.alt;
        }
        tpl = blockTemplate(templateObject);
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },
    // setData: function(data) {
    //     var content = this.getTextBlock();
    //     var img = '';
    //     var title = '';
    //     var text = '';
    //     var obj = {};
    //     if (content.find('.text').html().length > 0) {
    //         img = this.$el.find('figure img');
    //         if (img.attr('src') !== '') {
    //             data.img = {};
    //             obj = {
    //                 src: img.attr('src'),
    //                 alt: img.attr('alt')
    //             };
    //             Object.assign(data.img, obj);
    //             content.find('figure').removeClass('empty');
    //         }
    //         title = this.$el.find('.title');
    //         data.title = {};
    //         obj = {
    //             text: title.val(),
    //             style: title.attr('style')
    //         };
    //         Object.assign(data.title, obj);

    //         text = this.$el.find('.text').html();
    //         data.text = text;
    //     }
    //     Object.assign(this.blockStorage.data, data || {});
    // },

    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '$1');
    },

    onBlockRender: function() {
        this.colorPicker = new ColorPicker({
            block: this,
            colors: {
                blue: [
                    '#0A122A',
                    '#2E9AFE',
                    '#2E64FE',
                    '#2E64FE'
                ],
                red: [
                    '#2A0A0A',
                    '#8A0808',
                    '#FE2E2E'
                ],
                green: [
                    '#088A08',
                    '#04B404',
                    '#00FF00'
                ]
            }
        });

        this.colorPicker.on('color:change', function(selectedColor) {
            this.$editor.find('.title').css('color', selectedColor);

            this.setData({
                titleColor: selectedColor
            });

        }.bind(this));

        this.iconPicker = new IconPicker({
            apiUrl: 'http://api.letudiant.lk/edt/media?application=ETU_ETU&type=image&limit=10', // will be  this.globalConfig.apiUrl
            blockRef: this,
            modalTriggerElement: this.$el.find('figure')
        });

        // this.iconPicker.on('iconselect', function(selectedIcon) {

        //     appendIcon(self, selectedIcon);

        //     this.setData({
        //         icon: selectedIcon
        //     });
        // });
    }

});


