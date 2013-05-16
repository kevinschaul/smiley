var Search = function(smiley) {
    /*
    Initialize Search object.

    Stores the current search information in `_searchs`.
    */

    this.smiley = smiley;
};

Search.prototype.perform_search = function(needle) {
    var self = this;
    self.smiley.dataview = self.search(needle);
    self.smiley.update_displays();
};

Search.prototype.reset = function() {
    var self = this;
    self.smiley.reset_dataview();
    self.smiley.update_displays();
};

Search.prototype.reset_control = function() {
    $('#smiley-search').val('');
};

Search.prototype.search = function(needle) {
    /*
    Return a datasource containing elements that have `needle` in at least
    one of their `categories_to_search_by`.
    */

    var lneedle = needle.toLowerCase();
    var self = this;
    return self.smiley.dataview.where({
        rows: function(row) {
            var ret = false;
            _.each(CONFIG['categories_to_search_by'], function(category) {
                if (_.isString(row[category])) {
                    var haystack = row[category];
                    if (haystack.toLowerCase().indexOf(lneedle) >= 0) {
                        ret = true;
                    }
                } else {
                    // Treat the category as an array
                    var categories = row[category];
                    _.each(categories, function(haystack) {
                        if (haystack.toLowerCase().indexOf(lneedle) >= 0) {
                            ret = true;
                        }
                    });
                }
            });
            return ret;
        }
    });
};

