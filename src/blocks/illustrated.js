'use strict';

/*
  Illustrated Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');
var _   = require('../lodash.js');
var $ = require('jquery');
var Slider = require('../helpers/slider.class.js');


var blockTemplate = _.template([
'<div class="st-text-block" contenteditable="true">',
    '<div class="illustrated">',
    '<figure contenteditable="false">',
        '<img src="<%= imgSrc %>" alt="<%= imgAlt %>">',
    '</figure>',
    '<div class="title" style="<%= titleStyle %>"><%= titleText %></div>',
    '<div class="text"><%= text %></div>',
    '</div>',
'</div>',
].join("\n"));



var colorpicker =  _.template([
    '<select class="colors">',
        '<option class="bcg-black" value="#000000">Noir</option>',
        '<option class="bcg-white"  value="#ffffff">Blanc</option>',
        '<option class="bcg-blue"  value="#4679bd">Bleu</option>',
        '<option class="bcg-brown"  value="#B35C1E">Marron</option>',
        '<option class="bcg-grey"  value="#DADADA">Gris</option>',
    '</select>'
].join("\n"));

var mediaTemplate = _.template([
    '<div class="media">',
        '<div class="header"><a href="#" class="close-media">x</a></div>',
        '<div class="left"></div>',
        '<div class="center"></div>',
        '<div class="right"></div>',
        '<div class="footer"></div>',
    '</div>',
    ].join('\n'));

function generateContainer(icons) {
    if (icons === undefined) {
        return;
    }
    var tabIcons = [];
    Object.keys(icons).forEach(function(k){
        var single = _.template('<img src="<%= icon %>" alt="placeholder">')({ icon: icons[k] });
        tabIcons.push(single);
    });
    return tabIcons;
}

function changePictureOnClick($selected, $block) {
    var selectedSrc =  $selected.attr('src');
    $block.find('figure img').attr('src', selectedSrc)
}

function handleDrop() {

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
            eventTrigger: 'change',
            fn: function(e) {
                var color = this.$el.find('.colors').find('option:selected').attr('value');
                this.$el.find('.title').css('color', color);
            },
            html: colorpicker()
        },
        {
            slug: 'change-picture',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                var tabIcons = generateContainer([
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-aston-martin.jpeg',
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-audi.jpeg',
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-bmw.png',
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-lotus.jpeg',
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-koenigsegg.jpeg',
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-tesla-motors.jpeg',
                    'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-ford.jpeg'
                ]);
                this.$el.find('.illustrated').append(mediaTemplate());

                var that = this;
                $('.close-media').on('click', function(){
                    that.$el.find('.media').remove();
                });

                var slider = new Slider(tabIcons);
                slider.init({
                    itemsPerSlide: 8,
                    increment: 1,
                    controls: false,
                    contents: tabIcons,
                    container: that.$el.find('.illustrated .media .center')
                });
                this.$el.find('.illustrated .media .footer').append('<div  contenteditable="false" class="droppable">Uploader et associer une nouvelle image</div>')

                var $sliderImages = this.$el.find('.illustrated .media .st-slider-slide img')
                $.each($sliderImages, function(){
                    $(this).on('click', function(){
                        changePictureOnClick($(this), that.$editor);
                        that.$el.find('.media').remove();
                    });
                });
                this.$el.find('.droppable').on('dragover dragenter', function(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                });
                this.$el.find('.droppable').on('drop', function(ev){
                    ev.preventDefault();
                    ev.stopPropagation();
                    var file = ev.originalEvent.dataTransfer.files[0];
                    that.uploader(
                        file,
                        function(data) {
                            that.setData(data);
                            that.ready();
                        },
                        function(error) {
                            that.addMessage(i18n.t('blocks:image:upload_error'));
                            that.ready();
                        }
                    );
                });

            },
            html: '<span>Icon</span>'
        }
    ],
    editorHTML: blockTemplate({
        text: "Votre texte",
        titleText: "Votre titre",
        titleStyle: "",
        imgSrc: "",
        imgAlt: ""
      }),
    icon_name: 'text',

    loadData: function(data) {
        var templateObject = {
            text: data.text,
            titleText: data.title.text

        }
        var tpl = '';

        templateObject.titleStyle =  data.title.style !== undefined ? data.title.style : '';
        if (data.img !== undefined) {
            templateObject.imgSrc =  data.img.src;
            templateObject.imgAlt =  data.img.alt;
        }
        tpl = blockTemplate()
        debugger;
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },
    setData: function(data) {
        var content = this.getTextBlock();
        var img = '';
        var title = '';
        var text = '';
        if (content.find('.text').html().length > 0) {
            img = this.$el.find('figure img');
            if (img !== undefined) {
                data.img = {};
                var obj = {
                    src: img.attr('src'),
                    alt: img.attr('alt')
                }
                Object.assign(data.img, obj);
            }
            title = this.$el.find('.title');
            data.title = {};
                var obj = {
                    text: title.val(),
                    style: title.attr('style')
                }
            Object.assign(data.title, obj);

            text = this.$el.find('.text').html();
            data.text = text;
        }
        Object.assign(this.blockStorage.data, data || {});
    },

    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg,"$1");
    },

    onBlockRender: function() {
    },

});
