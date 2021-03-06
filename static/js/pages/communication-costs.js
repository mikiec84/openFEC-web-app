'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');
var columns = require('../modules/columns');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var electioneeringTemplate = require('../../templates/communication-costs.hbs');

var columns = [
  {
    data: 'committee_name',
    orderable: false,
    className: 'min-desktop',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(
          data,
          helpers.buildAppUrl(['committee', row.committee_id]),
          'committee'
        );
      } else {
        return '';
      }
    }
  },
  tables.currencyColumn({data: 'transaction_amount', className: 'min-tablet'}),
  columns.supportOpposeColumn,
  {
    data: 'candidate_name',
    orderable: false,
    className: 'min-desktop hide-panel',
    render: function(data, type, row, meta) {
      return tables.buildEntityLink(
        data,
        helpers.buildAppUrl(['candidate', row.candidate_id]),
        'candidate'
      );
    }
  },
  tables.dateColumn({data: 'transaction_date', className: 'min-tablet hide-panel-tablet'}),
  {
    className: 'all u-no-padding',
    width: '20px',
    orderable: false,
    render: function(data, type, row, meta) {
      return tables.MODAL_TRIGGER_HTML;
    }
  }
];

$(document).ready(function() {
  var $table = $('#results');
  var $widgets = $('.js-data-widgets');
  var $tagList = new filterTags.TagList({title: 'All records'}).$body;
  var filterPanel = new FilterPanel('#category-filters');
  new tables.DataTable($table, {
    title: 'Communication costs',
    path: ['communication-costs'],
    panel: filterPanel,
    columns: columns,
    rowCallback: tables.modalRenderRow,
    useExport: true,
    order: [[4, 'desc']],
    useFilters: true,
    callbacks: {
      afterRender: tables.modalRenderFactory(electioneeringTemplate)
    }
  });
  $widgets.prepend($tagList);
});
