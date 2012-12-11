(function ($){
  Drupal.behaviors.backbone_munich = {
    attach: function() {
      // Load a node
      var myNode = new Drupal.Backbone.Models.Node({
	nid: 2
      });

      // Display a node

      // create our view class
      var NodeView = Drupal.Backbone.Views.Base.extend({
      	templateSelector: '#backbone_restws_examples_node_template'
      })

      // create our view instance
      var myNodeView = new NodeView({
      	model: myNode,
      	renderer: "twig",
	el: '#backbone-restws-examples-node-render-app'
      });

      // fetch the node, render when we've fetched
      // (better way to do this is with bind(change))
      myNode.fetch({
	success: function() {
      	  myNodeView.render();
	}
      });
    }
  }
})(jQuery);
