var Filter = function(smiley) {
    /*
    Initialize Filter object.

    Stores the current filter information in `_filters`.
    */

    this.smiley = smiley;
    this.filters = {};
};

Filter.prototype.add_filter = function(id, filter) {
    var self = this;
    self.filters[id] = filter;
};

Filter.prototype.remove_filter = function(id) {
    var self = this;
    delete self.filters[id];
};

Filter.prototype.reset = function() {
    var self = this;
    self.filters = {};
    self.smiley.reset_dataview();
    self.smiley.update_displays();
};

Filter.prototype.reset_control = function() {
    var smileys = $('.smiley-select');
    _.each(smileys, function(e, i) {
        smileys[i].selectedIndex = 0;
    });
};

Filter.prototype.perform_filtering = function() {
    var self = this;
    self.smiley.reset_dataview();
    _.each(self.filters, function(v, e) {
        self.smiley.dataview = self.filter(v['needle'], v['category']);
    });

    self.smiley.update_displays();
};

Filter.prototype.filter = function(needle, category) {
    /*
    Returns a datasource containing elements with the passed in category
    */

    var self = this;
    return self.smiley.dataview.where({
        rows: function(row) {
            return _.contains(row[category], needle);
        }
    });
};

