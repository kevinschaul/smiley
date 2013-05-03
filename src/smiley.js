var Smiley = function(config) {
    /*
    Initialize Smiley object.
    */

    var self = this;
    self.config = config;
    
    self.controls_select_template_content = [
        '<select class="smiley-select" id=<%- id %>>',
        '<option value="choose" selected>Choose</option>',
        '<% _.each(options, function(option) { %>',
        '<option value="<%- option %>"><%- option %></option>',
        '<% }); %>',
        '</select>',
    ].join('');
    self.controls_select_template = _.template(
        self.controls_select_template_content
    );

    self.ds = new Miso.Dataset({
        url: self.config['data_url'],
        jsonp: true,
        callback: self.config['data_callback'],
        extract: function(data) {
            // TODO This is too specific
            return data.items;
        }
    });
    self.dataview = null;
    self.filter = new Filter(self);
    self.search = new Search(self);

    self.display_modules = [];
    _.each(self.config['views'], function(v, k) {
        switch(v['type']) {
            case 'table': {
                self.display_modules.push(
                    new Table_Display(self, v['target_div'])
                )
                break;
            }
            case 'map': {
                self.display_modules.push(
                    new Map_Display(self, v['target_div'])
                )
                break;
            }
            default: {
                break;
            }
        }
    });
};

Smiley.prototype.fetch = function() {
    /*
    Fetch the data. Called at the user's leisure.
    */

    var self = this;
    this.ds.fetch({
        success: function() {
            self._handle_data(this);
        },
        error: function() {
            console.log('error in ds.fetch()');
        }
    });
};

Smiley.prototype._handle_data = function() {
    /*
    Handle initial load of the data.
    */

    var self = this;
    self._build_controls();
    self._reset_dataview();
    self.update_displays();
};

Smiley.prototype.update_displays = function() {
    /*
    Call the update method of each active display module.
    */

    var self = this;

    _.each(self.display_modules, function(e) {
        e.update();
    });
};

Smiley.prototype._build_controls = function() {
    /*
    Create html for controls, based on `self.config`.
    */

    var self = this;
    var controls_html = [];
    if (self.config['categories_to_facet_by']) {
        _.each(self.config['categories_to_facet_by'], function(category) {
            // Find unique values
            var uniques = [];
            var data = self.ds.column(category).data;
            _.each(data, function(item) {
                if (_.isArray(item)) {
                    _.each(item, function(subitem) {
                        if (!_.contains(uniques, subitem)) {
                            uniques.push(subitem);
                        }
                    });
                } else {
                    if (!_.contains(uniques, item)) {
                        uniques.push(item);
                    }
                }
            });

            var uniques_sorted = _.sortBy(uniques, function(item) {
                return item;
            });

            // Send unique values to a select html element
            var element_id = 'element-' + category;
            $('#camp-controls').append(
                self.controls_select_template({
                    'id': element_id,
                    'options': uniques_sorted
                })
            );

            // Set up change events to the html element
            $('#' + element_id).change(function() {
                if (this.selectedIndex === 0) {
                    self.filter.remove_filter(element_id);
                } else {
                    self.search.reset_control();
                    self.filter.add_filter(element_id, {
                        'needle': this.value,
                        'category': category
                    });
                }
                self.filter.perform_filtering();
            });
        });
    }

    $('#camp-controls').append(
        'Search <input id="smiley-search" type="text" />'
    );

    // Set up eeset filters button
    $('#camp-controls').append(
        '<input id=\'reset\' type=\'button\' value=\'Reset\'>'
    );
    $('#reset').click(function() {
        self._reset_controls();
        self.filter.reset();
        self.search.reset();
    });

    // Set a timer, so that search is not called on every keypress when a user
    // is typing.
    var timer = null;
    // TODO Create fallback for other browsers
    $('#smiley-search').on('input', function() {
        self.filter.reset_control();
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            var search_val = $('#smiley-search').val();
            self.filter.reset();
            self.search.perform_search(search_val);
            self.update_displays();
        }, 250);
    });

    if (self.config['views']) {
        // TODO Use a template
        $('#camp-controls').append('View: ');
        _.each(self.config['views'], function(v, k) {
            $('#camp-controls').append([
                '<input type="radio" name="smiley-views" value="',
                k,
                '">',
                v['label']
            ].join(''));
        });
        var inputs = $('input[name="smiley-views"]');
        inputs.change(function() {
            self.show_display_module($(this).val());
        });
        $(inputs[0]).prop("checked", true);
        $(inputs[0]).trigger('change');
    }
};

Smiley.prototype.show_display_module = function(display_module_index) {
    var self = this;
    _.each(self.display_modules, function(e) {
        e.hide();
    });
    self.display_modules[display_module_index].show();
};

Smiley.prototype._reset_controls = function() {
    /*
    Resets any controls to their default state
    */

    var self = this;
    self.filter.reset_control();
    self.search.reset_control();
};

Smiley.prototype._reset_dataview = function() {
    /*
    Sets the dataview to include all intial data.
    */

    var self = this;
    self.dataview = self.ds.where({
        rows: function(row) {
            return true;
        }
    });
};

