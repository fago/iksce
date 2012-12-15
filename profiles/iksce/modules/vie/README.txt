
--------------------------------------------------------------------------------
                 RESTful Web Services for Drupal (restws)
--------------------------------------------------------------------------------

Maintainers:
 * Wolfgang Ziegler (fago)
 * Roni Kantis (bfr)

VIE.js (“Vienna IKS Editables”) is a JavaScript library for implementing
decoupled Content Management Systems and semantic interaction in web
applications. In short, VIE provides a bridge between Backbone.js and the
semantic web.

Requirements:
-------------
 * Backbone.js module
 * Libraries API
 * jQuery Update

 Please check the VIE.js project page for further details on required versions.
 http://drupal.org/project/VIE

Installation
------------

 * Download the required javascript libraries and put them into your libraries
   folder, e.g. DRUPAL_ROOT/sites/all/libraries.

   You can download tested versions of all needed libraries at once with
   drush make (part of drush 5.x, http://drupal.org/project/drush):

      drush make vie.make --no-core --contrib-destination=/path/to/drupal/sites/all/

   As an alternative you can manually download the libraries and put them
   into the libraries/vie and libraries/rdfquery folders. See the vie.make
   file for working download locations and expected file names.

 * Copy the whole vie directory to your modules directory
   (e.g. DRUPAL_ROOT/sites/all/modules) and activate the "Vie.js" module.

 * If you like to use the autocomplete widget for term reference fields, enable
   the VIE autocomplete module also. Then, go to a "Manage fields" screen and
   configure the widget for a field of type "term reference".

Configuration
-------------
 * VIE.js is configured to make use of an Apache Stanbol installation at
   http://localhost:8080 by default. This can be changed by setting the variable
   'iksce_vie_stanbol_url', e.g. put in your settings.php file:

   $conf['iksce_vie_stanbol_url'] = 'http://example.com:8080';

Usage
-----

 * The libraries may be added to drupal by calls to drupal_add_library()
   or respective usage of the renderable #attached key. Examples are:

   * VIE.js:
       drupal_add_library('vie', 'vie');
   * annotate.js ( + VIE.js as dependency):
       drupal_add_library('vie', 'vie.annotate');
   * VIE autocomplete ( + VIE.js as dependency)
       drupal_add_library('vie', 'vie.autocomplete');
