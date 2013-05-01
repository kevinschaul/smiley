var Filter = function(smiley) {
    /*
    Initialize Filter object.

    Stores the current filter information in `_filters`.
    */

    this._smiley = smiley;
    this._filters = [];
};

Filter.prototype.add_filter = function(filter) {
    var self = this;
    self._filters.push(filter);
};

Filter.prototype.reset = function() {
    var self = this;
    self._filters = [];
    self._smiley._reset_dataview();
    self._smiley.update_displays();
};

Filter.prototype.perform_filtering = function() {
    var self = this;
    _.each(self._filters, function(e) {
        self._smiley.dataview = self._filter(e['needle'], e['category']);
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

