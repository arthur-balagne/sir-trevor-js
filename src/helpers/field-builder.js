var _ = require('../lodash.js');

var renderSelect = function(field) {
    field.label = field.label || '';
    field.placeholder = field.placeholder || '';
    field.multiple = field.multiple ? 'multiple="multiple"' : '';

    var selectTemplate = [
        '<div class="st-block-field st-block-field-select">',
            '<label for="<%= name %>">',
                '<%= label %>',
            '</label>',
            '<select <%= multiple %> id="<%= name %>" name="<%= name %>">',
                '<option value="" selected disabled><%= placeholder %></option>',
                '<% _.forEach(options, function(option) { %>',
                    '<option value="<%= option.value %>"><%= option.label %></option>',
                '<% }); %>',
            '</select>',
        '</div>'
    ].join('\n');

    return _.template(selectTemplate, field, { imports: { '_': _ } });
};

var renderStandardField = function(field) {
    field.label = field.label || '';
    field.placeholder = field.placeholder || '';
    field.value = field.value || '';

    var fieldTemplate = [
        '<div class="st-block-field st-block-field-standard">',
            '<label for="<%= name %>">',
                '<%= label %>',
            '</label>',
            '<input type="<%= type %>" name="<%= name %>" value="<%= value %>" placeholder="<%= placeholder %>"/>',
        '</div>'
    ].join('\n');

    return _.template(fieldTemplate, {
        name: field.name,
        type: field.type,
        label: field.label,
        placeholder: field.placeholder,
        value: field.value
    });
};

var renderField = function(field) {
    var fieldMarkup;

    switch (field.type) {
        case 'select':
            fieldMarkup = renderSelect(field);
            break;
        default:
            fieldMarkup = renderStandardField(field);
            break;
    }

    return fieldMarkup;
};

module.exports = renderField;
