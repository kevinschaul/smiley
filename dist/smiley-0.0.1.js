/* Simple JavaScript Inheritance
 * By John Resig http://ejohn.org/
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  var initializing = false, fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
 
  // The base Class implementation (does nothing)
  this.Class = function(){};
 
  // Create a new Class that inherits from this class
  Class.extend = function(prop) {
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing = true;
    var prototype = new this();
    initializing = false;
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = typeof prop[name] == "function" &&
        typeof _super[name] == "function" && fnTest.test(prop[name]) ?
        (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) :
        prop[name];
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing && this.init )
        this.init.apply(this, arguments);
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
   
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;
 
    // And make this class extendable
    Class.extend = arguments.callee;
   
    return Class;
  };
})();;var Display_Module = Class.extend({
    init: function(smiley, target_div) {
        this._smiley = smiley;
        this.target_div = target_div;
        this.html_template = null;
    },
    update: function(dataview) {
        var num_items = this._smiley.dataview.length;
        var message_content = [
            '<b>',
            this._smiley.dataview.length,
            '</b>',
            ' result',
        ];
        var suffix = num_items !== 1 ? 's' : '';
        message_content.push(suffix);
        $('#camp-messages').html(message_content.join(''));
    }
});

var Table_Display = Display_Module.extend({
    init: function(smiley, target_div) {
        this._super(smiley, target_div);

        var self = this;
        self._table_template_content = ['<tr>'];
        _.each(self._smiley.config['categories_to_show'], function(v, k) {
            self._table_template_content.push(['<td><%- ', v, '%></td>'].join(''));
        });
        self._table_template_content.push('</tr>');
        self.table_template = _.template(self._table_template_content.join(''));
    },
    update: function(dataview) {
        /*
        Update the table based on the template and the current datasource.
        */
        this._super();

        var self = this;
        var table_header = ['<tr>'];
        _.each(self._smiley.config['categories_to_show'], function(v, k) {
            table_header.push([
                '<th>',
                k,
                '</th>'
            ].join(''));
        });
        table_header.push('</tr>');
        $('#' + self.target_div).html(table_header.join(''));
        self._smiley.dataview.each(function(row, i) {
            $('#' + self.target_div).append(self.table_template(row));
        });
    }
});

var Map_Display = Display_Module.extend({
    init: function(smiley, target_div) {
        /*
        Initialize a map with base layer
        */

        var self = this;
        this._super(smiley, target_div);
        // TODO generalize initial map view
        var MAP_OPTIONS = {
            maxZoom: 12,
            scrollWheelZoom: false
        };
        self.map = new L.map(self.target_div, MAP_OPTIONS);
        var BASE_LAYER_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var BASE_LAYER_OPTIONS = {
            subdomains: ['a', 'b', 'c'],
            attribution: '<a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a> CC-BY-SA',
        };
        var baseLayer = new L.TileLayer(BASE_LAYER_URL, BASE_LAYER_OPTIONS);
        self.map.addLayer(baseLayer);
    },
    update: function(dataview) {
        /*
        Update the map based on the current datasource.
        This code assumes lat_lng is a string in the form `lat,lng`.
        */

        var self = this;
        if (self.markersLayer && self.map.hasLayer(self.markersLayer)) {
            self.map.removeLayer(self.markersLayer);
        }
        self.markersLayer = new L.MarkerClusterGroup();
        var at_least_one_point = false;
        self._smiley.dataview.each(function(row) {
            at_least_one_point = true;
            var lat_lng = row[self._smiley.config['lat_lng']];
            if (lat_lng) {
                var marker = new L.marker(lat_lng.split(','));
                var popup = [];
                _.each(self._smiley.config['categories_to_show'], function(v, k) {
                    popup.push([
                        '<b>',
                        k,
                        ': ',
                        '</b>',
                        row[v],
                        '<br />'
                    ].join(''))
                });
                marker.bindPopup(popup.join(''));
                self.markersLayer.addLayer(marker);
            }
        });
        self.map.addLayer(self.markersLayer);
        // Reset map view to show new data
        if (at_least_one_point) {
            self.map.fitBounds(self.markersLayer.getBounds());
        }
    }
});

;var Filter = function(smiley) {
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

;var Smiley = function(config) {
    /*
    Initialize Smiley object.
    */

    var self = this;
    self.config = config;
    
    self.controls_select_template_content = [
        '<select class="smiley-select" id=<%- id %>>',
        '<option disabled="disabled" selected>Choose</option>',
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

    self.display_modules = [];
    _.each(self.config['views'], function(v, k) {
        switch(k) {
            case 'table': {
                self.display_modules.push(new Table_Display(self, v))
                break;
            }
            case 'map': {
                self.display_modules.push(new Map_Display(self, v))
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
                self.filter.add_filter({
                    'type': 'filter',
                    'needle': this.value,
                    'category': category
                });
                self.filter.perform_filtering();
            });
        });
    }

    $('#camp-controls').append(
        'Search <input id="search" type="text" />'
    );

    // Set up reset filters button
    $('#camp-controls').append(
        '<input id=\'reset\' type=\'button\' value=\'Reset\'>'
    );
    $('#reset').click(function() {
        self._reset_controls();
        self.filter.reset_filters();
    });

    // Set a timer, so that search is not called on every keypress when a user
    // is typing.
    var timer = null;
    var search_length = 0;
    // TODO Create fallback for other browsers
    $('#search').on('input', function() {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            var search_val = $('#search').val();
            self.filter.add_filter({
                'type': 'search',
                'needle': search_val
            });
            // Reset dataview if backspace
            if (search_val.length <= search_length) {
                // TODO This resets all filters, not just search
                self._reset_dataview();
            }
            search_length = search_val.length;
            self.filter.perform_filtering();
        }, 250);
    });
};

Smiley.prototype._reset_controls = function() {
    /*
    Resets any controls to their default state
    */

    var self = this;
    var smileys = $('.smiley-select');
    _.each(smileys, function(e, i) {
        smileys[i].selectedIndex = 0;
    });

    $('#search').val('');
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

