"use strict";

/*
  Block Quote
*/

var _ = require('../lodash');
var mediator = require('etudiant-mod-mediator');

var Block = require('../block');
var stToHTML = require('../to-html');
var template;


function getTemplate(params) {
  var template = '';
  template += '<div class="frame" style="box-sizing:border-box; display:inline-block; width:100%; background-color:'+params.frameColor+'; border: 3px solid '+params.frameBorder+'">';
  template += '<div class="st-required st-text-block framed" style="width:'+params.frameTextWidth+'; vertical-align:top; display:'+params.frameTextDisplay+' " contenteditable="true"></div>';
  template += '<div class="framed-picture" style="display:'+params.framedPictureDisplay+'; vertical-align:top; width:'+params.framePictureWidth+'; height:auto"><img src="http://lorempixel.com/180/80/sports/56"><br><legend>Ma super légende &copy L etudiant </legend></div>';
  template += '</div>';
  return template;
}

function togglePicture(ev, block) {
    ev.preventDefault();
    var framePicture = block.find('.framed-picture');
    framePicture.toggleClass('hidden');
    if(framePicture.hasClass('hidden')) {
        framePicture.css('display', 'none');
    }else{
        framePicture.css('display', 'inline-block');
    }
}

module.exports = Block.extend({
    type: "framed",
    title: function() { return i18n.t('blocks:framed:title'); },
    icon_name: 'quote',
    controllable: true,
    controls_position: 'bottom',
    controls_visible: true,
    controls: [
        {
            slug: 'add-picture',
            'icon' : 'image',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                var block = this.$framed;
                togglePicture(e, block);
            }
        }
    ],


    onBlockRender: function() {
        var template = getTemplate({
            frameColor : '#536A4C',
            frameBorder : '#6C8365',
            frameDisplay : 'block',
            frameTextDisplay : 'inline-block',
            frameTextWidth : '80%',
            framePictureWidth : '20%',
            framePictureHeight : '80px',
            framedPictureDisplay : 'inline-block'
        });
        console.log(template);
        this.$inner.prepend(template);
        this.$framed = this.$inner.find('.frame');
        return template;
    },


    loadData: function(data){
    this.getTextBlock().html(stToHTML(data.text, this.type));
    this.$('.st-picture-right').val(data.picture);
    },

    toMarkdown: function(markdown) {
    return markdown.replace(/^(.+)$/mg,"> $1");
    }

});
