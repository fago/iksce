Backbone for Drupal
===


What this module does
---

This module provides an extended version of [BackboneJS][backbone] with
convenience functions for working with Drupal nodes and views.  Using this
module, you can build complex interactive interfaces with little to no server
side code, leveraging Drupal's field and entity types and Backbone's power on
the client side.

[backbone]: http://documentcloud.github.com/backbone/


Installation
---

   * Download the latest version of [Underscore.js][underscore] into the
     appropriate libraries/underscore directory (usuall
     sites/all/libraries/underscore).
   * Enable Clean URLs for your site.
   * Download the latest version of [Backbone.js][backbone] into
     libraries/backbone.
   * Enable this module and it's dependencies.
   * Make some awesome user interfaces with Backbone and Drupal!

[underscore]: http://documentcloud.github.com/underscore/


Testing
---

This module uses the jQuery [QUnit][] library for JavaScript testing, via the
[QUnit module][] for Drupal.  Currently CRUD operations, Node Index collections
and Views collections are covered by basic tests, and thee's a bit of fancy 
footwork to handle testing of asynchronous AJAX callbacks. See the
backbone.test.js file in the tests subdirectory of this module.

[QUnit]: http://docs.jquery.com/QUnit
[QUnit module]: http://drupal.org/project/qunit


What's to come...
---

We have a lot of plans and hopes for this module.  Here's the current docket:

   * Example module using node listing (promote to front interface?)
   * In-place editing w/ Backbone and Hallo or another HTML5 contenteditable
     editor.

Why Services and not RestWS?
---

There is clearly still [a lot of work][render_formats_post] to be done in
designing a solution for working with structured data formats in Drupal.
Currently, there are two modules providing RESTful access to JSON objects in
Drupal: [Services][services] and [Restful Web Services][restws].  For some
background on the different design considerations motivating each of these
modules, you can see http://drupal.org/node/1042512 and
http://drupal.org/node/745046 While RestWS's more orthodox adherence to REST URL
structures, [Entity API][entityapi] integration and more lightweight data return
formats are all well suited to Backbone integration, there are a few key reasons
why Services is the better option at this point in time (in @ethanw's opinion,
at least):

1. *RestWS lacks indexes and support for views.*  Because Backbone
   collections are such a powerful integration point between Backbone and
   Drupal, not having support for indexes and listings of some type in RestWS
   is a major drawback.  Modules like Views Datasource can provide listing
   views, but needing to graft those solutions onto a RestWS system is
   definitely not optimal.
2. *RestWS does not provide access to raw entity data*. While this is a
   positive when viewed in terms of security (see the issue regarding
   [support for formatters][formatters_issue]), what we really need is
   permissioned access to raw data.  At present, it seems a more efficient
   way to pursue this functionality is subtractive: to remove data from
   Services resources which unauthorized users should not see, instead of
   adding functionality to the RestWS module.
3. On the more theoretical side, while entity --> resource mapping is slick
   and elegant, in a Backbone application context it is not clear that
   entities will necessarily be the "atomic units" of an application.  It is
   conceivable that some sort of composite object might be the primary
   object withing a Backbone app, and the Services module's flexibility
   could be of benefit in such a context.  This is a purely speculative
   case, and not intended to take any sides in terms of the architectural
   decisions of either of these modules, but does seem worth noting.

That said, this question is very much an open one, and it is quite possible that
two versions of Drupal Backbone could be developed in the future, offering
support for various data backends. Ideally, the REST backend used for building
Backboe apps would support indexes (with and without Views), all entity objects,
custom REST resources, permissioned access to fields and unformatted data vs.
formatted data, etc.

[render_formats_post]: http://drupal.org/node/145551
[services]: http://drupal.org/project/services
[restws]: http://drupal.org/project/restws
[entityapi]: http://drupal.org/project/entity
[formatters_issue]: http://drupal.org/node/1454570
