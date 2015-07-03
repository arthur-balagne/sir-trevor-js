'use strict';

/*
  Illustrated Block
*/

var Block            = require('../block');
var stToHTML         = require('../to-html');
var _                = require('../lodash.js');
var $                = require('jquery');
var ColorPicker      = require('../helpers/colorpicker.class.js');
var IconPicker       = require('../helpers/iconpicker.class.js');
var CopyrightPicker  = require('../helpers/copyrightPicker.class.js');

var blockTemplate = _.template([
    '<div class="st-text-illustrated illustrated">',
        '<figure class="empty"></figure>',
        '<input type="text" class="title" value="<%= titleText %>" >',
        '<div contenteditable="true" class="text st-text-block"> <%= text %> </div>',
    '</div>'].join('\n')
);

var imgTemplate = '<img src="<%= src %>" alt="<%= copyright %>"></figcaption>';

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
            html: '<span>' + i18n.t('blocks:illustrated:button:color') +'</span>'
        }
    ],
    editorHTML: blockTemplate({
        text: i18n.t('blocks:illustrated:placeholder:text'),
        titleText: i18n.t('blocks:illustrated:placeholder:title')
      }),
    icon_name: 'text',

    loadData: function(data) {

        if (data.title !== undefined) {
            this.$el.find('.title').val(data.title);
        }
        if (data.titleColor !== undefined) {
            this.$el.find('.title').css('color', data.titleColor);
        }
        if (data.img !== undefined) {
            var imgHtml = _.template(imgTemplate,(data.img));
            this.$el.find('figure').append(imgHtml).removeClass('empty');
        }

        this.getTextBlock().html(stToHTML(data.text, this.type));
    },

    onBlockRender: function() {
        var self = this;
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

        this.$editor.find('.title').on('keyup', function(){
            var title = $(this).val();
            self.setData({
                title: title
            });
        })

        this.iconPicker = new IconPicker ({
            apiUrl: self.globalConfig.apiUrl + 'edt/media?application=ETU_ETU&type=image&limit=10',
            blockRef: this,
            modalTriggerElement: this.$el.find('figure')
        });

        this.iconPicker.on('picture:change', function(selectedPicture) {
            var imagePicturHtml =  _.template(imgTemplate, selectedPicture);
            if(this.$editor.find('figure').children() !== undefined){
                this.$editor.find('figure').children().remove();
            }
            this.$editor.find('figure').append(imagePicturHtml).removeClass('empty');

            this.setData({
                img: selectedPicture
            });

            //Picture changed we check for copyright
            var figure = this.$el.find('figure');

            if (this.$el.find('figure').find('img').attr('alt').length == 0) {
                self.copyrightPicker = new CopyrightPicker(self);
            }

        }.bind(this));

        var self = this;


    }

});


