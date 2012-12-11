MAKEFLAGS = --no-print-directory --always-make
MAKE = make $(MAKEFLAGS)

DOCSRCS = js/drupalbackbone.js modules/backbone_example/js/backbone_example_app.js tests/backbone.test.js js/drupalbackbone-services.js

all:
	$(MAKE) docs;

minify:
	TODO	

docs:
	if test -e $(DOCSDIR)/docco.css; then mv $(DOCSDIR)/docco.css $(DOCSDIR)/_docco.css; fi
	docco $(DOCSRCS)
	if test -e $(DOCSDIR)/_docco.css; then mv $(DOCSDIR)/_docco.css $(DOCSDIR)/docco.css; fi

build:
	TODO w/ buildr

build-update:
	TODO w/ buildr

clean:
