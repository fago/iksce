// A Child of [Backbone.JS][backbone] with Drupal Services defaults.
//
//
//
// * TODO Add .TaxonomyCollection with support for taxonomy listings.
// * TODO Add .SearchCollection with support for search results.
// * TODO Add configurable endpoint path, loaded via Drupal.settings.
//   (will remove hard dependency on backbone_base feature)
// * TODO Add .FieldViewCollection for working with field views.
//
// [backbone]: http://documentcloud.github.com/backbone

(function($) {

  // Attached to page via Drupal behaviors, for reasons
  // of both properness and so we can use Drupal JS setings.
  Drupal.behaviors.backbone = {
    attach: function() {
      // Drupal.Backbone
      // ---
      //
      // Starts with the Drupal.Backbone Constructor, currently a no-op
      Drupal.Backbone = function() {};
      Drupal.Backbone.Models = {};
      Drupal.Backbone.Collections = {};
      Drupal.Backbone.Views = {};

      // Base objects for Drupal Backbone implementation.
      // ---

      // ### Drupal.Backbone.Model
      //
      // Extend the Model object with default Drupal Services settings and methods.
      // These are defaults for interfacing with all Service module's providers.
      Drupal.Backbone.Models.Base = Backbone.Model.extend({
        // Base endpoint, used to create full url for each collection.
        restEndpoint: Drupal.settings.backbone.endpoint || "",

        // #### initialize()
        //
        // Set up defaults for attribute processing.
        initialize: function() {
          this.toJSONProcessors = this.JSONProcessors || {};
          this.noSaveAttributes = this.noSaveAttributes || [];
          _(this).bindAll('setNoSaveAttributes', 'getNoSaveAttributes', 'addNoSaveAttributes', 'toJSON');
        },

        // #### toJSON: Enhanced JSON processing function
        // Allows us to specify and override processing functions
        // for a single field. Most of this customization will actuallly
        // be in the backend specific functions, as the preparation is
        // needed to prepare for communication with the server.
        toJSON: function() {
          return _(this.attributes)
            .chain()
            // Filter out any attributes that should not be sent.
            .objReject(function(value, name, list) {
              return (_(this.noSaveAttributes).indexOf(name) >= 0);
            }, this)
            // Transform any attribute values that need processing.
            .objMap(this.toJSONAttribute, this)
            .value();
        },

        // #### setNoSaveAttributes: specify attributes we should not send on save
        // Some backends reject our request when we send attributes we can't change.
        // This function takes a single attribute name or an array of attribute
        // names and will filter those attributes out on save.
        setNoSaveAttributes: function(attributes) {
          this.noSaveAttributes = attributes;
        },

        addNoSaveAttributes: function(attributes) {
          this.noSaveAttributes = _(this.noSaveAttributes).union(attributes);
        },

        getNoSaveAttributes: function(attributes) {
          return this.noSaveAttributes;
        },

        // ### setToJSONProcessor()
        //
        // Use this method to set a custom JSON processor for a given
        // attribute. Currently all overrides are attribute name based,
        // so provide the name of the attribute (e.g. "title") and
        // a function to use (either anonymous func or a method on your
        // model).
        setToJSONProcessor: function(attributeName, processorFunction) {
          this.toJSONProcessors[attributeName] = processorFunction;
        },

        // #### toJSONAttribute: process attribute into JSON if process funciton given.
        toJSONAttribute: function(attributeValue, attributeName) {
          if (this.toJSONProcessors[attributeName]) {
            attributeValue = this.toJSONProcessors[attributeName].call(this, attributeValue);
          }
          return attributeValue;
        },

        // Both Services and RESTWS use the format
        // "{endpoint}/{resource-type}/{id}.json, only {endpoint} is empty for
        // RESTWS.
        // We don't include the collection stuff here, since Drupal collections are
        // indpendent of their objects.
        url: function() {
          // Modified from Backbone.js to ignore collection and add ".format" extension.
          var base = this.restEndpoint + "/" + this.urlRoot;
          if (this.isNew()) { return base; }
          // Add .json for format here.
          return base + (base.charAt(base.length - 1) === '/' ? '' : '/') + encodeURIComponent(this.id) + ".json";
        },

        // TODO: evaluate moving all of this to Views.Base
        //       In terms of proper architecture, model should not have views-specific functions.

        // Prepare an object for default rendering
        // arg1: whitelist, array of whitelisted properties (to render)
        // TODO: add blacklist
        renderAttributes: function(whitelist, blacklist) {
          var properties = _.clone(this.attributes);
          if (_.isArray(whitelist)) {
            properties = _(properties).pick(whitelist);
          }
          return properties;
        }

      });

      // ### Drupal.Backbone.Collection
      //
      // Currently just sets the endpoint for all collections.
      //
      // TODO fix scoping issue that causes params to bleed between children of this object.
      //  e.g. if you have two NodeViewCollections, setting limit on one sets on both.
      Drupal.Backbone.Collections.Base = Backbone.Collection.extend({
        // Base endpoint, used to create full url for each collection.
        restEndpoint: Drupal.settings.backbone.endpoint || "",

        // #### initialize()
        //
        // We bind the param functions to this on initialize, to avoid chain
        // inheritance issues.
        //
        // *NOTE* if you subclass this and have an initialize function in your
        // subclass, you need to execute Drupal.Backbone.Collection.initialize
        // explicitly.
        initialize: function(opts) {
          _.bindAll(this, 'setParam', 'setParams', 'getParams');
          this.params = {};
        },

        // #### params
        //
        // Drupal collections are stateful, we store params in the collection.
        params: {},

        // #### setParam(string, string)
        //
        // Setter for individual params, called as setParam('name','value').
        setParam: function(paramName, paramValue) {
          this.params[paramName] = paramValue;
        },

        // #### setParams(object)
        //
        // Setter for multiple params, passed as object with key/value pairs.
        setParams: function(params) {
          if (typeof(this.params) !== 'object') {
            this.params = object;
          }
          if (typeof(params) === 'object') {
            _.extend(
              this.params,
              params
            );
          }
        },

        // #### getParams()
        //
        // Getter. Currently just returns param object property.
        getParams: function() {
          return this.params;
        },

        // #### fetch() implementation
        //
        // Fetch method passes params as data in AJAX call.
        fetch: function(options) {
          options = options ? options : {};
          if (options.data) {
            // Allow options.data to override any params.
            _.defaults(options.data, this.getParams());
          }
          else if (this.getParams()) {
            options.data = this.getParams();
          }
          // Call Super fetch function with options array including any collection params.
          Backbone.Collection.prototype.fetch.call(this, options);
        }
      });

      // ### Drupal.Backbone.Views.Base
      //
      // The parent class for most rendered Drupal Backbone views, this object
      // mainly contains functions for standardizing and abstracting calls to
      // the template library and references to templates.  It meant to be
      // easily extended, so you can focus on logic and presentation of content
      // types, view data etc., and minimize boilerplate code.  At the same time
      // the template engine specifics have been abstracted out, so that
      // switching to a differen template library (such as Handlebars.js),
      // should be as easy as overriding the compileTemplate and/or
      // executeTemplate functions, with everything else remaining the same.
      //
      //    * TODO add parentEl property, and automatically attach the new el
      //      if it exists as part of this.render()
      Drupal.Backbone.Views.Base = Backbone.View.extend({

        // #### initialize
        //
        // Initialize our view by preparing the template for later rendering.
        //
        // This can work in either of two ways:
        //
        //    1. by passing Drupal.Backbone.View.create() an options object with
        //       a jQuery object or selector pointing to the template or the actual
        //       source of the template to be loaded.
        //    2. by subclassing this object and setting either the
        //       templateSelector or templateSource propoerties. Note that you
        //       need to be sure to call this initialize function in your
        //       subclass if you override the initialize function there. Example
        //       code would look like:
        //
        //           myDrupalBackboneView = Drupal.Backbone.View.extend({
        //             templateSelector: '#template-id'
        //           });
        initialize: function(opts) {
          _.bindAll(this,
                    'getTemplate',
                    'compileTemplate',
                    'getTemplateSource',
                    'loadTemplate',
                    'setTemplateSource',
                    'getTemplate',
                    'executeTemplate',
                    'render',
                    'unrender'
                   );


          // Set up default renders provided by the module:
          //   * Underscore.template()
          //   * Twig
          //   * Handlebars
          this.renderers = {
            underscore:{
              compile: function(source) {
                return _.template(source);
              },
              execute: function(template, vars) {
                return template(vars);
              }
            },
            twig: {
              compile: function(source) {
                return twig({
                  data: source
                });
              },
              execute: function(template, vars) {
                return template.render(vars);
              }
            },
            handlebars: {
              compile: function(source) {
                return handlebars.template(source);
              },
              execute: function(template, vars) {
                return template.execute(vars);
              }
            }
          };

          if (typeof(opts) !== 'object') {
            opts = {};
          }

          if (typeof opts.renderer === "string") {
            this.renderer = this.renderers[opts.renderer];
          } else if (typeof opts.renderer === "object") {
            this.renderer = opts.renderer;
          } else {
            this.renderer = this.renderers.underscore;
          }
          this.setTemplateSource(opts.templateSource || this.templateSource);
          this.templateSelector = opts.templateSelector || this.templateSelector;
          if (this.getTemplateSource()) {
            this.compileTemplate();
          }

        },

        // #### compileTemplate()
        //
        // Compile our template code as a template object.
        //
        // This is using _.template(), but so long as template objects have an
        // execute function all we should need to do is override this method to
        // implement new template libraries.
        compileTemplate: function(source) {
          this.template = this.renderer.compile(source || this.getTemplateSource());
        },

        // #### executeTemplate()
        //
        // Wrapper around tempating library's render function. By default this
        // is executing the template object itself, the _.template standard,
        // this should also work for Handlebars. For other systems this may need
        // to be overridden.
        executeTemplate: function(variables) {
          return this.renderer.execute(this.template, variables);
        },

        // #### getTemplateSource()
        //
        // Returns the source for the template.  If the templateSource property
        // is not set, it will check the templateSeclector and try to load the
        // template from code.
        getTemplateSource: function() {
          if (!this.templateSource && this.templateSelector) {
            this.loadTemplate(this.templateSelector);
          }
          return this.templateSource;
        },

        // #### loadTemplate()
        //
        // Load template from jQuery object or selector. If no selector is
        // passed, uses the templateSelector property of the view.
        loadTemplate: function(selector) {
          selector = selector || this.templateSelector;
          if (typeof(selector) === 'object') {
            this.setTemplateSource(selector.html());
          }
          else if (typeof(selector) === 'string') {
            this.setTemplateSource($(selector).html());
          }
        },

        // #### setTemplateSource()
        //
        // Setter for the template source property.
        setTemplateSource: function(source) {
          this.templateSource = source;
        },


        // #### getTemplate()
        //
        // Function to encapsulate the logic for getting the template, and
        // loading as needed from selector or source.
        getTemplate: function() {
          if (!this.templateSource && this.templateObj) {
            this.setTemplateSource(this.templateObj.html());
          }
          else if (this.templateSource) {
            return this.compileTemplate(this.templateSource);
          }
        },

        // #### render(variables, el)
        //
        // Default render function, passes arg variables or model attributes object to
        // template, renders using executeTemplate() method and then appends to
        // this.el or other specified el.
        // TODO: refactor model rendering into separate view class
        render: function(variables, el){
          variables = (typeof variables === "object") ? variables : {};
          el = (typeof el === "undefined") ? this.el : el;
          if (this.model && (variables !=={})) {
            variables = this.model.renderAttributes();
          }

          var content = this.executeTemplate(variables);
          $(this.el).html(content);

          // return ```this``` so calls can be chained.
          return this;
        },

        // #### unrender()
        //
        // Default unrender method, removes this.el from DOM.
        unrender: function() {
          $(this.el).remove();
          return this;
        }
      }); // end extend

      // Extension of View to handle collections
      // Can specify a view for each collection item, a container el as well as location for insert
      // Q: should the container el for each item be on the individual view, or here? I think here, to enable re-use of model views which may not be in li, etc.
      Drupal.Backbone.Views.CollectionView = Drupal.Backbone.Views.Base.extend({

        // Intiialize function takes a configuration object as argument.
        // Expected properties must include:
        //
        // ```
        // {
        //   collection: collectionObject,
        //   itemView: ItemViewClass,
        //   itemParent: Selector for target attach point of rendered items, defaults to appending to this.el  //($obj or selector string)
        // }
        // ```
        //
        // This view owes a lot to the following resources:
        //   * "[Recipes with Backbone.js](http://recipeswithbackbone.com/)" by Gauthier and Strom
        //   * "[Binding a Collection to a View](http://liquidmedia.ca/blog/2011/02/backbone-js-part-3/)", n_time
        //   * "[Rendering Backbone collections in a view](http://rickquantz.com/2012/02/rendering-backbone-collections-in-a-view/)", Rick Quantz
        initialize: function(opts) {
          // call parent initialize w/ opts
          Drupal.Backbone.Views.Base.prototype.initialize.call(this, opts);
          // Bind methods needing binding
          _.bindAll(this, 'render', 'addAll', 'addOne', 'remove');
          this.ItemView = opts.ItemView;
          this.itemParent = opts.itemParent;
          // Keep an array pointing to all item views (aka "child views").
          this._itemViews = [];
          // Bind to important collection events.
          this.collection.bind('add', this.addOne);
          this.collection.bind('reset', this.addAll);
          this.collection.bind('remove', this.remove);
          this.addAll();
        },

        // Add a single item to the view.
        // Render individually and attach, if the collection view has already rendered.
        // TODO: set up "insert at" rendering, so new models don't have to go at the end.
        // TODO: fix issue of extended renderer property being overridden/discounted by initialize.
        addOne: function(newModel) {
          var myItemView = new this.ItemView({
            model: newModel,
            renderer: this.options.renderer // this is a cheat, assume same renderer for children (specifying renderer via extend isn't working)
          });

          // Store pointer to this view in a private variable.
          this._itemViews.push(myItemView);

          // TODO: refactor using model view class
          // TODO: fix binding issue so we can just call render and have it use its own model
          //       (currently "this" in ItemView.render is pointing to the collection view)
          myItemView.render(newModel.renderAttributes());
          this.$(this.itemParent).append(myItemView.el);

          // Bind collection remove to model view remove.
          newModel.bind('remove', myItemView.unrender);
        },

        // Add all, for bootstrapping, etc.
        addAll: function() {
          this.collection.each(this.addOne);
        },

        // Special render method
        render: function(vars) {
          // Call parent render function, pass any vars, to render container
          Drupal.Backbone.Views.Base.prototype.render.call(this, vars);
          return this;
        },

        // Remove one item, if needed.
        // NOTE: this does not remove the element from the DOM, just the internal array.
        // The individual item view should remove itself.
        remove: function(model) {
          var viewToRemove = _(this._itemViews).select(function(itemView) {
            return itemView.model === model;
          })[0];
          this._itemViews = _(this._itemViews).without(viewToRemove);
        }
      });



      // Set Backbone.TypeName to Base Objects for Legacy Compatability.
      // NOTE: These object references are deprecated and could go away!
      Drupal.Backbone.View = Drupal.Backbone.Views.Base;
      Drupal.Backbone.Model = Drupal.Backbone.Models.Base;
      Drupal.Backbone.Collection = Drupal.Backbone.Collections.Base;

      // Set up some Utility functions
      _.mixin({
        // ### _.objMap
        //
        // _.map for objects, keeps key/value associations
        // and changes the value via function.
        // Adapted from https://github.com/documentcloud/underscore/issues/220
        objMap: function (input, mapper, context) {
          return _.reduce(input, function (obj, v, k) {
            obj[k] = mapper.call(context, v, k, input);
            return obj;
          }, {}, context);
        },
        // ### _.objFilter
        //
        // _.filter for objects, keeps key/value associations
        // but only includes the properties that pass test().
        // Adapted from https://github.com/documentcloud/underscore/issues/220
        objFilter: function (input, test, context) {
          return _.reduce(input, function (obj, v, k) {
            if (test.call(context, v, k, input)) {
              obj[k] = v;
            }
            return obj;
          }, {}, context);
        },
        // ### _.objReject
        //
        // _.reject for objects, keeps key/value associations
        // but only includes the properties that pass test().
        // Adapted from https://github.com/documentcloud/underscore/issues/220
        objReject: function (input, test, context) {
          return _.reduce(input, function (obj, v, k) {
            if (!test.call(context, v, k, input)) {
              obj[k] = v;
            }
            return obj;
          }, {}, context);
        }
      });
    }
  };

})(jQuery);
