Smiley
======

Like [Simile](http://simile-widgets.org/exhibit/), but without the pain.

Smiley attempts to display structured data feeds in a smart, customizable way.

Downloads
=========

Smiley
------

- [Source version (for development)](dist/smiley-0.0.1.js)
- [Minified version (for production)](dist/smiley-0.0.1.min.js)

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
        'data_url': 'http://0.0.0.0:8000/camp-guide-2013/data/workspace/camp_guide.jsonp',
        'data_callback': 'miso_callback',
        'data_subset': 'items', 
        'categories_to_show': {
            'Camp name': 'label',
            'Price range': 'price_range',
            'Ages': 'event_who',
            'Categories': 'event_category_array'
        },
        'categories_to_facet_by': [
            'event_category_array',
        ],
        'categories_to_search_by': [
            'label',
            'event_category_array'
        ],
        'views': [
            {
                'label': 'Map',
                'type': 'map',
                'target_div': 'map-target'
            },
            {
                'label': 'Table',
                'type': 'table',
                'target_div': 'table-target'
            },
        ],
        'lat_lng': 'latLng'
    };

To run Smiley, create a new instance with these `CONFIG` values, and call its `go()` method.

    $(document).ready(function() {
        var s = new Smiley(CONFIG);
        s.go();
    });


Field definitions
-----------------

Required:

- `target_div`: (String) The CSS id of an empty div, for Smiley to work in.
- `data_url`: (String) The URL of the jsonp feed
- `data_callback`: (String) The callback of the jsonp feed
- `data_subset`: (String) The subset of the json feed that the data resides in
- `categories_to_show`:  (Object: `{ Human-readable name: 'json_property', ... }`) Categories to show in the display modules
- `categories_to_facet_by`: (Array: `[ 'json_property', ... ]` Categories to create filtering widgets for
- `categories_to_search_by`: (Array: `[ 'json_property', ... ]` Categories to inlcude in search queries
- `views`: (Array: `[ { label: 'Human-readable name', type: 'view_type', target_div: 'target-css-id' }, ... ]` Display modules to include. First display module in the array becomes the default display.

Optional:

- `lat_lng`: (String) The json property including location information. Currently must be in the format `'lat,lng'`. Required if `map` view is included in `views`.


Caveats
=======

This code is ultra alpha, and has only been tested against the Star Tribune's example jsonp feeds in Google Chrome.


Development
===========

No guarantees here, but this might get you started.

Assuming Node.js is already installed:

    npm install -g grunt-init grunt-cli

