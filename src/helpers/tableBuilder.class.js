var _            = require('../lodash');
var $            = require('jquery');
var eventablejs  = require('eventablejs');


var tableTemplate = '<table class="chart-table"><%= content %> </table>';

var rowTemplate = '<tr><%= th %><%= cells %></tr>';
var cellTemplate = '<td data-name="<%= name %>" data-type="cell" data-column="<%= column %>" contenteditable><%= value %></td>';

var barParams = [
    {
        name: 'column-1',
        column: 'category1',
        value: 8
    },
    {
        name: 'column-1',
        column: 'category2',
        value: 9
    },

    {
        name: 'column-2',
        column: 'category1',
        value: 10
    },
    {
        name: 'column-2',
        column: 'category2',
        value: 3
    }
];

var pieParams = [
    {
        name: 'column-1',
        column: 'category1',
        value: 8
    },
    {
        name: 'column-2',
        column: 'category1',
        value: 9
    }
];

function createTableCell(element){
    return _.template(cellTemplate, element);
}

function buildTable(params, tableBuilder){
    var columnsArray = [];

    params.forEach(function(value){
        columnsArray.push(value.column);
    });

    var theads = '';
    for (var i = 1; i <= tableBuilder.columnsCount; i++) {
        theads += '<th>Colone ' + i + '<span class="remove-col" data-column="column-' + i + '">Col -</span></th>';
    }

    var unique = columnsArray.reduce(function(a, b) {
        if (a.indexOf(b) < 0) {
            a.push(b);
        }
        return a;
    }, []);

    var row = '<tr><th class="row-title"></th>' + theads + '</tr>';

    unique.forEach(function(uniqueName, key){
        var tds = '';

        params.forEach(function(paramElement) {

            if (uniqueName === paramElement.column) {

                tds += createTableCell(paramElement);
            }
        });

        row += _.template(rowTemplate, {
            cells: tds,
            th: '<th class="row-title">categorie ' + (key + 1) + ' <span class="remove-row" data-name="category' + (key + 1) + '" >row -</span></th>'
        });

    });

    var table = _.template(tableTemplate, {
        content: row
    });
    return table;
}

function addControls(tableBuilder) {
    if (tableBuilder.columnModifiable === true) {
        var addCol = '<span class="control add-col"> +col </span>';
    }
    else {
        addCol = ' ';
    }

    if (tableBuilder.rowModifiable === true) {
        var addRow = '<span class="control add-row"> +row </span>';
    }
    else {
        addRow = ' ';
    }


    var controls = _.template('<div class="table-controls"><%= row %><%= cell %></div>', {
        row: addRow,
        cell: addCol
    });

    tableBuilder.$elem.append(controls);
}

function addControlsListenners(tableBuilder) {
    tableBuilder.$elem.find('.add-col').on('click', function(ev) {
        ev.stopPropagation();
        tableBuilder.addColumn();
    });

    tableBuilder.$elem.find('.add-row').on('click', function(ev) {
        ev.stopPropagation();

        tableBuilder.addRow();
    });

    tableBuilder.$elem.find('.remove-col').on('click', function(ev) {
        ev.stopPropagation();

        var dataName = $(this).data('column');
        tableBuilder.deleteColumn(dataName); // column-1
    });

    tableBuilder.$elem.find('.remove-row').on('click', function(ev) {
        ev.stopPropagation();

        var column = $(this).data('name');
        tableBuilder.deleteRow(column); // category1
    });

}
function removeControlsListenners(tableBuilder) {
    tableBuilder.$elem.find('.add-col').off('click');
    tableBuilder.$elem.find('.add-row').off('click');

    tableBuilder.$elem.find('.remove-col').off('click');
    tableBuilder.$elem.find('.remove-row').off('click');


}

function stopWatchChanges(tableBuilder) {
    tableBuilder.$scope.off('keyup', 'td');
}


function watchChanges(tableBuilder) {
    tableBuilder.$scope.on('keyup', 'td', function(ev) {
        ev.preventDefault();

        tableBuilder.data = tableBuilder.getDatas();

        tableBuilder.trigger('table:updated', this.data);
    });
}

var TableBuilder = function(params) {
    this.init(params);
};

var prototype = {
    init: function(params) {
        this.chartType = params.chartType;
        this.data = params.data;
        this.$elem = params.$elem;
        this.block = params.block;

        this.prepare();

        this.render();

    },

    validate: function() {
        var valid = true;
        return valid;
    },

    getDatas: function() {
        var params = [];
        var $catArray = this.$scope.find('[data-type="cell"]');
        $.each($catArray, function(){
            var obj = {
                'name': $(this).data('name'),
                'column': $(this).data('column'),
                'value': parseInt($(this).html())
            };
            params.push(obj);
        });

        return params;
    },

    addColumn: function() {
        var datas = [];

        for (var i = 1; i <= this.categoriesCount; i++) {

            datas.push({
                name: 'column-' + parseInt(this.columnsCount + 1),
                column: 'category' + i,
                value: 0
            });
        }

        this.columnsCount++;

        if (this.data.length === 0) {
            this.data = this.getDatas();
        }

        this.data = this.data.concat(datas);
        this.render();
        stopWatchChanges(this);
        watchChanges(this);

    },
    addRow: function() {
        var datas = [];

        for (var i = 1; i <= this.columnsCount; i++) {
            datas.push({
                name: 'column-' + i,
                column: 'category' + (this.categoriesCount + 1),
                value: 0
            });
        }

        this.categoriesCount++;

        if (this.data.length === 0) {
            this.data = this.getDatas();
        }

        this.data = this.data.concat(datas);

        this.render();
        stopWatchChanges(this);
        watchChanges(this);

    },

    deleteRow: function(column) {
        if (this.data.length === 0) {
            this.data = this.getDatas();
        }

        var colId = column;
        this.data = this.data.filter(function(elem) {
            return elem.column !== colId;
        });

        this.categoriesCount--;
        this.render();
        this.trigger('table:updated', this.data);
        stopWatchChanges(this);
        watchChanges(this);

    },

    deleteColumn: function(dataName) {
        if (this.data.length === 0) {
            this.data = this.getDatas();
        }
        this.data = this.data.filter(function(elem) {
            return elem.name !== dataName;
        });

        this.columnsCount--;
        this.trigger('table:updated', this.data);
        this.render();
        stopWatchChanges(this);
        watchChanges(this);

    },
    prepare: function() {
        var tableHtml;
        if (this.chartType === 'bar') {
            if (this.data.length === 0) {

                this.columnsCount = 2;
                this.categoriesCount = 2;

                tableHtml = buildTable(barParams, this);

            }
            else {
                tableHtml = buildTable(this.data, this);
            }

            this.columnModifiable = true;
            this.rowModifiable = true;
        }

        if (this.chartType === 'pie') {
            if (this.data.length === 0) {

                this.columnsCount = 2;
                this.categoriesCount = 1;

                tableHtml = buildTable(pieParams, this);
            }
            else {
                tableHtml = buildTable(this.data, this);
            }

            this.columnModifiable = true;
            this.rowModifiable = false;
        }

        if (this.$elem.length !== 0) {
            this.$elem.empty();
        }

        addControls(this);

        return tableHtml;
    },

    render: function() {
        var tableHtml = this.prepare();

        this.$elem.append(tableHtml);
        this.$scope = this.$elem.find('.chart-table');
        addControlsListenners(this);
        watchChanges(this);
    },

    destroy: function(){
        removeControlsListenners(this);
    }
};

TableBuilder.prototype = Object.assign({}, prototype, eventablejs);

module.exports = TableBuilder;
