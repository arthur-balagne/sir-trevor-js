'use strict';

var $ = require('jquery');

var utils = require('../utils');

module.exports = {
    mixinName: 'Controllable',

    initializeControllable: function() {
        utils.log('Adding controllable to block ' + this.blockID);

        this.$control_ui = $('<div>', {
            'class': 'st-block__control-ui'
        });

        // Alternative position of control-ui
        if (this.controls_position) {
            this.$control_ui.addClass(this.controls_position);
        }

        if (this.controls_visible === false) {
            this.hideControls();
        }

        // Loop on controls to add them to the toolbar
        this.controls.forEach(function(control) {
            this.addUiControl(control);
        }, this);

        this.$inner.append(this.$control_ui);
    },

    hideControls: function() {
        this.$control_ui.addClass('hidden');
    },

    showControls: function() {
        this.$control_ui.removeClass('hidden');
    },


    addUiControl: function(control) {
        // The UI Control must be a simple icon or a custom HTML
        if (!control.icon && !control.html) {
            console.error('UIcontrol "' + control.slug + '": You must choose an icon or html for your control.');
            return false;
        }


        var uiControl = this.getControlTemplate(control);

        // By default, the trigger is a click event
        var eventTrigger = control.eventTrigger ? control.eventTrigger : 'click';
        this.$control_ui.append(uiControl);
        this.$control_ui.on(eventTrigger, '.st-block-control-ui-btn--' + control.slug, control.fn.bind(this));
        this.$control_ui.on(eventTrigger, '.st-block-control-ui-btn--' + control.slug, function() {
            if (control.activable === true) {
                $('.st-block-control-ui-btn--' + control.slug).toggleClass('activated');
            }
        });

    },

    getControlTemplate: function(control) {
        var tag = $('<div class="st-block-control-ui-btn"></div>');

        if (control.icon) {
            tag.attr('data-icon', control.icon);

            tag.addClass('st-icon');
            tag.addClass('st-block-control-ui-btn--' + control.slug);
        }
        else if (control.html) {
            tag.addClass('st-block-control-ui-extensible');

            var innerHTML = $(control.html);

            // For custom HTML we want to bind the event to the append element
            innerHTML.addClass('st-block-control-ui-btn--' + control.slug);

            tag.append(innerHTML);
        }

        return tag;
    }
};
