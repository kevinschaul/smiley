var Filter = function(smiley) {
    /*
    Initialize Filter object.

    Stores the current filter information in `_filters`.
    */

    this._smiley = smiley;
    this._filters = {};
};

Filter.prototype.add_filter = function(id, filter) {
    var self = this;
    self._filters[id] = filter;
};

Filter.prototype.remove_filter = function(id) {
    var self = this;
    delete self._filters[id];
};

Filter.prototype.reset = function() {
    var self = this;
    self._filters = {};
    self._smiley._reset_dataview();
    self._smiley.update_displays();
};

Filter.prototype.reset_control = function() {
    var smileys = $('.smiley-select');
    _.each(smileys, function(e, i) {
        smileys[i].selectedIndex = 0;
    });
};

Filter.prototype.perform_filtering = function() {
    var self = this;
    self._smiley._reset_dataview();
    _.each(self._filters, function(v, e) {
        self._smiley.dataview = self._filter(v['needle'], v['category']);
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

