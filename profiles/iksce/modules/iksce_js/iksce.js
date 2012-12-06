(function ($) {

  root = this;
  Backbone = root.Backbone;
  _ = root._;
  VIE = root.VIE;

  selector = '.field-name-body';
  logger = true ? console : {
    info: function() {},
    warn: function() {},
    error: function() {},
    log: function() {}
  };

  Drupal.behaviors.iksce_annotate = {
    attach: function (context, settings) {

      vie = new VIE();
      vie.use(new vie.StanbolService({
        url : "http://dev.iks-project.eu/stanbolfull",
        proxyDisabled: true
      }));

      // Instantiate annotate.js.
      function instantiate() {
        $(selector).annotate({
          vie: vie,
          // typeFilter: ["http://dbpedia.org/ontology/Place", "http://dbpedia.org/ontology/Organisation", "http://dbpedia.org/ontology/Person"],
          debug: true,
          autoAnalyze: false,
          showTooltip: true,
          decline: function(event, ui){
            console.info('decline event', event, ui);
          },
          select: function(event, ui){
            console.info('select event', event, ui);
          },
          remove: function(event, ui){
            console.info('remove event', event, ui);
          },
          success: function(event, ui){
            console.info('success event', event, ui);
          },
          error: function(event, ui){
            console.info('error event', event, ui);
          }
        });
        logger.log('annotated');
      }


      function enable() {
        $(selector)
          .each(function() {
            $(this)
              .annotate('enable', function(success){
                if(success){
                  logger.log('success');
                  acceptAll();
                }
                else {
                  logger.log('no success');
                }
              });
          });
      }

      function acceptAll() {
        $(selector)
          .each(function() {
            $(this)
              .annotate('acceptAll', function(report) {
              logger.log('AcceptAll finished with the report:', report);
          });
        })
      }

      instantiate();
      enable();
    }
  };

})(jQuery);

$=jQuery;
