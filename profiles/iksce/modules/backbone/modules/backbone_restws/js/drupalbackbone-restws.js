(function($) {

  // Attached to page via Drupal behaviors, for reasons
  // of both perperness and so we can use Drupal JS setings.
  Drupal.behaviors.backboneServices = {
    attach: function() {
      // Drupal.Backbone.Models for RestWS
      // ---
      //
      // RestWS offers a fairly compliant, transparent interface for Backbone,
      // so in order to make some simple models for common entities(/resources)
      // we just need to to filter out read-only attributes on save.

      // ### Drupal.Backbone.Models.Entity
      //
      // This is a generic
      Drupal.Backbone.Models.Entity = Drupal.Backbone.Models.Base.extend({
        initialize: function(opts) {
          _(Drupal.Backbone.Models.Entity.prototype).extend({noSaveAttributes: {}});
          Drupal.Backbone.Models.Base.prototype.initialize.call(this, opts);
          // Filter out fields that will cause RestWS to reject our request if we try to write:
          if (this.idAttribute) {
            this.addNoSaveAttributes(this.idAttribute);
          }
          this.addNoSaveAttributes(['url', 'edit_url']);
        },
        url: function() {
          return Drupal.settings.basePath + this.urlRoot + '/' + this.get(this.idAttribute) + ".json";
        }
      });

      // ### Drupal.Backbone.Models.Node
      //
      // Node-specific settings for Drupal's RestWS node resource.
      Drupal.Backbone.Models.Node = Drupal.Backbone.Models.Entity.extend({
        urlRoot: "node",
        idAttribute: "nid",
        noSaveAttributes: ['nid', 'vid', 'is_new', 'url', 'edit_url', 'changed', 'comment_count', 'comment_count_new'],
        initialize: function(opts) {
          Drupal.Backbone.Models.Entity.prototype.initialize.call(this, opts);
        // this.addNoSaveAttributes(['nid', 'vid', 'is_new', 'url', 'edit_url', 'changed', 'comment_count', 'comment_count_new']);
        }
      });

      // ### Drupal.Backbone.Models.User
      //
      // Model for users.
      Drupal.Backbone.Models.User = Drupal.Backbone.Models.Base.extend({
        urlRoot: "user",
        idAttribute: "uid",
        initialize: function(opts) {
          Drupal.Backbone.Models.Entity.prototype.initialize.call(this, opts);
          this.addNoSaveAttributes(['uid', 'url', 'edit_url', 'last_access', 'last_login', 'created']);
        }
      });

      // ### Drupal.Backbone.Models.User
      //
      // Model for commennts.
      Drupal.Backbone.Models.Comment = Drupal.Backbone.Models.Base.extend({
        urlRoot: "comment",
        idAttribute: "cid",
        initialize: function(opts) {
          Drupal.Backbone.Models.Entity.prototype.initialize.call(this, opts);
          this.addNoSaveAttributes(['cid', 'url', 'edit_url', 'created']);
        }
      });

      // ## Drupal Backbone Collections
      //
      // Specific collections for Drupal listing types.
      Drupal.Backbone.Collections.RestWS = {};
      Drupal.Backbone.Collections.RestWS.EntityIndex = Drupal.Backbone.Collections.Base.extend({
        initialize: function(opts) {
          Drupal.Backbone.Collections.Base.prototype.initialize.call(this, opts);
          if (opts) {
            if (opts.entityType) {
              this.entityType = opts.entityType;
            }
            this.model = opts.model ? opts.model : this.model;
          }
          _(this).bindAll('fetchQuery');
        },
        url: function() {
          return Drupal.settings.basePath + this.entityType + ".json";
        },
        parse: function(resp) {
          return resp.list;
        },
        // ### .fetchQuery(queryParams, options): Run a RestWS Entity Query
        //
        // A very lightweight wrapper on top of fetch to make it intutive.
        fetchQuery: function(queryParams, options) {
          options = options || {};
          return this.fetch(_(options).extend({data: queryParams}));
        }
      });

      // ### Drupal.Backbone.NodeQuery
      //
      // Create collection for Node resource's index/query interface.
      Drupal.Backbone.Collections.RestWS.NodeIndex = Drupal.Backbone.Collections.RestWS.EntityIndex.extend({
        entityType: 'node',
        model: Drupal.Backbone.Models.Node
      });

      // ### Drupal.Backbone.UserIndexCollection
      //
      // Create collection for User resource's index interface.
      Drupal.Backbone.Collections.UserIndex = Drupal.Backbone.Collections.Base.extend({
        model: Drupal.Backbone.Models.User,
        url: function() {
          return this.restEndpoint + "/user.json";
        }
      });

      // ### Drupal.Backbone.NodeCommentsCollection
      //
      // Create collection of all comments on a given node.
      Drupal.Backbone.Collections.NodeComments = Drupal.Backbone.Collections.Base.extend({
        model: Drupal.Backbone.UserModel,
        url: function() {
          return this.restEndpoint + "/user.json";
        }
      });

      // Legacy objects.
      // NOTE: These object references are deprecated and could go away!
      Drupal.Backbone.NodeIndexCollection = Drupal.Backbone.Collections.NodeIndex;
      Drupal.Backbone.NodeViewCollection = Drupal.Backbone.Collections.NodeView;
      Drupal.Backbone.UserIndexCollection = Drupal.Backbone.Collections.UserIndex;
      Drupal.Backbone.NodeCommentsCollection = Drupal.Backbone.Collections.NodeComments;
    }
  };

})(jQuery);
