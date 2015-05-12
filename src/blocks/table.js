/*
  Block Table
*/

var _ = require('../lodash');
var $ = require('jquery');
var Block = require('../block');
var template = '' +
  '<table>' +
    '<caption contenteditable></caption>' +
    '<thead>' +
      '<tr>' +
        '<th contenteditable></th>' +
        '<th contenteditable></th>' +
      '</tr>' +
    '</thead>' +
    '<tbody>' +
      '<tr>' +
        '<td contenteditable></td>' +
        '<td contenteditable></td>' +
      '</tr>' +
    '</tbody>' +
  '</table>';
var instruction = '<span class="helper">' + i18n.t('blocks:table:helper-merge') + '</span>';

function addCell(row, cellTag) {
    var tag_template = _.template('<<%= tag %>>');

    if (cellTag === undefined) {
        cellTag = tag_template({
            tag: $(row).children().first().prop('tagName').toLowerCase()
        });
    }

    $(row).append($(cellTag, {
        contenteditable: ''
    }));
}

function addColumnHandler(ev, scope) {
    ev.preventDefault();
    scope.find('tr').each(function() {
        addCell(this);
    });
    scope.find('td').each(function() {
        if (undefined === $(this).attr('colspan')){
            $(this).attr('colspan', 1);
        }
    });
}

function mergeCellHandler(ev, scope) {
    ev.preventDefault();
    var table = scope.find('table');
    var activated = !$('.st-block-control-ui-btn--merge').hasClass('activated');

    table.find('td, th').each(function(){
        var colspanValue = parseInt($(this).attr('colspan'));

        if (isNaN(colspanValue)){
            $(this).attr('colspan', 1);
        }
    });

    if (activated === true) {
        table.find('td , th').addClass('mergeable');
        table.before('<span class="helper">' + i18n.t('blocks:table:helper-merge') + '</span>');
        table.on('click', 'td, th', function(e) {
            e.preventDefault();
            if ($(this).next('td, th').index() !== -1) {
                var nextWidth = parseInt($(this).next('td, th').attr('colspan'));

                var colspanValue = parseInt($(this).attr('colspan'));

                $(this).next('td, th').remove();

                $(this).attr('colspan', colspanValue + nextWidth);
            }
            table.find('td, th').addClass('mergeable');
        });
    }
    else {
        $('.helper').remove();
        table.off('click', 'td, th');
        table.find('td, th').removeClass('mergeable');
    }

    $('.st-block-control-ui-btn').toggleClass('disabled');
    $('.st-block-control-ui-btn--merge').removeClass('disabled');
}

function unMergeCellHandler(ev, scope) {
    ev.preventDefault();
    var activated = !$('.st-block-control-ui-btn--unmerge').hasClass('activated');
    var table = scope;
    table.before('<span class="helper">' + i18n.t('blocks:table:helper-unmerge') + '</span>');

    if (activated === true){
        table.find('td, th').each(function(){
            var colspanValue = parseInt($(this).attr('colspan'));

            if (colspanValue > 1) {
                $(this).addClass('unmergeable');
            }
        });
        table.on('click', 'td', function() {
            var colspanValue = parseInt($(this).attr('colspan'));

            if (colspanValue > 1) {
                $(this).attr('colspan', colspanValue - 1);
                $(this).parent().append('<td colspan="1"></td>');
            }
            table.find('td').each(function(){
            colspanValue = parseInt($(this).attr('colspan'));

            if (colspanValue > 1) {
                $(this).attr('contenteditable', '');
                $(this).addClass('unmergeable');
            }
            else {
                $(this).removeClass('unmergeable');
            }

            });

        });
        table.on('click', 'th', function() {
            var colspanValue = parseInt($(this).attr('colspan'));

            if (colspanValue > 1) {
                $(this).attr('colspan', colspanValue - 1);
                $(this).parent().append('<th colspan="1"></th>');
            }

            table.find('th').each(function(){
                colspanValue = parseInt($(this).attr('colspan'));

                if (colspanValue > 1) {
                    $(this).attr('contenteditable', '');
                    $(this).addClass('unmergeable');
                }
                else {
                    $(this).removeClass('unmergeable');
                }

            });
        });
    }
    else {
        $('.helper').remove();
        table.find('td, th').removeClass('unmergeable');
    }

    $('.st-block-control-ui-btn').toggleClass('disabled');
    $('.st-block-control-ui-btn--unmerge').removeClass('disabled');
}

function deleteColumnHandler(ev, scope) {
    ev.preventDefault();
    scope.find('tr').each(function() {
        if ($(this).children().length > 1) {
            var colspanValue = parseInt($(this).children().last().attr('colspan'));
            if (colspanValue > 1) {
                $(this).children().last().attr('colspan', colspanValue - 1);
            }
            else {
                $(this).children().last().remove();
            }
        }
    });
}

