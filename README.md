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

Smiley requires a set of configuration parameters to be set.

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


Development
===========

Assuming Node.js is already installed:

    npm install -g grunt-init grunt-cli

