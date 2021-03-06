'use strict';

var $ = require('jquery');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var donationTemplate = require('../../templates/receipts.hbs');

var columns = [
  {
    data: 'contributor',
    orderable: false,
    className: 'all',
    width: '200px',
    render: function(data, type, row, meta) {
      if (data && row.receipt_type !== helpers.globals.EARMARKED_CODE) {
        return tables.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return row.contributor_name;
      }
    }
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop hide-panel'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop hide-panel'},
  tables.currencyColumn({data: 'contribution_receipt_amount', className: 'min-tablet'}),
  tables.dateColumn({data: 'contribution_receipt_date', className: 'min-tablet hide-panel-tablet'}),
  {
    data: 'committee',
    orderable: false,
    className: 'min-desktop hide-panel',
    render: function(data, type, row, meta) {
      if (data) {
        return tables.buildEntityLink(
          data.name,
          helpers.buildAppUrl(['committee', data.committee_id]),
          'committee'
        );
      } else {
        return '';
      }
    }
  },
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
  var filterPanel = new FilterPanel();
  new tables.DataTable($table, {
    title: 'Receipt',
    path: ['schedules', 'schedule_a'],
    panel: filterPanel,
    columns: columns,
    paginator: tables.SeekPaginator,
    order: [[4, 'desc']],
    useFilters: true,
    useExport: true,
    disableExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tables.modalRenderFactory(donationTemplate)
    }
  });
  $widgets.prepend($tagList);
});
