'use strict';

/*
  subhead Block
*/
var Block = require('../block');
var stToHTML = require('../to-html');

function changeTitle(blockData, level) {
    var block = blockData.$el.find('.st-text-block');
    if (block.children().html() !== undefined) {
        var blockContent = block.children().html();
    }
    else {
        blockContent = block.html();
    }

    block.data('content', blockContent);
    if (blockContent.length > 0) {
       block.html('<' + level + '>' + blockContent + '</' + level + '>');
    }
}

module.exports = Block.extend({
    type: 'subhead',
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
            html: '<span>Titre 1</span>',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h1');
            }
        },
        {
            slug: 'h2',
            eventTrigger: 'click',
            html: '<span>Titre 2</span>',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h2');
            }
        },
        {
            slug: 'h3',
            eventTrigger: 'click',
            html: '<span>Titre 3</span>',
            fn: function(e) {
                e.preventDefault();
                changeTitle(this, 'h3');
            }
        }
    ],
     _serializeData: function(){
        var data = {};
        var textBlock = this.getTextBlock().html();
        if (textBlock !== undefined) {
            data.text = this.toMarkdown(textBlock);
        }
        else {
            data.text = '';
            return data;
        }
        return data;
    },
    getTextBlock: function() {
        this.text_block = this.$('.st-text-block');
        return this.text_block;
    },

    setData: function(blockData) {
        Object.assign(this.blockStorage.data, blockData || {});
    },
    loadData: function(data){
        this.getTextBlock().html(stToHTML(data.text, this.type));
    },
    toMarkdown: function(markdown) {
        return markdown.replace(/^(.+)$/mg, '> $1');
    }

});
