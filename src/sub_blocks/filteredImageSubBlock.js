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
    '</div>']
.join('\n'));

var blockTemplate = _.template([
    '<div class="framed-picture framed-picture-<%= id %>" contenteditable="false" data-object=\'<%= object %>\' style="display:inline-block; position:relative; width:initial; position:relative" id="<%= id %> picture-<%= id %>">',
        '<div class="st-block__control-ui-elements top" style="position:absolute; top:0; left:0;">',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--delete-picture st-icon st-block-control-ui-btn--delete-picture<%= id %>" data-id="<%= id %>"  data-icon="bin">',
            '</div>',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--toggle-picture st-icon st-block-control-ui-btn--toggle-picture<%= id %>" data-id="<%= id %>"  data-icon="image-">',
            '</div>',
            '<div class="st-block-control-ui-btn st-icon st-block-control-ui-btn--update-picture st-icon st-block-control-ui-btn--update-picture<%= id %>" data-id="<%= id %>"  data-icon="+">',
            '</div>',
        '</div>',
        '<img alt="<%= legend %>" data-id="<%= id %>" src="<%= image %>">',
        '<legend style="width:<%= pictureWidth %>px">',
        '<%= legend %> ',
        '<%= copyright %></legend>',
    '</div>'
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
        if(size !== undefined) {
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
            image: this.media.custom,
            legend: this.media.legend,
            copyright: this.media.copyright,
            pictureWidth: size,
            object: JSON.stringify(this.media).replace('\'', '\\')
        });
        return tpl;
    },
    resize: function(newSize) {
        return this.media.image.replace('original', newSize);
    },
    parseFilters: function(jsonFilters) {
        var formatsObj = {};
        Object.keys(jsonFilters.content).forEach(function(key, value) {
            var formatsTabObject = jsonFilters.content.formats;
            Object.keys(formatsTabObject).forEach(function(k, val) {
                var formatObject = formatsTabObject[k];
                var id = formatObject.id;
                var label = formatObject.label;
                formatsObj[id] = label;
            });
        });
        return formatsObj;
    },
    bindRemoveEvent: function($block, elem) {
        $('.content .st-block-control-ui-btn--delete-picture' + elem).on('click', function() {
            $(this).parent().parent().remove();
        });
    },
    bindTogglEvent: function($block, elem) {
        $('.content .st-block-control-ui-btn--toggle-picture' + elem).on('click', function() {
            $(this).parent().parent().toggleClass('f-left').toggleClass('f-right');
        });
    },
    bindUpdateEvent: function($block, elem) {
        $('.content .st-block-control-ui-btn--update-picture' + elem).on('click', function() {
             evt.publish('modal-gallery-step-2', $block);
        });
    }

};

Object.assign(filteredImageSubBlock.prototype, prototype);

module.exports = filteredImageSubBlock;







