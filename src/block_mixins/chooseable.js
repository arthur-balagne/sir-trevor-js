'use strict';

var $ = require('jquery');
var _ = require('../lodash');

var choice_container = [
    '<div class="st-block__choices">',
        '<%= choices %>',
    '</div>'
].join('\n');

var choice_button = [
    '<a class="st-button" data-choice="<%= name %>">',
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
        markup += _.template(choice_button)(choice);
    });

    return markup;
};

var getChoice = function(choices, choiceId) {
    var found;

    if (choices) {
        choices.some(function(choice) {
            if (choice.name === choiceId) {
                found = choice;
                return true;
            }

            if (choice.choices) {
                found = getChoice(choice.choices, choiceId);
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

    var choiceId = $(e.currentTarget).data('choice');

    this.chosen[choiceId] = true;

    var choice = getChoice(this.choices, choiceId);

    if (choice && choice.choices) {
        var choicesMarkup = generateChoices(choice.choices);

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
        var choicesMarkup = generateChoices(this.choices);

        this.chosen = {};

        this.$inner.append(generateContainer(choicesMarkup));
        this.$inner.on('click', '.st-block__choices a.st-button', handleChoice.bind(this));
    }
};
