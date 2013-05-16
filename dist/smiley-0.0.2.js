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
        this.smiley = smiley;
        this.target_div = target_div;
        this.html_template = null;
        this.hidden = true;
    },
    update: function(dataview) {
        var num_items = this.smiley.dataview.length;
        var message_content = [
            '<b>',
            this.smiley.dataview.length,
            '</b>',
            ' result',
        ];
        var suffix = num_items !== 1 ? 's' : '';
        message_content.push(suffix);
        $('#smiley-messages').html(message_content.join(''));
    },
    show: function() {
        $('#' + this.target_div).show();
        this.hidden = false;
    },
    hide: function() {
        $('#' + this.target_div).hide();
        this.hidden = true;
    }
});

var Table_Display = Display_Module.extend({
    init: function(smiley, target_div) {
        this._super(smiley, target_div);

        var self = this;
        self.table_template_content = ['<tr>'];
        _.each(self.smiley.config['categories_to_show'], function(v, k) {
            self.table_template_content.push(['<td><%- ', v, '%></td>'].join(''));
        });
        self.table_template_content.push('</tr>');
        self.table_template = _.template(self.table_template_content.join(''));
    },
    update: function(dataview) {
        /*
        Update the table based on the template and the current datasource.
        */
        this._super();

        var self = this;
        var table_header = ['<tr>'];
        _.each(self.smiley.config['categories_to_show'], function(v, k) {
            table_header.push([
                '<th>',
                k,
                '</th>'
            ].join(''));
        });
        table_header.push('</tr>');
        $('#' + self.target_div).html(table_header.join(''));
        self.smiley.dataview.each(function(row, i) {
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
        var MAP_OPTIONS = {
            maxZoom: 12,
            scrollWheelZoom: false
        };
        self.map = new L.map(self.target_div, MAP_OPTIONS);
        var BASE_LAYER_URL = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        var BASE_LAYER_OPTIONS = {
            subdomains: ['a', 'b', 'c'],
            attribution: '<a href="http://www.openstreetmap.org/copyright">&copy; OpenStreetMap contributors</a> CC-BY-SA'
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
        if (!self.hidden) {
            if (self.markersLayer && self.map.hasLayer(self.markersLayer)) {
                self.map.removeLayer(self.markersLayer);
            }
            self.markersLayer = new L.MarkerClusterGroup();
            var at_least_one_point = false;
            self.smiley.dataview.each(function(row) {
                at_least_one_point = true;
                var lat_lng = row[self.smiley.config['lat_lng']];
                if (lat_lng) {
                    var marker = new L.marker(lat_lng.split(','));
                    var popup = [];
                    _.each(self.smiley.config['categories_to_show'], function(v, k) {
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
    }
});

;var Filter = function(smiley) {
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

;var Search = function(smiley) {
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

;var Smiley = function(config) {
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
        '</select>'
    ].join('');
    self.controls_select_template = _.template(
        self.controls_select_template_content
    );

    self.ds = new Miso.Dataset({
        url: self.config['data_url'],
        jsonp: true,
        callback: self.config['data_callback'],
        extract: function(data) {
            if (self.config['data_subset']) {
                return data[self.config['data_subset']];
            }
            return data;
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

Smiley.prototype.go = function() {
    /*
    Fetch the data. Called at the user's leisure.
    */

    var self = this;
    this.ds.fetch({
        success: function() {
            self.handle_data(this);
        },
        error: function() {
            console.log('error in ds.fetch()');
        }
    });
};

Smiley.prototype.handle_data = function() {
    /*
    Handle initial load of the data.
    */

    var self = this;
    self.build_controls();
    self.reset_dataview();
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

Smiley.prototype.build_controls = function() {
    /*
    Create html for controls, based on `self.config`.
    */

    var self = this;
    $('#' + self.config['target_div']).html([
        '<div id="smiley-controls"></div>',
        '<div id="smiley-messages"></div>',
    ].join(''));
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
            $('#smiley-controls').append(
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

    $('#smiley-controls').append(
        'Search <input id="smiley-search" type="text" />'
    );

    // Set up eeset filters button
    $('#smiley-controls').append(
        '<input id=\'reset\' type=\'button\' value=\'Reset\'>'
    );
    $('#reset').click(function() {
        self.reset_controls();
        self.filter.reset();
        self.search.reset();
    });

    // Set a timer, so that search is not called on every keypress when a user
    // is typing.
    var timer = null;
    $('#smiley-search').on($.browser.msie ? 'propertychange' : 'input',
            function() {
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
        $('#smiley-controls').append('View: ');
        _.each(self.config['views'], function(v, k) {
            $('#smiley-controls').append([
                '<input type="radio" name="smiley-views" value="',
                k,
                '">',
                v['label']
            ].join(''));
        });
        var inputs = $('input[name="smiley-views"]');
        inputs.change(function() {
            self.show_display_module($(this).val());
            self.reset_controls();
            self.reset_dataview();
            self.filter.reset();
            self.search.reset();
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

Smiley.prototype.reset_controls = function() {
    /*
    Resets any controls to their default state
    */

    var self = this;
    self.filter.reset_control();
    self.search.reset_control();
};

Smiley.prototype.reset_dataview = function() {
    /*
    Sets the dataview to include all intial data.

    If a sort order is given, sort the dataview accordingly.
    */

    var self = this;
    self.dataview = self.ds.where({
        rows: function(row) {
            return true;
        }
    });

    if (self.config.sort_by) {
        self.dataview.sort(function(rowA, rowB) {
            var sort_by = self.config.sort_by;
            if (rowA[sort_by] > rowB[sort_by]) {
                return 1;
            } else if (rowA[sort_by] < rowB[sort_by]) {
                return -1;
            }
            return 0;
        });
    }
};

