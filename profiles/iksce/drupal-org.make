core = 7.x
api = 2

; Modules
projects[admin_menu][version] = "3.0-rc3"
projects[backbone][version] = "1.x-dev"
projects[ctools][version] = "1.2"
projects[entity][version] = "1.0-rc3"
projects[entity_rdf][version] = "1.x-dev"
projects[entityreference][version] = "1.0"
projects[features][version] = "1.0"
projects[jquery_update][version] = "2.x-dev"
projects[libraries][version] = "2.0"
projects[link][version] = "1.0"
projects[module_filter][version] = "1.7"
projects[restws][version] = "2.0-alpha3"
projects[strongarm][version] = "2.0"
projects[wysiwyg][version] = "2.2"
projects[defaultcontent][version] = "1.x"
projects[rdfx][version] = "2.x"
projects[search_api][version] = "1.x-dev"
projects[search_api_stanbol][version] = "1.x-dev"
projects[vie][version] = "1.x-dev"

; http://drupal.org/node/1864074: rdfx does not find the arc library
projects[rdfx][patch][] = "http://drupal.org/files/rdfx_library_path.patch"

; Libraries
libraries[nicedit][download][type] = "get"
libraries[nicedit][download][url] = "http://js.nicedit.com/nicEdit-latest.js"
libraries[nicedit][directory_name] = "nicedit"
libraries[nicedit][download][filename] = "nicEdit.js"
libraries[nicedit][type] = "library"

libraries[nicediticons][download][type] = "get"
libraries[nicediticons][download][url] = "http://js.nicedit.com/nicEditIcons-latest.gif"
libraries[nicediticons][directory_name] = "nicedit"
libraries[nicediticons][download][filename] = "nicEditorIcons.gif"

libraries[ARC2][download][type] = "get"
libraries[ARC2][download][url] = "http://github.com/semsol/arc2/tarball/master"
libraries[ARC2][directory_name] = "ARC2/arc"
libraries[ARC2][type] = "library"

libraries[backbone][download][type] = "get"
libraries[backbone][download][url] = "http://documentcloud.github.com/backbone/backbone-min.js"
libraries[backbone][directory_name] = "backbone"
libraries[backbone][type] = "library"

libraries[underscore][download][type] = "get"
libraries[underscore][download][url] = "http://documentcloud.github.com/underscore/underscore-min.js"
libraries[underscore][directory_name] = "underscore"
libraries[underscore][type] = "library"

