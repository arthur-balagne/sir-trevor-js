var _ = require('../../lodash.js');

var BasicJcsSubBlock = require('./basicJcsSubBlock.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<h3><%= title %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>',
        '<span class="st-sub-block-site"><%= site %></span>',
    '</div>'
].join('\n');

var largeTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
        '<% if (choices && choices.length > 0) { %>',
        '<div class="st-sub-block-sondage">',
                '<% _.forEach(choices, function(choice) { %>',
                    '<div class="st-sub-block-sondage-choice">',
                        '<span><%= choice.label %></span>',
                        '<meter min="0" max="100" value="<%= choice.percentage %>">',
                            '<div class="meter">',
                                '<span style="width: <%= choice.percentage %>%;"></span>',
                            '</div>',
                        '</meter>',
                    '</div>',
                '<% }); %>',
            '</div>',
        '<% } %>',
        '<h3><%= title %></h3>',
        '<span><%= description %></span>',
        '<a class="st-sub-block-link st-icon" href="<%= url %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var sondageJcsSubBlock = function() {
    this.type = 'sondage';

    BasicJcsSubBlock.apply(this, arguments);

    this.smallTemplate = smallTemplate;
    this.largeTemplate = largeTemplate;
};

sondageJcsSubBlock.prototype = Object.create(BasicJcsSubBlock.prototype);

sondageJcsSubBlock.prototype.constructor = BasicJcsSubBlock;

var prototype = {
    renderLarge: function() {
        return _.template(this.largeTemplate, this.contents, { imports: { '_': _ } });
    }
};

Object.assign(sondageJcsSubBlock.prototype, prototype);

module.exports = sondageJcsSubBlock;
