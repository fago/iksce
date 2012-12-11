(function ($){
  Drupal.behaviors.backbone_restws_examples = {
    attach: function() {

      // Create Node View
      var NodeView = Drupal.Backbone.Views.Base.extend({
        templateSelector: '#backbone_restws_examples_node_event_bind_template',
        renderer: 'twig',
        events: {
          "click button.promote-toggle": "togglePromote"
        },
        initialize: function(opts) {
          this.constructor.__super__.initialize.call(this, opts);
          this.model.bind('change', this.render);
          _(this).bindAll("togglePromote");
        },
        togglePromote: function() {
          this.model.togglePromote();
        }
      });

      // Create a new model class
      var TogglePromoteNode = Drupal.Backbone.Models.Node.extend({
        initialize: function(opts) {
          Drupal.Backbone.Models.Node.prototype.initialize.call(this, opts);
          //this.constructor.__super__.initialize.call(this, opts);
          _(this).bindAll('togglePromote');
        },
        togglePromote: function() {
          var promoteVal = this.get('promote')=="1" ? "0" : "1";
          this.set('promote', promoteVal);
          var that = this;
          this.save();
        }
      });

      // Load a node
      var myNode = new TogglePromoteNode({
        nid: 2
      });

      // create our view instance
      var myNodeView = new NodeView({
        model: myNode,
        renderer: "twig",
        el: '#backbone-restws-examples-node-event-bind-app'
      });

      myNode.fetch();

    }
  };
})(jQuery);
