'use strict';

/*
  Illustrated Block
*/

var Block = require('../block');
var stToHTML = require('../to-html');
var _   = require('../lodash.js');
var $ = require('jquery');
var Slider = require('../helpers/slider.class.js');

var colorHandler = {
    blue: [
        '#0A122A',
        '#2E9AFE',
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
};

var colorLine = _.template('<tr><%= line %></tr>');

var colorElement = _.template('<td style="width: 15px; height:15px" data-color="<%= color %>" bgcolor="<%= color %>"></td>');

var blockTemplate = _.template([
'<div class="st-text-block" contenteditable="true">',
    '<div class="illustrated">',
    '<figure class="empty" contenteditable="false">',
        '<img src="<%= imgSrc %>" alt="<%= imgAlt %>">',
    '</figure>',
    '<div class="title" style="<%= titleStyle %>"><%= titleText %></div>',
    '<div class="text"><%= text %></div>',
    '</div>',
'</div>'
].join('\n'));


var colorpicker =  _.template([
    '<select class="colors">',
        '<option class="bcg-black" value="#000000">Noir</option>',
        '<option class="bcg-white"  value="#ffffff">Blanc</option>',
        '<option class="bcg-blue"  value="#4679bd">Bleu</option>',
        '<option class="bcg-brown"  value="#B35C1E">Marron</option>',
        '<option class="bcg-grey"  value="#DADADA">Gris</option>',
    '</select>'
].join('\n'));

var mediaTemplate = _.template([
    '<div class="media">',
        '<div class="header"><a href="#" class="close-media">x</a></div>',
        '<div class="left"></div>',
        '<div class="center"></div>',
        '<div class="right"></div>',
        '<div class="footer"></div>',
    '</div>'
    ].join('\n'));

function generateContainer(icons) {
    if (icons === undefined) {
        return [];
    }
    var tabIcons = [];
    Object.keys(icons).forEach(function(k){
        var single = _.template('<img src="<%= icon %>" alt="<%= alt %>">')({ icon: icons[k].src, alt: icons[k].copyright  });
        tabIcons.push(single);
    });
    return tabIcons;
}

function changePictureOnClick($selected, $block) {
    var selectedSrc =  $selected.attr('src');
    $block.find('figure img').attr('src', selectedSrc);
}
function getColors() {
    var table = document.createElement('table');
    Object.keys(colorHandler).forEach(function(l){
        var tr = '';
        var tds = '';
        var actualLine = colorHandler[l];
        Object.keys(actualLine).forEach(function(element){
            var td = colorElement({
                color: actualLine[element]
            });
            tds = tds + td
        });
        tr = colorLine({
            line: tds
        });
        $(table).append(tr);

    });
    $(table).css('display','inline-block');
    $(table).css('border', 'none !important');
    return table;
}
function selectedColorWatcher($block) {
    $block.$el.find('.st-block__control-ui td').on('click', function(){
        var color = $(this).data('color');
        changeSelectedColor(color, $block);
        $(this).parents('table').remove();
    });
}

function changeSelectedColor(color, $block) {
    $block.$editor.find('.title').css('color', color);
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
                var colorsTable = getColors();
                if (this.$control_ui.find('table').length == 0) {
                    this.$control_ui.append(getColors());
                    selectedColorWatcher(this);
                }
                else if(this.$control_ui.find('table').length == 1){
                    this.$control_ui.find('table').remove();
                }
            },
            html: '<span>Couleur</span>'
        },
        {
            slug: 'change-picture',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                e.stopPropagation();
                var tabIcons = generateContainer([
                    {
                        src: 'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-audi.jpeg',
                        copyright: 'Audi'
                    },
                    {
                        src: 'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-bmw.png',
                        copyright: 'Bmw'
                    },
                    {
                        src: 'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-lotus.jpeg',
                        copyright: 'Lotus'
                    },
                    {
                        src: 'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-tesla-motors.jpeg',
                        copyright: 'Tesla'
                    },
                    {
                        src: 'http://www.voituresdeprestige.fr/media/cache/resolve/logo_marque/uploads/images/marque-ford.jpeg',
                        copyright: 'Ford'
                    }
                ]);

                if(this.$el.find('.illustrated .media').val() === undefined) {
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
                    this.$el.find('.illustrated .media .footer').append('<div contenteditable="false" class="droppable">Uploader et associer une nouvelle image</div>');

                    var $sliderImages = this.$el.find('.illustrated .media .st-slider-slide img');
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
                        var urlAPI = (typeof URL !== "undefined") ? URL : (typeof webkitURL !== "undefined") ? webkitURL : null;

                        $('figure img').attr('src', urlAPI.createObjectURL(file));
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
                }
            },
            html: '<span>Icone</span>'
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
    setData: function(data) {
        var content = this.getTextBlock();
        var img = '';
        var title = '';
        var text = '';
        var obj = {};
        if (content.find('.text').html().length > 0) {
            img = this.$el.find('figure img');
            if (img.attr('src') !== '') {
                data.img = {};
                obj = {
                    src: img.attr('src'),
                    alt: img.attr('alt')
                };
                Object.assign(data.img, obj);
                content.find('figure').removeClass('empty');
            }
            title = this.$el.find('.title');
            data.title = {};
            obj = {
                text: title.val(),
                style: title.attr('style')
            };
            Object.assign(data.title, obj);

            text = this.$el.find('.text').html();
            data.text = text;
        }
        Object.assign(this.blockStorage.data, data || {});
    },

    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '$1');
    },

    onBlockRender: function() {
        $('.illustrated figure').one('click', function(){
            $('.st-block-control-ui-btn--change-picture').trigger('click');
        });
    }

});
