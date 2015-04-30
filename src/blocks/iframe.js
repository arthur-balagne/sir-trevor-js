'use strict';

var $ = require('jquery');
var Block = require('../block');

var getTemplate = function(params) {
    var template = '';

    template += '<div class="st-block__iframe">';
    template += '<iframe';

    template += params.src ? ' src="' + params.src + '"' : '';
    template += params.scrolling ? ' scrolling="' + params.scrolling + '"' : '';
    template += params.height ? ' height="' + params.height + 'px"' : '';
    template += params.visible === false ? ' style="display:none"' : '';

    template += '></iframe>';
    template += '</div>';

    return template;
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
        var template = getTemplate({
            height: 300,
            scrolling: 'no',
            visible: false
        });

        this.$inner.prepend(template);
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
           this.$iframe.attr('scrolling', data.scrolling);
        }
    },

    onContentPasted: function(event) {
        this.setAndLoadData({
            src: $(event.target).val()
        });

        this.showControls();
    }
});
