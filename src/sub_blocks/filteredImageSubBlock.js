var _ = require('../lodash.js');
var $ = require('jquery');
var evt = require('etudiant-mod-mediator');
var BasicSubBlock = require('./basicSubBlock.js');

var smallTemplate = _.template([
    '<div class="slide-row">',
        '<div class="modal-row-picture row-<%= id %>" data-id="<%= id %>" data-image="<%= imageCustom %>">',
            '<img src="<%= image %>" alt="<%= legend %>" data-action="zoom"><div data-action="zoom" class="pic-container"><div class="pic-inside">Loupe</div></div>',
        '</div>',
        '<div class="modal-row-content row-<%= id %>">',
            '<form>',
                '<select class="sizes"> <%= options %> </select>',
            '</form>',
            '<legend><%= legend %></legend>',
            '<span>© Letudiant</span>',
        '</div>',
        '<div class="modal-row-actions">',
            '<span data-picture="<%= image %>" class="validate row-<%= id %>">Ok</span>',
        '</div>',
    '</div>'
].join('\n'));


var largeTemplate = _.template([
    '<div class="modal-inner-content">',
        '<div class="modal-rows">',
            '<div class="modal-row">',
            '<div class="modal-row-picture" data-image="<%= id %>">',
                    '<img class="preview" src="<%= imageCustom %>" alt="placeholder" >',
                    '<br>',
                    '<p>Format <span class="size"><%= size %></span> </p>',
                    '<p><%= legend %></p>',
                '</div>',
                '<div class="modal-row-content">',
                    '<form>',
                        '<div class="row">',
                            '<label for="legend" class="picture-label">Légende</label>',
                            '<input type="text" class="picture-legend" placeholder="<%= legend %>" name="legend">',
                        '</div>',
                        '<div class="row">',
                            '<label for="link" class="link-label">Url</label>',
                            '<input type="text" class="picture-link" name="link">',
                        '</div>',
                        '<p class="external-link"></p>',
                        '<div class="row select">',
                            '<select class="position" data-row="<%= id %>" >',
                                '<option value="f-right" > A droite du texte</option>',
                                '<option value="f-left" > A gauche du texte</option>',
                            '</select>',
                        '</div>',
                    '</form>',
                '</div>',
            '</div>',
        '</div>',
    '</div>'
    ]
.join('\n'));

var blockTemplate = _.template([
        '<img contenteditable="false" data-object="<%= object %>" class=" picture-<%= id %> <%= align %>" alt="<%= legend %>" data-id="<%= id %>" src="<%= image %>">'
    ].join('\n'));


var filteredImageSubBlock = function() {
    this.media = null;
};

filteredImageSubBlock.prototype = Object.create(BasicSubBlock.prototype);

filteredImageSubBlock.prototype.constructor = BasicSubBlock;
var prototype = {
    renderSmall: function(jsonMedia, size) {
        this.media = jsonMedia;
        this.media.imagePreview = this.resize('90x90');
        if (size !== undefined) {
            this.media.custom = this.resize(size);
        }
        else {
            this.media.custom = this.media.imagePreview;
        }
        var tpl = null;
        tpl = smallTemplate({
            id: jsonMedia.id,
            imageCustom: jsonMedia.custom,
            image: jsonMedia.imagePreview,
            options: jsonMedia.format_ids,
            legend: jsonMedia.legend
        });

        return tpl;
    },
    renderLarge: function() {
        var tpl = null;

        this.media.size = this.media.size;
        tpl = largeTemplate({
            id: this.media.id,
            imageCustom: this.media.custom,
            options: this.media.format_ids,
            size: this.media.size,
            legend: this.media.legend
        });
        return tpl;
    },
    renderBlock: function() {
        var tpl = null;
        var size = this.media.size.split('x')[0];

        tpl = blockTemplate({
            id: this.media.id,
            image: this.resize(this.media.size),
            legend: this.media.legend,
            copyright: this.media.copyright,
            pictureWidth: size,
            align: this.media.align,
            object: encodeURIComponent( JSON.stringify(this.media).replace('\'', '\\') )
        });
        return tpl;
    },
    resize: function(newSize) {
        return this.media.image.replace('original', newSize);
    },
    parseFilters: function(jsonFilters) {
        var formatsObj = {};
        Object.keys(jsonFilters.content).forEach(function(key) {
            var formatsTabObject = jsonFilters.content.formats;
            Object.keys(formatsTabObject).forEach(function(k) {
                var formatObject = formatsTabObject[k];
                var id = formatObject.id;
                var label = formatObject.label;
                formatsObj[id] = label;
            });
        });
        return formatsObj;
    },
    bindHover: function(){
        var buttons = _.template([
        '<div class="st-block__control-ui-elements top" style="min-width: <%= width %>; position:absolute; top:0; left:0; opacity:1; z-index:2">',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--delete-picture st-icon st-block-control-ui-btn--delete-picture<%= id %>" data-id="<%= id %>"  data-icon="bin">',
            '</div>',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--toggle-picture st-icon st-block-control-ui-btn--toggle-picture<%= id %>" data-id="<%= id %>"  data-icon="image-">',
            '</div>',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--update-picture st-icon st-block-control-ui-btn--update-picture<%= id %>" data-id="<%= id %>"  data-icon="+">',
            '</div>',
        '</div>'
        ].join('\n'));
        var media = this.media;
        media.width = this.media.size.split('x')[0];
        var btnTemplates = buttons(media);
        var that = this;
        $('.st-text-block img').on('mouseenter', function(){
            var classes = $(this).attr('class');
            $(this).wrap('<div class="picture-wrapper wrapper ' + classes + '" style="width: ' + that.media.size.split('x')[0] + 'px; height:' + that.media.size.split('x')[1] + 'px>"</div>');
            $('.wrapper').append(btnTemplates).css('position', 'relative');
            $('.st-block__control-ui-elements').append(btnTemplates).css('opacity', '1');
            that.bindRemoveEvent(media.id);
            that.bindTogglEvent(media.id);
            that.bindUpdateEvent(media.id, that);
        })
        .on('mouseleave', function() {
            $(this).unwrap();
            $('.picture-wrapper').remove();
            $('.st-block__control-ui-elements').remove();
        });
    },

    bindRemoveEvent: function(elem) {
        $('.st-block-control-ui-btn--delete-picture' + elem).on('click', function() {
            $(this).parent().parent().parent().remove();
        });
    },
    bindTogglEvent: function(elem) {
        $('.st-block-control-ui-btn--toggle-picture' + elem).on('click', function() {
            $(this).parent().parent().parent().toggleClass('f-left').toggleClass('f-right');
            $(this).parent().parent().parent().find('img').toggleClass('f-left').toggleClass('f-right');
        });
    },
    bindUpdateEvent: function(elem, $block) {
        $('.st-block-control-ui-btn--update-picture' + elem).on('click', function() {
             evt.publish('modal-gallery-step-2', $block);
        });
    }

};

Object.assign(filteredImageSubBlock.prototype, prototype);

module.exports = filteredImageSubBlock;
