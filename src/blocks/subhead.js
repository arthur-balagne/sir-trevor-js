"use strict";

/*
  subhead Block
*/
var _ = require('../lodash');
var Block = require('../block');
var stToHTML = require('../to-html');




function changeTitle(blockData, level) {
    var block = blockData.$el.find('.st-text-block');
    if(block.children().html() !== undefined) {
        var blockContent = block.children().html();
    }
    else {
        var blockContent = block.html();
    }

    block.data('content', blockContent);
    if (blockContent.length > 0) {
       block.html('<' + level + '>' + blockContent +'</' + level + '>');
    }
}

module.exports = Block.extend({

    type: "subhead",
    title: 'Titre',
    icon_name: 'text',
    editorHTML: '<div class="st-required st__title st-text-block" contenteditable="true"></div>',
    controllable: true,
    controls_position: 'top',
    controls_visible: true,
    controls: [
        {
            slug: 'h1',
            eventTrigger: 'click',
            icon: 'h1',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h1');
            }
        },
        {
            slug: 'h2',
            eventTrigger: 'click',
            icon: 'h2',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h2');
            }
        },
        {
            slug: 'h3',
            eventTrigger: 'click',
            icon: 'h3',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h3');
            }
        }
    ],

    onBlockRender: function() {
        //this.getTextBlock().append(template(this));
    },

    setData: function(blockData) {
        debugger;
        Object.assign(this.blockStorage.data, blockData || {});
    },
    loadData: function(data){
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },

});
