var _ = require('../lodash.js');
var BasicSubBlock = require('./basicSubBlock.js');

var smallTemplate = _.template([
    '<div class="slide-row">',
        '<div class="modal-row-picture row-<%= id %>" data-image="<%= image %>">',
            '<img src="<%= image %>" alt="<%= legend %>" data-action="zoom"><div data-action="zoom" class="pic-container"><div class="pic-inside">Loupe</div></div>',
        '</div>',
        '<div class="modal-row-content row-<%= id %>">',
            '<form>',
                '<select class="sizes"> <%= options %> </select>',
            '</form>',
            '<legend>Légende : Et qui sapelorio. Quezac</legend><br>',
            '<span>© Letudiant</span>',
        '</div>',
        '<div class="modal-row-actions">',
            '<span data-picture="http://bo.letudiant.fr/uploads/mediatheque/ETU_ETU/8/9/486089-chat-bac-hg-original.jpg" class="validate row-<%= id %>">Ok</span>',
        '</div>',
    '</div>'
].join('\n'));

var largeTemplate = _.template([
    '<div class="modal-inner-content">',
        '<div class="modal-rows">',
            '<div class="modal-row">',
            '<div class="modal-row-picture">',
                    '<img class="preview" src="http://placehold.it/80x80" alt="placeholder" >',
                    '<br>',
                    '<p>Format <span class="size">45x45</span> </p>',
                    '<p>&copy L\'Etudiant</p>',
                '</div>',
                '<div class="modal-row-content">',
                    '<form>',
                        '<div class="row">',
                            '<label for="legend" class="picture-label">Légende</label>',
                            '<input type="text" class="picture-legend" name="legend">',
                        '</div>',
                        '<div class="row">',
                            '<label for="link" class="link-label">Url</label>',
                            '<input type="text" class="picture-link" name="link">',
                        '</div>',
                        '<p class="external-link"></p>',
                        '<div class="row select">',
                            '<select class="position">',
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

var optionsTemplate = _.template('<option data-picture="<%= image %>" value="<%= format %>"><%= format %></option>');



var filteredImageSubBlock = function() {
    this.jsonMedia = null;
};

filteredImageSubBlock.prototype = Object.create(BasicSubBlock.prototype);

filteredImageSubBlock.prototype.constructor = BasicSubBlock;
var prototype = {
    renderSmall: function(jsonMedia) {
        this.jsonMedia = jsonMedia;
        var tpl = null;
        tpl = smallTemplate({
            id: jsonMedia.id,
            image: jsonMedia.image,
            options: jsonMedia.format_ids,
            legend: jsonMedia.legend
        });
        return tpl;
    },
    renderLarge: function() {
        var tpl = null;
        tpl = largeTemplate({
            id: this.jsonMedia .id,
            image: this.jsonMedia .image,
            options: this.jsonMedia .format_ids,
            legend: this.jsonMedia .legend
        });
        return tpl;
    },


};

Object.assign(filteredImageSubBlock.prototype, prototype);

module.exports = filteredImageSubBlock;







