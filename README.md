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

Smiley requires a set of configuration parameters to be set, in loose JSON.
    
Required:

- `data_url`: (String) The URL of the jsonp feed
- `data_callback`: (String) The callback of the jsonp feed
- `data_subset`: (String) The subset of the jsonp feed that the data resides in
- `categories_to_show`:  (Object: `{ Human-readable name: 'jsonp_property', ... }`) Categories to show in the display modules
- `categories_to_facet_by`: (Array: `[ 'jsonp_property', ... ]` Categories to create filtering widgets for
- `categories_to_search_by`: (Array: `[ 'jsonp_property', ... ]` Categories to inlcude in search queries
- `views`: (Array: 


    [
        {
            label: 'Human-readable name',
            type: 'view_type',
            target_div: 'target-div-id'
        },
        ...
    ]

Display modules to include. First display module in the array becomes the default display.


Optional:

- `lat_lng`: 

Example config values:

    var CONFIG = {
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

To initialize Smiley, pass an object with these configuration values to its constructor, and call the `go()` method.

    $(document).ready(function() {
        var s = new Smiley(CONFIG);
        s.go();
    });


Development
===========

Assuming Node.js is already installed:

    npm install -g grunt-init grunt-cli

