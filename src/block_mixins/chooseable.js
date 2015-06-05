'use strict';

var $ = require('jquery');
var _ = require('../lodash');
var animate = require('velocity-commonjs/velocity.ui');

var choice_container = [
    '<div class="st-block__choices">',
        '<%= choices %>',
    '</div>'
].join('\n');

var choice_button = [
    '<a class="st-button" data-choice="<%= value %>">',
        '<span class="st-icon"><%= icon %></span>',
        '<span><%= title %></span>',
    '</a>'
].join('\n');

function generateContainer(choices) {
    if (!choices) {
        choices = '';
    }

    return _.template(choice_container)({ choices: choices });
}

function generateChoices(choices) {
    var markup = '';

    choices.forEach(function(choice) {
        choice.icon = choice.icon ? choice.icon : '';

        markup += _.template(choice_button)(choice);
    });

    return markup;
}

function getChoice(choice, selected) {
    var found = {};

    if (choice.options) {
        choice.options.some(function(option) {
            if (option.value === selected) {
                found = Object.assign(found, {
                    name: choice.name,
                    value: option.value,
                    subChoice: option.subChoice
                });
                return true;
            }

            if (option.subChoice) {
                found = getChoice(option.subChoice, selected);
                if (found) { return true; }
            }

            return false;
        });
    }

    if (found) {
        return found;
    }

    return false;
}

var ChoiceBox = function(blockRef, choices) {
    this.blockRef = blockRef;
    this.$elem = $(generateContainer(generateChoices(choices)));

    this.buttons = Array.prototype.slice.call(this.$elem[0].querySelectorAll('a.st-button'));

    this.ready();
};

ChoiceBox.prototype = {
    getUnselected: function(selectedId) {
        return this.buttons.filter(function(button) {
            return button.dataset.choice !== selectedId;
        });
    },

    ready: function() {
        this.$elem.on('click', 'a.st-button', function handleChoice(e) {
            e.preventDefault();

            var selectedId = $(e.currentTarget).data('choice');
            var unselected = this.getUnselected(selectedId);

            animate(e.currentTarget, 'transition.bounceUpOut');
            animate(unselected, 'transition.fadeOut')
                .then(function() {
                    var choice = getChoice(this.blockRef.chooseable, selectedId);

                    this.blockRef.chosen[choice.name] = selectedId;

                    if (choice && choice.subChoice) {
                        var choicesMarkup = generateChoices(choice.subChoice.options);

                        this.blockRef.$inner.children('.st-block__choices').html(choicesMarkup);
                    }
                    else {
                        this.blockRef.$inner.children('.st-block__choices').remove();
                        this.blockRef.onChoose(this.blockRef.chosen);
                    }
                }.bind(this));
        }.bind(this));
    },

    appendTo: function($elem) {
        this.$elem.appendTo($elem);
    }
};


module.exports = {

    mixinName: 'Chooseable',

    initializeChooseable: function() {
        this.chosen = {};

        var choiceBox = new ChoiceBox(this, this.chooseable.options);

        choiceBox.appendTo(this.$inner);
    }
};
