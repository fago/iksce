diff --git a/README.txt b/README.txt
index a05bfa3..e78be4d 100644
--- a/README.txt
+++ b/README.txt
@@ -334,15 +334,6 @@ See the processors in includes/processor.inc for examples.
 Included components
 -------------------
 
-- Service classes
-
-  * Database search
-    A search server implementation that uses the normal database for indexing
-    data. It isn't very fast and the results might also be less accurate than
-    with third-party solutions like Solr, but it's very easy to set up and good
-    for smaller applications or testing.
-    See contrib/search_api_db/README.txt for details.
-
 - Data alterations
 
   * URL field
@@ -391,8 +382,6 @@ Included components
 
 - Additional modules
 
-  * Search pages
-    This module lets you create simple search pages for indexes.
   * Search views
     This integrates the Search API with the Views module [1], enabling the user
     to create views which display search results from any Search API index.
