(function ($) {

  root = this;
  Backbone = root.Backbone;
  _ = root._;
  VIE = root.VIE;

  Drupal.behaviors.vie_autocomplete = {
    attach: function (context, settings) {

      var vie = new VIE();
      var service = new vie.StanbolService(settings.iksce.stanbol);
      vie.use(service);

      $('.vie-autocomplete', context)
        .once('vie-autocomplete', function() {
          var textfield = this;

          $(this).vieAutocomplete({
            vie: vie,
            select: function (e, ui) {

              // Read the name "field_tags[und][0][value]" and replace value.
              name = $(textfield).attr('name').replace('value', 'uri');
              $("input[name='" + name + "']").val(ui.item.getUri());
            },
            showTooltip : false
          });
        })
    }
  };

})(jQuery);

$=jQuery;