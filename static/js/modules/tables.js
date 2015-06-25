'use strict';

/* global require, module, window, document, API_LOCATION, API_VERSION, API_KEY */

var $ = require('jquery');
var _ = require('underscore');
var URI = require('URIjs');
require('datatables');
require('drmonty-datatables-responsive');

$.fn.DataTable.Api.register('seekIndex()', function(length, start, value) {
  var settings = this.context[0];
  if (typeof value !== 'undefined') {
    settings._seekIndexes = settings._seekIndexes || {};
    settings._seekIndexes[length] = settings._seekIndexes[length] || {};
    settings._seekIndexes[length][start] = value;
  } else {
    return ((settings._seekIndexes || {})[length] || {})[start] || undefined;
  }
});

var filters = require('./filters');

function yearRange(first, last) {
  if (first === last) {
    return first;
  } else {
    return first.toString() + ' - ' + last.toString();
  }
}

function mapFilters(filters) {
  return _.reduce(filters, function(acc, val) {
    if (val.value) {
      if (acc[val.name]) {
        acc[val.name].push(val.value);
      } else {
        acc[val.name] = [val.value];
      }
    }
    return acc;
  }, {});
}

var parsedFilters;

function buildCycle(datum) {
  if (parsedFilters.cycle) {
    var cycles = _.intersection(
      _.map(parsedFilters.cycle, function(cycle) {return parseInt(cycle);}),
      datum.cycles
    );
    return '?cycle=' + _.max(cycles);
  } else {
    return '';
  }
}

function buildEntityLink(data, url, category) {
  var anchor = document.createElement('a');
  anchor.textContent = data;
  anchor.setAttribute('href', url);
  anchor.setAttribute('title', data);
  anchor.setAttribute('data-category', category);
  anchor.classList.add('single-link');
  return anchor.outerHTML;
}

var candidateColumns = [
  {
    data: 'name',
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return buildEntityLink(data, '/candidate/' + row.candidate_id + buildCycle(row), 'candidate');
    }
  },
  {data: 'office_full', className: 'min-tablet'},
  {
    data: 'cycles',
    className: 'min-tablet',
    render: function(data, type, row, meta) {
      return yearRange(_.first(data), _.last(data));
    }
  },
  {data: 'party_full', className: 'min-tablet'},
  {data: 'state', className: 'min-desktop'},
  {data: 'district', className: 'min-desktop'},
];

var committeeColumns = [
  {
    data: 'name',
    className: 'all',
    width: '20%',
    render: function(data, type, row, meta) {
      return buildEntityLink(data, '/committee/' + row.committee_id + buildCycle(row), 'committee');
    }
  },
  {data: 'treasurer_name', className: 'min-desktop'},
  {data: 'state', className: 'min-desktop', width: '60px'},
  {data: 'party_full', className: 'min-desktop'},
  {data: 'organization_type_full', className: 'min-desktop'},
  {data: 'committee_type_full', className: 'min-tablet'},
  {data: 'designation_full', className: 'min-tablet'},
];

var donationColumns = [
  {
    data: 'contributor_name',
    orderable: false,
    className: 'all',
    width: '30%'
  },
  {data: 'contributor_state', orderable: false, className: 'min-desktop'},
  {data: 'contributor_employer', orderable: false, className: 'min-desktop'},
  {data: 'contributor_receipt_amount', className: 'min-tablet'},
  {data: 'receipt_date', className: 'min-tablet'},
  {
    data: 'committee_name',
    orderable: false,
    className: 'all',
    width: '30%',
    render: function(data, type, row, meta) {
      return buildEntityLink(data, '/committee/' + row.committee_id, 'committee');
    }
  },
];

function mapSort(order, columns) {
  return _.map(order, function(item) {
    var name = columns[item.column].data;
    if (item.dir === 'desc') {
      name = '-' + name;
    }
    return name;
  });
}

function mapResponse(response) {
  return {
    recordsTotal: response.pagination.count,
    recordsFiltered: response.pagination.count,
    data: response.results
  };
}

function pushQuery(filters) {
  var params = URI('').query(filters).toString();
  if (window.location.search !== params) {
    window.history.pushState(filters, params, params || window.location.pathname);
  }
}

function initTable($table, $form, baseUrl, columns, opts) {
  var draw;
  opts = _.extend({
    serverSide: true,
    searching: false,
    columns: columns,
    lengthMenu: [30, 50, 100],
    responsive: true,
    language: {
      lengthMenu: 'Results per page: _MENU_'
    },
    dom: '<"results-info meta-box results-info--top"lfrip>t<"results-info meta-box"ip>',
    ajax: function(data, callback, settings) {
      var api = this.api();
      var filters = $form.serializeArray();
      parsedFilters = mapFilters(filters);
      pushQuery(parsedFilters);
      var query = $.extend(
        {
          per_page: data.length,
          last_index: api.seekIndex(data.length, data.start),
          api_key: API_KEY
        },
        parsedFilters
      );
      query.sort = mapSort(data.order, columns);
      $.getJSON(
        URI(API_LOCATION)
        .path([API_VERSION, baseUrl].join('/'))
        .query(query)
        .toString()
      ).done(function(response) {
        api.seekIndex(data.length, data.length + data.start, response.pagination.last_index);
        callback(mapResponse(response));
      });
    }
  }, opts || {});
  var api = $table.DataTable(opts);
  // Update filters and data table on navigation
  $(window).on('popstate', function() {
    filters.activateInitialFilters();
    api.ajax.reload();
  });
  $form.submit(function(event) {
    event.preventDefault();
    api.ajax.reload();
  });
}

module.exports = {
  init: function() {
    var $table = $('#results');
    var $form = $('#category-filters');
    switch ($table.attr('data-type')) {
      case 'candidate':
        initTable($table, $form, 'candidates', candidateColumns);
        break;
      case 'committee':
        initTable($table, $form, 'committees', committeeColumns);
        break;
      case 'donation':
        initTable($table, $form, 'filings/schedule_a', donationColumns, {
          order: [[4, 'asc']],
          pagingType: 'simple'
        });
        break;
    }

    // Move the filter button into the results-info div
    var $filterToggle = $('#filter-toggle');
    $('.results-info--top').prepend($filterToggle);
  }
};