function addRowHandler(ev, scope) {
    var row = $('<tr>');

    scope.find('th').each(function() {
        addCell(row, '<td>');
    });

    scope.find('tbody').append(row);
    //Really important allow us to merge
    scope.find('td').each(function() {
        if (undefined === $(this).attr('colspan')){
            $(this).attr('colspan', 1);
        }
    });
}

function deleteRowHandler(ev, block) {
    ev.preventDefault();

    if (block.find('tbody tr').length > 1) {
        block.find('tbody tr:last').remove();
    }
}

function changeTheme(ev, block) {
    var table = block.find('table');
    var themeSelector = $('.theme-selector select');

    themeSelector.on('change', function() {
        var themeClass = $(this).find(':selected').val();
        table.removeClass();
        table.addClass(themeClass);
    });
}

module.exports = Block.extend({
    type: 'table',
    title: function() {
        return 'Table';
    },
    icon_name: 'table',
    scope: function() {
        this.getTextBlock().find('table');
    },
    activable: true,
    controllable: true,
    controls_position: 'top',
    controls_visible: true,
    controls: [
        {
            slug: 'theme-toggle',
            eventTrigger: 'click',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                changeTheme(e, block);
            },
            html: '<div class="theme-selector"><select><option class="theme edt-theme-default"  value="edt-theme-default">' + i18n.t('blocks:table:default') + '</option> <option class="theme edt-theme-blue" value="edt-theme-blue">' + i18n.t('blocks:table:blue-theme') + '</option><option class="theme edt-theme-red" value="edt-theme-red">' + i18n.t('blocks:table:red-theme') + '</option></select></div>'
        },
        {
            slug: 'add-column',
            icon: 'addcol',
            fn: function(e) {
                e.preventDefault();

                var block = this.getTextBlock();
                addColumnHandler(e, block);
            }
        },
        {
            slug: 'del-column',
            icon: 'delcol',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                deleteColumnHandler(e, block);
            }
        },
        {
            slug: 'add-row',
            icon: 'addrow',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                addRowHandler(e, block);
            }
        },
        {
            slug: 'del-row',
            icon: 'delrow',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                deleteRowHandler(e, block);
            }
        },
        {
            slug: 'merge',
            icon: 'merge',
            activable: true,
            fn: function(e) {
                e.preventDefault();
                //var content = '<span class="helper">' + i18n.t('blocks:table:helper-merge') + '</span>';
                var block = this.getTextBlock();
                //deleteHelper(e, block, content);
                //addHelper(e, block, content);
                mergeCellHandler(e, block);
            }
        },
        {
            slug: 'unmerge',
            icon: 'unmerge',
            activable: true,
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                //var content = '<span class="helper">' + i18n.t('blocks:table:helper-unmerge') + '</span>';
                //deleteHelper(e, block, content);
                //addHelper(e, block, content);
                unMergeCellHandler(e, block);
            }
        }

    ],

    editorHTML: function() {
        var editor_template = '<div class="st-text-block">' + template + '</div>';

        return _.template(editor_template, this);
    },

    onBlockRender: function() {
        this.$table = this.getTextBlock().find('table');
    },

    loadData: function(data) {
        this.getTextBlock().html(data.text, this.type);
    },

    toMarkdown: function(html) {
        function rowToMarkdown(row) {
            var cells = $(row).children(),
                md = cells.map(function() {
                    return $(this).text();
                }).get().join(' | ');

            if (cells[0].tagName === 'TH') {
                md += '\n';
                md += cells.map(function() {
                    return '---';
                }).get().join(' | ');
            }

            return md;
        }

        var markdown = $(html).find('tr').map(function() {
            return rowToMarkdown(this);
        }).get().join('\n');

        if ($(html).find('caption').text() !== '') {
            markdown += '\n[' + $(html).find('caption').text() + ']';
        }

        return markdown;
    },
    toHTML: function(markdown) {
        var html = $('<table><caption contenteditable></caption><thead><tr></tr></thead><tbody></tbody></table>'),
            lines = markdown.split('\n'),
            caption_re = /\[(.*)\]/;

        var lastline = lines[lines.length - 1];

        if (lastline.match(caption_re)) {
            html.find('caption').text(lastline.match(caption_re)[1]);
            lines = lines.slice(0, lines.length - 1);
        }

        // Add header row
        _.each(lines[0].split(' | '), function(content) {
            html.find('thead tr').append('<th contenteditable>' + content + '</th>');
        });

        // Add remaining rows
        _.each(lines.slice(2, lines.length), function(line) {
            var row = $('<tr>');
            _.each(line.split(' | '), function(content) {
                row.append('<td contenteditable>' + content + '</th>');
            });
            html.find('tbody').append(row);
        });

        return html[0].outerHTML;
    }
});
