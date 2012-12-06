(function ($) {

  root = this;
  Backbone = root.Backbone;
  _ = root._;
  VIE = root.VIE;

  logger = true ? console : {
    info: function() {},
    warn: function() {},
    error: function() {},
    log: function() {}
  };

  Drupal.behaviors.vie_autocomplete = {
    attach: function (context, settings) {

      var vie = new VIE();
      var service = new vie.StanbolService({
        url : "http://dev.iks-project.eu/stanbolfull",
        proxyDisabled: true
      });
      vie.use(service);

      $('.vie-autocomplete', context)
        .once('vie-autocomplete', function() {

          $(this).vieAutocomplete({
            vie: vie,
            select: function (e, ui) {

              console.log('You have selected ' + ui.item.value + "key" + ui.item.key);
              console.log(ui.item);
              var uri = ui.item.getUri();



            },
            showTooltip : false
          });
        })

    }
  };

})(jQuery);

$=jQuery;