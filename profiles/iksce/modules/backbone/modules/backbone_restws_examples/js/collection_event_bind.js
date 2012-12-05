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
          Drupal.Backbone.Views.Base.prototype.initialize.call(this, opts);
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
          _(this).bindAll('togglePromote');
        },
        togglePromote: function() {
          var promoteVal = this.get('promote')=="1" ? "0" : "1";
          this.set('promote', promoteVal);
          this.save();
        }
      });

      // Create Collection class
      var collection = new Drupal.Backbone.Collections.RestWS.NodeIndex({
        model: TogglePromoteNode
      });

      // Create Collection View
      var collectionView = new Drupal.Backbone.Views.CollectionView({
        collection: collection,
        templateSelector: '#backbone_restws_examples_collection_template',
        renderer: 'twig',
        el: '#backbone-restws-examples-collection-event-bind-app',
        ItemView: NodeView,
        itemTag: 'li',
        itemParent: 'ul.search-results'
      });

      // Render view (shell, items will attach on collection "add" event)
      collectionView.render();

      // Fetch collection
      collection.fetchQuery({type:"page"});
    }
  };
})(jQuery);
