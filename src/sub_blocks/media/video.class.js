var videojs = require('video.js');
var BasicMediaSubBlock = require('./basic-media.class.js');

var smallTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-small st-sub-block__<%= type %>">',
        '<figure class="st-sub-block-image">',
            '<img src="<%= thumbnail %>" />',
        '</figure>',
        '<h3><%= legend %></h3>',
        '<a class="st-sub-block-link st-icon" href="<%= file %>" target="_blank">link</a>',
    '</div>'
].join('\n');

var outerTemplate = [
    '<div data-sub-block-id="<%= id %>" class="st-sub-block st-sub-block-large st-sub-block__<%= type %>">',
        '<div class="st-sub-block-video-wrapper">',
            '<video class="video-js vjs-default-skin" src="<%= file %>" poster="<%= thumbnail %>" /></video>',
        '</div>',
        '<%= editArea %>',
        '<%= footer %>',
    '</div>'
].join('\n');

var VideoSubBlock = function() {
    this.type = 'video';
    this.smallTemplate = smallTemplate;
    this.outerTemplate = outerTemplate;

    BasicMediaSubBlock.apply(this, arguments);
};

VideoSubBlock.prototype = Object.create(BasicMediaSubBlock.prototype);

VideoSubBlock.prototype.constructor = BasicMediaSubBlock;

var prototype = {
    ready: function() {
        var $video = this.$elem.find('video');

        videojs($video[0], {
            autoplay: false,
            controls: true
        }, function() {
            $video.parent().css('height', '100%')
                           .css('width', '100%');
        });
    },

    renderLarge: function() {
        return BasicMediaSubBlock.prototype.renderLarge.call(this, {
            thumbnail: this.contents.thumbnail || ''
        });
    }
};

Object.assign(VideoSubBlock.prototype, prototype);

module.exports = VideoSubBlock;
