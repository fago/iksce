(function ($) {

  // Integrate with niceEdit editor.
  var selector = '.nicEdit-main';

  var options = {
    autoAccept : true,
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

    enable : function(button) {
      $(button).find('.text').html('...');
      $(button).closest('.form-textarea-wrapper').find(selector)
        .each(function() {
          var content = this;
          $(content)
            .annotate('enable', function(success) {
              $(button).find('.text').html(Drupal.t('Annotate'));
              logger.log('finished')

              if (success && options.autoAccept) {
                Drupal.iksce_annotate.acceptAll(content);
              }
              else if (!success) {
                $(button).find('.text').html(Drupal.t('Error!'));
                logger.warn('No success.');
              }
            });
        });
    },

    acceptAll : function(content) {
      $(content).annotate('acceptAll', function(report) {
        logger.log('AcceptAll finished with the report:', report);
      });
    }
  }


  Drupal.behaviors.iksce_annotate = {

    attach: function (context, settings) {

      var image = Drupal.settings.basePath + 'profiles/iksce/libraries/nicedit/nicEditorIcons.gif';

      // Add a custom button to niceEdit. Ugly html copied over and adapted.
      $('.nicEdit-panel').once('iksce_annotate').append(
        '<div style="float: left; margin-top: 2px;">' +
          '<div style="height: 20px; opacity: 1;" class=" nicEdit-buttonContain      nicEdit-buttonEnabled">' +
          '<div style="margin: 0px 5px; background-color: rgb(239, 239, 239); border: 1px solid rgb(239, 239, 239);" class=" nicEdit-button-undefined nicEdit-button-hover nicEdit-button-active">' +
          '<div class="text" style="height: 18px; overflow: hidden; cursor: pointer;" class=" nicEdit-button" unselectable="on">' + Drupal.t('Annotate') + '</div>' +
          '</div></div></div>').bind('click', function() {

          Drupal.iksce_annotate.instantiate();
          Drupal.iksce_annotate.enable(this);
        });


      console.log('init');
    }
  };

})(jQuery);

$=jQuery;
