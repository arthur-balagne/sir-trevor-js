'use strict';

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
        cellTag = tag_template(
            { tag: $(row).children().first().prop('tagName').toLowerCase() }
        );
    }
    $(row).append($(cellTag, { contenteditable: '' }));
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
    var table = scope;
    var activated = true;

    $('.st-block-control-ui-btn--unmerge-cell').css('pointer-events', 'none');
    table.find('td').each(function() {
        $(this).addClass('mergeable');
        if (undefined === $(this).attr('colspan')){
            $(this).attr('colspan', 1);
        }
    });
    $('tr').children('td').on('click', function(){
        if (activated === true){
            if ($(this).next('td').index() !== -1){
                var nextWidth = parseInt($(this).next('td').attr('colspan'));
                $(this).next('td').remove();
                var colspanValue = parseInt($(this).attr('colspan'));
                $(this).attr('colspan', colspanValue + nextWidth);
                table.find('td').each(function() {
                    $(this).addClass('mergeable');
                    if (undefined === $(this).attr('colspan')){
                        $(this).attr('colspan', 1);
                    }
                });
            }
        }
    });
    // Handle the controls
    $('.st-block-control-ui-btn--merge-cell').on('click', function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        $('.st-block-control-ui-btn--merge-cell').toggleClass('activated');
        if ($('.st-block-control-ui-btn--merge-cell').hasClass('activated')){
            activated = true;
            // Desactivate unmerge button
            $('.st-block-control-ui-btn--unmerge-cell').css('pointer-events', 'none');
            addHelper(ev, scope, instruction);
            table.find('td').each(function() {
                $(this).addClass('mergeable');
                if (undefined === $(this).attr('colspan')){
                    $(this).attr('colspan', 1);
                }
            });
        }
        else {
            activated = false;
            $('.st-block-control-ui-btn--unmerge-cell').css('pointer-events', 'all');
            deleteHelper(ev, scope, instruction);
            table.find('td').each(function() {
                $(this).removeClass('mergeable');
            });
        }

    });
}
function unMergeCellHandler(ev, scope){
    ev.preventDefault();
    var activated = true;
    var table = scope;
    $('.st-block-control-ui-btn--merge-cell').css('pointer-events', 'none');

    table.find('td').each(function(){
        var colspanValue = parseInt($(this).attr('colspan'));
        if (colspanValue > 1){
            $(this).addClass('unmergeable');
        }
    });
    //Perform actions inside the table
    $('tr').children('td').on('click', function(){
        if (activated === true){
            var colspanValue = parseInt($(this).attr('colspan'));
            if (colspanValue > 1){
                $(this).attr('colspan', colspanValue - 1);
                $(this).parent().append('<td colspan="1"></td>');
            }
            table.find('td').each(function() {
                $(this).removeClass('unmergeable');
                $(this).attr('contenteditable', '');
                colspanValue = parseInt($(this).attr('colspan'));
                if (colspanValue > 1){
                    $(this).addClass('unmergeable');
                }
            });
        }
    });
    // Handle the controls
    $('.st-block-control-ui-btn--unmerge-cell').on('click', function(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        $('.st-block-control-ui-btn--unmerge-cell').toggleClass('activated');
        if ($('.st-block-control-ui-btn--unmerge-cell').hasClass('activated')){
            activated = true;
            // Desactivate unmerge button
            $('.st-block-control-ui-btn--merge-cell').css('pointer-events', 'none');
            addHelper(ev, scope, instruction);
            table.find('td').each(function() {
                var colspanValue = parseInt($(this).attr('colspan'));
                if (colspanValue > 1){
                    $(this).addClass('unmergeable');
                }
                if (undefined === $(this).attr('colspan')){
                    $(this).attr('colspan', 1);
                }
            });
        }
        else {
            activated = false;
            $('.st-block-control-ui-btn--merge-cell').css('pointer-events', 'all');
            deleteHelper(ev, scope);
            table.find('td').each(function() {
                $(this).removeClass('unmergeable');
            });
        }

    });
}
function deleteColumnHandler(ev, scope) {
    ev.preventDefault();

    scope.find('tr').each(function() {
        if ($(this).children().length > 1) {
            var colspanValue = parseInt($(this).children().last().attr('colspan'));
            if (colspanValue > 1){
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

    ev.preventDefault();
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
    themeSelector.on('change', function(){
        var themeClass = $(this).find(':selected').val();
        table.removeClass();
        table.addClass(themeClass);
    });
}
function addHelper(ev, block, content) {
  var table = block.find('table');
  table.before(content);
}
function deleteHelper(ev, block) {
  var helper = block.find('.helper');
  helper.remove();
}

module.exports = Block.extend({
    type: 'table',
    title: function() { return 'Table'; },
    icon_name: 'text table',
    scope: function(){
        this.getTextBlock().find('table');
    },
    activable: true,
    controllable: true,
    controls_position: 'bottom',
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
            icon: 'add',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                addColumnHandler(e, block);
            }
        },
        {
            slug: 'del-column',
            icon: 'bin1',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                deleteColumnHandler(e, block);
            }
        },
        {
            slug: 'add-row',
            icon: 'add col',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                addRowHandler(e, block);
            }
        },
        {
            slug: 'del-row',
            icon: 'bin2',
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                deleteRowHandler(e, block);
            }
        },
        {
            slug: 'merge-cell',
            icon: 'add cell',
            activable: true,
            fn: function(e) {
                e.preventDefault();
                var content= '<span class="helper">' + i18n.t('blocks:table:helper-merge') + '</span>';
                var block = this.getTextBlock();
                deleteHelper(e, block, content);
                addHelper(e, block, content);
                mergeCellHandler(e, block);
            }
        },
        {
            slug: 'unmerge-cell',
            icon: 'binopen',
            activable: true,
            fn: function(e) {
                e.preventDefault();
                var block = this.getTextBlock();
                var content = '<span class="helper">' + i18n.t('blocks:table:helper-unmerge') + '</span>';
                deleteHelper(e, block, content);
                addHelper(e, block, content);
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
    loadData: function(data){
        this.getTextBlock().html(data.text, this.type);
    },
    toMarkdown: function(html) {
        function rowToMarkdown(row) {
        var cells = $(row).children(),
            md = cells.map(function() { return $(this).text(); }).get().join(' | ');
        if (cells[0].tagName === 'TH') {
            md += '\n';
            md += cells.map(function() { return '---'; }).get().join(' | ');
        }
        return md;
    }
    var markdown = $(html).find('tr').map(function(){
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
        caption_re = /\[(.*)\]/,
        lastline;
        lastline = lines[lines.length - 1];
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
    },

    isEmpty: function() {
        return _.isEmpty(this.saveAndGetData().text);
    }

});
