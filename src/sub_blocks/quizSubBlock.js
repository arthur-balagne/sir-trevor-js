var _ = require('../lodash.js');

var BasicSubBlock = require('./basicSubBlock.js');

var quizTemplate = _.template([
    '<div data-sub-block-id="<%= id %>" class="st-sub-block__quiz">',
        '<img src="<%= image %>" />',
        '<span><%= title %></span>',
        '<span><%= description %></span>',
    '</div>'
].join('\n'));

var QuizSubBlock = function() {
    BasicSubBlock.apply(this, arguments);

    this.template = quizTemplate;
};

QuizSubBlock.prototype = Object.create(BasicSubBlock.prototype);

QuizSubBlock.prototype.constructor = BasicSubBlock;

var prototype = {

};

Object.assign(QuizSubBlock.prototype, prototype);

module.exports = QuizSubBlock;
