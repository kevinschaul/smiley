Smiley
======

Smiley attempts to display structured data feeds in a smart, customizable way.

Downloads
=========

Smiley
------

- [Source version (for development)](dist/smiley-latest.js)
- [Minified version (for production)](dist/smiley-latest.min.js)

Dependencies
------------
- [jQuery](http://jquery.com/)
- [Underscore.js](http://underscorejs.org/)
- [Leaflet](http://leafletjs.com/)

Usage
=====

Smiley requires a set of configuration parameters to be set, in loose JSON. An example configuration follows:
 
    var CONFIG = {
        'target_div': 'camp-main',
        'data_url': '/examples/camp_guide.jsonp',
        'data_callback': 'miso_callback',
        'data_subset': 'items',
        'categories_to_show': [
            {
                'property': 'label',
                'label': 'Camp name',
                'link': 'info_website'
            }, {
                'property': 'price_range',
                'label': 'Price range'
            }, {
                'property': 'event_who',
                'label': 'Ages'
            }, {
                'property': 'event_category_array',
                'label': 'Categories'
            }
        ],
        'categories_to_facet_by': [
            'event_category_array',
        ],
        'categories_to_search_by': [
            'label',
            'event_category_array'
        ],
        'sort_by': 'label',
        'views': [
            {
                'label': 'Map',
                'type': 'map',
                'target_div': 'map-target',
                'view_settings': {
                    'lat_lng': 'latLng',
                    'directions_query': 'label'
                }
            },
            {
                'label': 'Table',
                'type': 'table',
                'target_div': 'table-target'
            }
        ]
    };

To run Smiley, create a new instance with these `CONFIG` values, and call its `go()` method.

    $(document).ready(function() {
        var s = new Smiley(CONFIG);
        s.go();
    });

Of course, this requires the html divs specified in the `CONGIG` values to exist. A simple html section to match this configuration might look like this:

    <div id='camp-main'></div>
    <div id='map-target' style='height: 400px; width: 400px;'></div>
    <table id='table-target'></table>

Note that the map view's `target_div` requires a height and width to display.

Working example
---------------

To run a working example from this repository:

1. Begin a server in this project's root: `python -m SimpleHTTPServer`

2. Visit [http:127.0.0.1:8000/examples/camp-guide.html](http:127.0.0.1:8000/examples/camp-guide.html) in your browser.


Field definitions
-----------------

Required:

- `target_div`: (String) The CSS id of an empty div, for Smiley to work in.
- `data_url`: (String) The URL of the jsonp feed
- `data_callback`: (String) The callback of the jsonp feed
- `data_subset`: (String) The subset of the json feed that the data resides in
- `categories_to_show`:  (Array: `{ 'property': 'json_property', 'label': 'Human-readable label', 'link': 'json_property' }`) Categories to show in the display modules. `link` is optional.
- `categories_to_facet_by`: (Array: `[ 'json_property', ... ]` Categories to create filtering widgets for
- `categories_to_search_by`: (Array: `[ 'json_property', ... ]` Categories to inlcude in search queries
- `views`: (Array: `[ { label: 'Human-readable name', type: 'view_type', target_div: 'target-css-id', view_settings: { ... } }, ... ]` Display modules to include. First display module in the array becomes the default display.

Optional:

- `sort_by`: (String) The json property to sort results by.

Map display `view_settings`:

- `lat_lng`: (String) The json property including location information. Currently must be in the format `lat,lng`.
- `directions_query`: (String) The json property to build a Google Maps directions url from. The resulting link will search for locations by the name of the `directions_query` property in the area of the `lat_lng` property.


Caveats
=======

This code is ultra alpha, and has only been tested against the Star Tribune's example jsonp feeds in Google Chrome.


Development
===========

No guarantees here, but this might get you started.

Assuming Node.js is already installed:

    npm install -g grunt-init grunt-cli


Similar projects
================

- [Simile Exhibit](http://simile-widgets.org/exhibit/)
