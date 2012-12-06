(function ($) {

  root = this;
  Backbone = root.Backbone;
  _ = root._;
  VIE = root.VIE;
  var selector = '.field-name-body';

  Drupal.behaviors.iksce_entitypreview = {
    attach: function (context, settings) {

      var vie = new VIE();
      vie.use(new vie.StanbolService({
        url : "http://dev.iks-project.eu/stanbolfull",
        proxyDisabled: true
      }));

      $(selector + ' [about]')
        .entitypreview({
          vie: vie
        });
      console.log($(selector + ' [about]'));
    }
  };

})(jQuery);
