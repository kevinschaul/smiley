var Filter = function(smiley) {
    /*
    Initialize Filter object.

    Stores the current filter information in `_filters`.
    */

    this._smiley = smiley;
    this._filters = [];
    this._search_filter_index = -1;
};

Filter.prototype.add_filter = function(filter) {
    var self = this;
    // Keep at most one search filter active
    if (self._search_filter_index >= 0) {
        self._filters.splice(self._search_filter_index, 1);
    }
    if (filter['type'] === 'search') {
        self._search_filter_index = self._filters.length;
    }
    self._filters.push(filter);
};

Filter.prototype.reset_filters = function() {
    var self = this;
    self._filters = [];
    self._smiley._reset_dataview();
    self._smiley.update_displays();
};

Filter.prototype.perform_filtering = function() {
    var self = this;
    _.each(self._filters, function(e) {
        if (e['type'] === 'filter') {
            self._smiley.dataview = self._filter(e['needle'], e['category']);
        } else if (e['type'] === 'search') {
            self._smiley.dataview = self._search(e['needle']);
        }
    });

    self._smiley.update_displays();
};

Filter.prototype._filter = function(needle, category) {
    /*
    Returns a datasource containing elements with the passed in category
    */

    var self = this;
    return self._smiley.dataview.where({
        rows: function(row) {
            return _.contains(row[category], needle);
        }
    });
};

Filter.prototype._search = function(needle) {
    /*
    Return a datasource containing elements that have `needle` in at least
    one of their `categories_to_search_by`.
    */

    var self = this;
    return self._smiley.dataview.where({
        rows: function(row) {
            // TODO optimize
            var ret = false;
            _.each(CONFIG['categories_to_search_by'], function(category) {
                if (_.isString(row[category])) {
                    var haystack = row[category];
                    if (haystack.toLowerCase().indexOf(needle) >= 0) {
                        ret = true;
                    }
                } else {
                    // Treat the category as an array
                    var categories = row[category];
                    _.each(categories, function(haystack) {
                        if (haystack.toLowerCase().indexOf(needle) >= 0) {
                            ret = true;
                        }
                    });
                }
            });
            return ret;
        }
    });
};

