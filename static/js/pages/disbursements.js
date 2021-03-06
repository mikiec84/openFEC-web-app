'use strict';

/* global document */

var $ = require('jquery');

var tables = require('../modules/tables');
var helpers = require('../modules/helpers');

var FilterPanel = require('fec-style/js/filter-panel').FilterPanel;
var filterTags = require('fec-style/js/filter-tags');

var disbursementTemplate = require('../../templates/disbursements.hbs');

var columns = [
  {
    data: 'recipient_name',
    orderable: false,
    className: 'all',
    width: '200px',
    render: function(data, type, row, meta) {
      var committee = row.recipient_committee;
      if (committee) {
        return tables.buildEntityLink(
          committee.name,
          helpers.buildAppUrl(['committee', committee.committee_id]),
          'committee'
        );
      } else {
        return data;
      }
    }
  },
  {data: 'recipient_state', width: '80px', orderable: false, className: 'min-desktop hide-panel'},
  tables.currencyColumn({data: 'disbursement_amount', className: 'min-tablet hide-panel-tablet'}),
  tables.dateColumn({data: 'disbursement_date', className: 'min-tablet hide-panel-tablet'}),
  {data: 'disbursement_description', className: 'min-desktop hide-panel', orderable: false},
  {
    data: 'committee',
    orderable: false,
    className: 'min-tablet hide-panel',
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
    title: 'Disbursement',
    path: ['schedules', 'schedule_b'],
    panel: filterPanel,
    columns: columns,
    paginator: tables.SeekPaginator,
    order: [[3, 'desc']],
    useFilters: true,
    useExport: true,
    disableExport: true,
    rowCallback: tables.modalRenderRow,
    callbacks: {
      afterRender: tables.modalRenderFactory(disbursementTemplate)
    }
  });
  $widgets.prepend($tagList);
});
