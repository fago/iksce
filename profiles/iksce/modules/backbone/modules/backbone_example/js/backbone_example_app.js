(function($) {
  Drupal.behaviors.backbone_example = {
    // ## attach()
    //
    // We start the app in a Drupal.behaviors attach function, this way we can
    // be sure that our settings and required libraries have already been
    // loaded.
    //
    // This app consists of 2 views and on model: views for displaying the app
    // ui and an individual node, and a model to hold the node data.  Note that
    // in Backbone views function much like controlers in more conventional MVC
    // architecture, binding actions to events.
    attach: function() {

      // ### NodeView
      //
      // This is our view of a specific node, it takes care of rendering the
      // node data once it has been loaded from the server and refreshing the
      // display when new data is received.
      //
      // We use Backbone's extend() method to extend the base
      // Drupal.Backbone.View, so that the new module gets all the parent's
      // methods and properties.
      var NodeView = Drupal.Backbone.View.extend({

        // #### NodeView.templateSelector
        //
        // This should be a jQuery CSS selector object or string that matches
        // the id of the template you specified in your `backbone_add_template`
        // call (if you're using the Backbone module's standard template
        // management functions).
        templateSelector: '#backbone-example-node-template',

        // #### NodeView.initialize()
        //
        // The initialize function binds the "change" event on the model to a
        // re-render of the view, so the view is automatically updated whenever
        // the properties of the model change.  This allows us to automatically
        // re-render the node information after we've loaded the data from
        // Drupal...it's magic!
        //
        // Note that we need to call the parent constructor explicitly, using the
        // apply method on the prototype. This is a bit esoteric (except for in
        // JavaScript), but it's basically the equivalent of
        //
        //     parent::__contruct()
        //
        // in PHP. This is not required in Backbone.js, but is required in Drupal
        // Backbone if you want the template to be prepared for you so the default
        // rendering function works at object create.
        initialize: function(opts) {
          this.model = opts.model;
          this.model.bind('change', this.render, this);
          Drupal.Backbone.View.prototype.initialize.apply(this);
        }
      });

      // ### AppView
      //
      // As mentioned above, a standard Backbone pattern is to use one main View
      // object as the controller for the application UI.  In this case, that
      // view is mainly a form, with bindings for the submit button that request
      // the node data from the server, and an initialize function that sets
      // everything up for us.
      var AppView = Drupal.Backbone.View.extend({

        // #### AppView.templateSelector
        //
        // This property functions the same way as NodeView.templateSelector.
        templateSelector: '#backbone-example-app-template',

        // #### AppView.events
        //
        // We use the events property to map jquery event selectors with methods
        // of our view object.  In this case, we will call the function
        // doLoadNode when the form is submitted.
        //
        // Note that our form tag is set to return false on submit, so the form
        // does not actually submit.  In the real world we'd likely do that with
        // jQuery so it would degrade nicely.
        //
        // TODO integrate Backbone forms with the Drupal Form API.
        events: {
          'submit form[name=backbone-example-form]': 'doLoadNode'
        },

        // #### AppView.initialize()
        //
        // The main view's initialize function sets up the view first (via the
        // call to the parent's initialize method, same as NodeView), then binds
        // the new doLoadNode function to the correct object (see the FAQ in the
        // Backbone docs for more on this).
        //
        // Once that's all done, we can create our child view and it's attendant
        // model, then render the main app itself and attach it to the correct
        // location on the page.
        initialize: function() {
          Drupal.Backbone.View.prototype.initialize.apply(this);
          _.bindAll(this, 'doLoadNode');
          this.nodeModel = new Drupal.Backbone.NodeModel();
          this.nodeView = new NodeView({model: this.nodeModel});
          $('#backbone-example-app').append(this.render().el);
          this.$('#backbone-example-node-container').append(this.nodeView.render().el);
        },

        // #### AppView.doLoadNode()
        //
        // This is the method that is called whenever the form is submitted.  It
        // gets the value of the nid input field, sets the model to have the new
        // nid property, then fetches the rest of the node data from the server.
        //
        // We don't need to worry about doing anything when the results come
        // back (whew!), because Backbone will automatically update the model
        // when it receives new data.  Once the model has been updated, a change
        // event will be called, triggering a re-render of the node view thanks
        // to our earlier binding of the view render function to change.
        doLoadNode: function() {
          var nid = this.$('#nid').val();
          this.nodeModel.set('nid', nid);
          this.nodeModel.fetch();
        }
      });

      // ### Start the app!
      //
      // Then all we need to do is create an instance of our app view!
      var app = new AppView();
    },

    // ## unattach()
    //
    // Just to be consistent with Drupal standards, we provide an unattach
    // function as well.
    unattach: function() {
      $('#backbone-example-app').html('');
    }
  };
})(jQuery);
