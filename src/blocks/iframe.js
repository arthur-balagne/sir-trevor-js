'use strict';

var $ = require('jquery');
var Block = require('../block');

function changeScroll(e) {
    console.log('changeScroll');
};

module.exports = Block.extend({
    title: 'iFrame',
    type: 'iframe',
    icon_name: 'iframe',

    pastable: true,
    paste_options: {
        html: '<input type="text" placeholder="' + i18n.t('blocks:iframe:placeholder') + '" class="st-block__paste-input st-paste-block">'
    },

    controllable: true,
    controls_position: 'top',
    controls_visible: false,
    controls: [
        {
            slug: 'height',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                this.setAndLoadData({
                    height: e.target.value
                });
            },
            html: '<input type="number" placeholder="Hauteur" />'
        },
        {
            slug: 'scroll-toggle',
            eventTrigger: 'change',
            fn: function(e) {
                e.preventDefault();

                this.setAndLoadData({
                    scrolling: e.target.value
                });
            },
            html: '<select><option value="no">Sans scroll</option><option value="yes">Avec scroll</option></select>'
        }
    ],

    onBlockRender: function() {
        this.$inner.prepend('<div class="st-block__iframe"><iframe scrolling="no" style="display:none"></iframe></div>');
        this.$iframe = this.$inner.find('iframe');
    },

    loadData: function(data) {
        if (data.src) {
            this.$iframe.attr('src', data.src);
            this.$iframe.show();
        }

        if (data.height) {
            this.$iframe.attr('height', data.height);
        }

        if (data.scrolling) {
            this.$iframe.attr('scrolling', data.scrolling); // WIP
            // this.$iframe[0].scrolling = data.scrolling;
        }
    },

    onContentPasted: function(event) {
        this.setAndLoadData({
            src: $(event.target).val()
        });

        this.showControls();
    }
});
