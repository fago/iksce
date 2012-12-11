(function ($){
  Drupal.behaviors.backbone_restws_examples = {
    attach: function() {
      // Create Node Model class
      // Create Collection class
      var collection = new Drupal.Backbone.Collections.RestWS.NodeIndex();

      // Create Node View
      var NodeView = Drupal.Backbone.Views.Base.extend({
        templateSelector: '#backbone_restws_examples_node_template',
        renderer: 'twig',
        tagName: 'li'
      });

      // Create Collection View
      var collectionView = new Drupal.Backbone.Views.CollectionView({
        collection: collection,
        templateSelector: '#backbone_restws_examples_collection_template',
        renderer: 'twig',
        el: '#backbone-restws-examples-collection-render-app',
        ItemView: NodeView,
        itemTag: 'li',
        itemParent: 'ul.search-results'
      });

      // Render view (shell, items will attach on collection "add" event)
      collectionView.render();

      // Fetch collection
      collection.fetch({
        success: function(collection) {
          // this is empty, since event handlers take care of everything!
        }
      });
    }
  }
})(jQuery);
