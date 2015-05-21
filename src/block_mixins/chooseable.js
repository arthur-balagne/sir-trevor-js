'use strict';

var $ = require('jquery');
var _ = require('../lodash');

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

var generateContainer = function(choices) {
    if (!choices) {
        choices = '';
    }

    return _.template(choice_container)({ choices: choices });
};

var generateChoices = function(choices) {
    var markup = '';

    choices.forEach(function(choice) {
        choice.icon = choice.icon ? choice.icon : '';

        markup += _.template(choice_button)(choice);
    });

    return markup;
};

var getChoice = function(choice, selected) {
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
};

var handleChoice = function(e) {
    e.preventDefault();

    var selected = $(e.currentTarget).data('choice');

    var choice = getChoice(this.chooseable, selected);

    this.chosen[choice.name] = selected;

    if (choice && choice.subChoice) {
        var choicesMarkup = generateChoices(choice.subChoice.options);

        this.$inner.children('.st-block__choices').html(choicesMarkup);
    }
    else {
        this.$inner.children('.st-block__choices').remove();
        this.onChoose(this.chosen);
    }
};

module.exports = {

    mixinName: 'Chooseable',

    initializeChooseable: function() {
        this.chosen = {};

        var choicesMarkup = generateChoices(this.chooseable.options);

        this.$inner.append(generateContainer(choicesMarkup));

        this.$inner.on('click', '.st-block__choices a.st-button', handleChoice.bind(this));
    }
};
