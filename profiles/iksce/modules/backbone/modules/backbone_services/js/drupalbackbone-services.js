(function($) {

  // Attached to page via Drupal behaviors, for reasons
  // of both perperness and so we can use Drupal JS setings.
  Drupal.behaviors.backboneServices = {
    attach: function() {
      // Drupal.Backbone.Models for Services
      // ---
      //
      // Drupal-specific models for apps using a Services module backend. The
      // main difference here is the use of a longer endpoint name and the need
      // to nest the attribute's JSON values inside an object with a key of the
      // object type (for all but users).

      // ### Drupal.Backbone.Models.Node
      //
      // Node-specific settings for Drupal Services' node resource.
      Drupal.Backbone.Models.Node = Drupal.Backbone.Models.Base.extend({
        urlRoot: "node",
        idAttribute: "nid",

        initialize: function(opts) {
          Drupal.Backbone.Models.Base.prototype.initialize.call(this, opts);
          // Set up common boolean fields for correct JSON format for services
          this.setToJSONProcessor('promote', this.toJSONBoolean);
        },

        toJSON: function() {
          return {
            node: Drupal.Backbone.Models.Base.prototype.toJSON.call(this)
          };
        },

        // Processor for Boolean values, needed due to way Services treats "false".
        // See http://drupal.org/node/1511662 and http://drupal.org/node/1561292
        toJSONBoolean: function(value) {
          if (value === 1 || value === "1" || value === true || value === "true") {
            return true;
          } else {
            return null;
          }
        }

      });

      // ### Drupal.Backbone.UserModel
      //
      // Model for users.
      //
      // * TODO: Add support for login and logout methods.
      Drupal.Backbone.Models.User = Drupal.Backbone.Models.Base.extend({
        urlRoot: "user",
        idAttribute: "uid"
      });

      Drupal.Backbone.Models.Comment = Drupal.Backbone.Models.Base.extend({
        urlRoot: "comment",
        idAttribute: "cid",

        // Override toJSON function to nest all attributes in a { comment: ... } key
        // to make this work with the Services module implementation of comment PUSH/PUT.
        toJSON: function() {
          var data = {
            comment: Drupal.Backbone.Models.Base.prototype.toJSON.call(this)
          };
          return data;
        }
      });

      Drupal.Backbone.Models.File = Drupal.Backbone.Models.Base.extend({
        urlRoot: "file",
        idAttribute: "fid",

        // Override toJSON function to nest all attributes in a { file: ... } key
        // to make this work with the Services module implementation of file PUSH/PUT.
        toJSON: function() {
          var data = {
            file: Drupal.Backbone.Models.Base.prototype.toJSON.call(this)
          };
          return data;
        }
      });

      // Legacy objects.
      // NOTE: These object references are deprecated and could go away!
      Drupal.Backbone.NodeModel = Drupal.Backbone.Models.Node;
      Drupal.Backbone.UserModel = Drupal.Backbone.Models.User;
      Drupal.Backbone.CommentModel = Drupal.Backbone.Models.Comment;
      Drupal.Backbone.FileModel = Drupal.Backbone.Models.File;

      // ## Drupal Backbone Collections
      //
      // Specific collections for Drupal listing types.

      // ### Drupal.Backbone.NodeIndexCollection
      //
      // Create collection for Node resource's index interface.
      Drupal.Backbone.Collections.NodeIndex = Drupal.Backbone.Collections.Base.extend({
        model: Drupal.Backbone.NodeModel,
        url: function() {
          return this.restEndpoint + "/node.json";
        }
      });

      // ### Drupal.Backbone.NodeViewCollection
      //
      // Create collection for Views resource's index interface.
      // Note that this is just for views that use the "Content" display
      // for their nodes.  Field views will need to be handled differently.
      //
      // May be worth considering if field views are really appropriate
      // for backbone, since it deals with collections of model objects,
      // and field views do not fit that mode.
      //
      // * TODO allow view name at initialization or fetch.
      // * TODO create basic view collection, subclass node and field views.
      Drupal.Backbone.Collections.NodeView = Drupal.Backbone.Collections.Base.extend({
        initialize: function(opts) {
	  opts = opts || {};
          this.constructor.__super__.initialize.call(this, opts);
          // TODO: debug why this is needed, model should be automatically passed.
          this.model = opts.model ? opts.model : Drupal.Backbone.Models.Node;
          this.viewName = opts.viewName;
        },
        url: function() {
          return this.restEndpoint + "/views/" + this.viewName + ".json";
        }
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
