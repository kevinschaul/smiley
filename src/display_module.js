var Display_Module = Class.extend({
    init: function(smiley, target_div, view_settings) {
        this.smiley = smiley;
        this.target_div = target_div;
        this.view_settings = view_settings;
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
    init: function(smiley, target_div, view_settings) {
        this._super(smiley, target_div, view_settings);

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
    init: function(smiley, target_div, view_settings) {
        /*
        Initialize a map with base layer
        */

        var self = this;
        this._super(smiley, target_div, view_settings);
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
                var lat_lng = row[self.view_settings['lat_lng']];
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
                    if (self.view_settings['directions_query']) {
                        popup.push([
                            '<a target="_blank" href="',
                            'https://maps.google.com/?f=d&q=',
                            row[self.view_settings['directions_query']],
                            '&near=',
                            row[self.view_settings['lat_lng']],
                            '">Get driving directions</a>',
                            '<br />'
                        ].join(''));
                    }
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

