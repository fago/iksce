(function ($) {

  // Integrate with niceEdit editor.
  var selector = '.nicEdit-main';

  var options = {
    autoAccept : false,
    debug : true
  };

  logger = options.debug ? console : {
    info: function() {},
    warn: function() {},
    error: function() {},
    log: function() {}
  };

  var vie = new VIE();
  vie.use(new vie.StanbolService(Drupal.settings.iksce.stanbol));

  /**
   * annotate.js integration with Drupal and nicEdit
   */
  Drupal.iksce_annotate = {

    instantiate : function () {
      $(selector).annotate({
        vie: vie,
        // typeFilter: ["http://dbpedia.org/ontology/Place", "http://dbpedia.org/ontology/Organisation", "http://dbpedia.org/ontology/Person"],
        debug: options.debug,
        autoAnalyze: false,
        showTooltip: false,
        decline: function(event, ui){
          logger.info('decline event', event, ui);
        },
        select: function(event, ui){
          logger.info('select event', event, ui);
        },
        remove: function(event, ui){
          logger.info('remove event', event, ui);
        },
        success: function(event, ui){
          logger.info('success event', event, ui);
        },
        error: function(event, ui){
          logger.info('error event', event, ui);
        }
      });
      logger.log('annotated');
    },

    enable : function() {
      $(selector)
        .each(function() {
          $(this)
            .annotate('enable', function(success){
              if (success && options.autoAccept) {
                Drupal.iksce_annotate.acceptAll();
              }
              else if (!success) {
                logger.warn('No success.');
              }
            });
        });
    },

    acceptAll : function() {
      $(selector)
        .each(function() {
          $(this)
            .annotate('acceptAll', function(report) {
              logger.log('AcceptAll finished with the report:', report);
            });
        })
    }
  }


  Drupal.behaviors.iksce_annotate = {

    attach: function (context, settings) {

      Drupal.iksce_annotate.instantiate();
      Drupal.iksce_annotate.enable();
      console.log('run');
    }
  };

})(jQuery);

$=jQuery;
