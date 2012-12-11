; Drush Make file for downloading the libraries
api = 2
core = 7.x

libraries[vie][download][type] = "get"
libraries[vie][download][url] = "https://raw.github.com/bergie/VIE/gh-pages/js/vie-2.1.0.js"
libraries[vie][directory_name] = "vie"
libraries[vie][type] = "library"

libraries[vie.autocomplete][download][type] = "get"
libraries[vie.autocomplete][download][url] = "https://raw.github.com/szabyg/VIE.autocomplete/6cf1536a0d5ce30e184fd32115e867073a596f69/lib/vie.autocomplete.js"
libraries[vie.autocomplete][directory_name] = "vie"
libraries[vie.autocomplete][type] = "library"

libraries[vie.annotate][download][type] = "get"
libraries[vie.annotate][download][url] = "https://raw.github.com/szabyg/annotate.js/gh-pages/lib/annotate.js"
libraries[vie.annotate][directory_name] = "vie"
libraries[vie.annotate][type] = "library"
