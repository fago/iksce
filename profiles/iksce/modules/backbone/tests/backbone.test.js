(function($) {
  /**
   * # Test the DrupalBackbone library.
   */
  Drupal.tests.backbone = {
    getInfo: function() {
      return {
        name: 'Backbone',
        description: 'Tests the DrupalBackbone library for node loading, etc.',
        group: 'Backbone'
      };
    },
    test: function() {
      // Expect assertions contained in async calls.
      expect(26);
      var self = this;

      // Stop the test runner, we will restart when all of our async tests have completed.
      // TODO: Look into adding an asyncTest interface for Drupal QUnit.
      stop();

      // ## Test Infrastructure Setup
      //
      // ### Create Queue
      //
      // Create a jQuery queue to make nested asyn easier. (Otherwise these
      // would need to be nested within eachother).
      // TODO: Look into $.deffered for handling this more robustly.
      var asyncQueue = $({});

      // ### dequeueFuncs function
      //
      // A factory function that uses closures to produce success and error callbacks
      // for our Ajaj tests.
      var dequeueFuncs = function(msg) {
        return {
          success: function() {
            ok(true, Drupal.t(msg));
            asyncQueue.dequeue('asyncQueue');
          },
          error: function() {
            ok(false, Drupal.t(msg));
            // After erroring out, don't continue with tests.
            // TODO: determine how to clean up if we've created but not destroyed our test node.
            asyncQueue.clearQueue('asyncQueue');
            // Restart QUnit tests, continue on to next test.
            start();
          }
        };
      };

      // ## Drupal.Backbone.NodeModel Tests
      //
      // ### NodeModel Test Setup
      //
      // Create a node object to use in our testing.
      self.testNode = new Drupal.Backbone.Models.Node({
        'title': 'Backbone Test Node',
        'type': 'page'
      });

      // ### Test Node Create
      //
      // We use a queue to manage asynchronous processes, so each stage in the
      // CRUD runs after the prior callback has completed.
      //
      // * TODO Load that node and confirm create worked.
      asyncQueue.queue('asyncQueue', function() {
        self.testNode.save( {}, dequeueFuncs('Drupal CRUD REST call: Create Node'));
      });

      // ### Test Node Update
      //
      // * TODO Load node and test the update actually worked.
      asyncQueue.queue('asyncQueue', function() {
        self.testNode.set('title', 'Updated Title');
        self.testNode.save( {}, dequeueFuncs('Drupal CRUD REST call: Update Node'));
      });

      // ## Test Drupal.Backbone.Collection and children.
      //
      // ### Test Node Index
      //
      // Since we have a node created.
      self.testNodeIndexCollection = new Drupal.Backbone.Collections.NodeIndex();
      asyncQueue.queue('asyncQueue', function() {
        self.testNodeIndexCollection.setParam('pagesize', 1);
        self.testNodeIndexCollection.fetch(dequeueFuncs('Fetch Node Index collection'));
      });

      // ### Verify returned Node Index collection
      //
      // * TODO test offset/page number.
      asyncQueue.queue('asyncQueue', function() {
        equals(self.testNodeIndexCollection.length, 1, Drupal.t('Node Index fetch returned one node.'));
        equals(self.testNodeIndexCollection.at(0).get('title'), 'Updated Title', Drupal.t('Top node in Node Index is correct one.'));
        asyncQueue.dequeue('asyncQueue');
      });

      // Test pagesize=0, should always be empty.
      asyncQueue.queue('asyncQueue', function() {
        self.testNodeIndexCollection.setParam('pagesize', 0);
        self.testNodeIndexCollection.fetch(dequeueFuncs('Fetch empty Node Index collection'));
      });
      asyncQueue.queue('asyncQueue', function() {
        equals(self.testNodeIndexCollection.length, 0, Drupal.t('Node Index page size setting worked correctly, no nodes returned.'));
        asyncQueue.dequeue('asyncQueue');
      });

      // ### Test Views collection
      //
      // This is different from Backbone.View! We test collections holding node
      // views since we have a node created.
      var viewCollection = new Drupal.Backbone.Collections.NodeView();
      viewCollection.viewName = 'backbone_test';
      asyncQueue.queue('asyncQueue', function() {
        viewCollection.setParam('limit', 1);
        viewCollection.fetch(dequeueFuncs('Fetch View collection'));
      });

      // ### Test returned collection.
      // TODO test offset/page number.
      asyncQueue.queue('asyncQueue', function() {
        equals(viewCollection.length, 1, Drupal.t('View fetch returned one node.'));
        equals(viewCollection.at(0).get('title'), 'Updated Title',
               Drupal.t('Top node in View is correct one.'));
        asyncQueue.dequeue('asyncQueue');
      });

      // ## Drupal.Backbone.View tests
      //
      // ### Test View Render
      //
      // Test rendering a simple node view (Backbone.View, not Drupal views view).
      asyncQueue.queue('asyncQueue', function() {
        var TestView = Drupal.Backbone.Views.Base.extend({
          model: self.testNode,
          templateSelector: '#qunit-test-template',
          id: 'qunit-test-view-content'
        });
        $('body').append('<script id="qunit-test-template" type="text/underscore-template"><h2><%= title %></h2></script>');
        var view = new TestView();
        $('body').append(view.render().el);
        equals($('#qunit-test-view-content > h2').text(), self.testNode.get('title'),
               Drupal.t('Drupal.Backbone.Views.Base test template rendered successfully.'));
        view.unrender();
        $('#qunit-test-template').remove();
        asyncQueue.dequeue('asyncQueue');
      });

      // ## CommentModel Test
      //
      // ### Set up CommentModel Test Objects
      self.testComment = new Drupal.Backbone.Models.Comment({
        "subject": "Backbone QUnit Test Comment",
        "comment_body": {
          "und": [
            {
              value: "This is a test comment created by the Backbone module's QUnit tests."
            }
          ]
        },
        uid: 1
      });
      self.testCommentB = new Drupal.Backbone.Models.Comment();

      asyncQueue.queue('asyncQueue', function() {
        self.testComment.set('nid', self.testNode.get('nid'));
        self.testComment.save({}, dequeueFuncs('Drupal CRUD REST call: Comment CREATE'));
      });

      asyncQueue.queue('asyncQueue', function() {
        self.testCommentB.set('cid', self.testComment.get('cid'));
        self.testCommentB.fetch(dequeueFuncs('Drupal CRUD REST call: Comment READ'));
      });

      asyncQueue.queue('asyncQueue', function() {
        equals(self.testComment.get('subject'), self.testCommentB.get('subject'),
               Drupal.t('Confirmed that comment title saved and fetched correctly.'));
        self.testComment.set('subject', "UPDATED Backbone QUnit Test Comment");
        self.testComment.save({}, dequeueFuncs('Drupal CRUD REST call: Comment UPDATE'));
      });

      asyncQueue.queue('asyncQueue', function() {
        self.testCommentB.fetch().success(function() {
          asyncQueue.dequeue('asyncQueue');
        }).error(function() {
          ok(false, Drupal.t('Error loading updated comment, unexpected. Something is wrong.'));
        });
      });

      asyncQueue.queue('asyncQueue', function() {
        equals(self.testComment.get('subject'), self.testCommentB.get('subject'),
               Drupal.t('Confirmed that comment title updated and fetched correctly.'));
        self.testComment.destroy(dequeueFuncs('Drupal CRUD REST call: Comment DELETE'));
      });

      asyncQueue.queue('asynceQueue', function() {
        self.testCommentB.fetch().success(function() {
          ok(false, Drupal.t('Comment DELETE did not actually delete comment, able to load post-destroy.'));
          asyncQueue.dequeue('asyncQueue');
        }).error(function() {
          ok(true, Drupal.t('Confirmed that DELETE did in fact destroy object on server. Unable to load after destroy.'));
          asyncQueue.dequeue('asyncQueue');
        });
      });

      // ## Node (cont).
      //
      // ### Test Node delete.
      //
      // * TODO Attempt to load node again (should fail)
      asyncQueue.queue('asyncQueue', function() {
        self.testNode.destroy(dequeueFuncs('Drupal CRUD REST call: Destroy Node'));
      });

      // ## Test the User resource

      // Set up test objects.
      // Generate a uniq string so we don't have to worry about dups.
      var uniq = new Date().getTime().toString(36);
      var testUserValues = {
        "name": "backbone_test_user_" + uniq ,
        "pass": "backbone",
        "mail": "drupal-backbone-test@fakedomain-" + uniq + ".com"
      };
      self.testUser = new Drupal.Backbone.Models.User(testUserValues);
      var testLoadUser = new Drupal.Backbone.Models.User();
      var testUserIndexCollection = new Drupal.Backbone.UserIndexCollection();

      // ### Test User creation.
      //
      // Create a new user.
      asyncQueue.queue('asyncQueue', function() {
        self.testUser.save({}, dequeueFuncs('Drupal CRUD REST call: Create User'));
      });

      // ### Test User retrieval.
      //
      // Fetch our new user using another user object.
      asyncQueue.queue('asyncQueue', function() {
        testLoadUser.set('uid', self.testUser.get('uid'));
        testLoadUser.fetch(dequeueFuncs('Drupal CRUD REST call: Retrieve User'));
      });

      // ### Confirm User READ.
      asyncQueue.queue('asyncQueue', function() {
        equals(testLoadUser.get('name'), testUserValues.name, 'User name saved and retrieved correctly.');
        asyncQueue.dequeue('asyncQueue');
      });

      // ## User Collections Tests
      //
      // ### Test UserIndexCollection
      asyncQueue.queue('asyncQueue', function() {
        testUserIndexCollection.setParam('pagesize', 1);
        testUserIndexCollection.fetch(dequeueFuncs('Fetch User Index collection'));
      });

      // ### Verify returned User Index collection
      //
      // * TODO test offset/page number.
      asyncQueue.queue('asyncQueue', function() {
        equals(testUserIndexCollection.length, 1, Drupal.t('User Index fetch returned one user.'));
        equals(testUserIndexCollection.at(0).get('name'), testUserValues.name, Drupal.t('Top user in User Index is correct one.'));
        asyncQueue.dequeue('asyncQueue');
      });

      // ## UserModel (cont.)
      //
      // ### Test User DELETE
      asyncQueue.queue('asyncQueue', function() {
        self.testUser.destroy(dequeueFuncs('Drupal CRUD REST call: Delete User'));
      });

      // ### Check User DELETE
      //
      // Verify that our user was deleted in the server.
      //
      // Note that we're using the new jQuery deferreds approach to this,
      // because it's easier to write.  This introduces a dependency on
      // the jquery_update module, but if you're developing a Backbone app, you
      // should probably be using jquery_update anyhow.
      asyncQueue.queue('asyncQueue', function() {
        self.testUser.fetch().success(function(model, res) {
          ok(false, Drupal.t('User not deleted properly. Post-delete fetch was successful when should not be.'));
          asyncQueue.dequeue('asyncQueue');
        }).error(function() {
          ok(true, Drupal.t('User deleted in database. Could not retrieve after destroy.'));
          asyncQueue.dequeue('asyncQueue');
        });
      });


      // ## Test toggling of a boolean flag
      // Test for: http://drupal.org/node/1561292
      asyncQueue.queue('asyncQueue', function() {
        // create a new node model
        // fetch that node model
        // set the promote flag to 0
        // save
        // confirm that promote == 0
        ok(false, Drupal.t('TEST NEEDED: setting a boolean value to false and saving.'))
      });

      // ## End test.
      //
      // Last queue item: wrap up this test by restarting QUnit's asynchronous
      // testing.
      asyncQueue.queue('asyncQueue', function() {
        start();
      });

      // Run the queued operaitons: Go!
      asyncQueue.dequeue('asyncQueue');
    },

    // ## Teardown function
    //
    // Delete all objects created on the server again, just in case we have some
    // left over fixtures do to failed tests short circuiting the tests.
    teardown: function() {
      if (this.testNode) { this.testNode.destroy(); }
      if (this.testUser) { this.testUser.destroy(); }
      if (this.testComment) { this.testComment.destroy(); }
    }
  };
})(jQuery);
