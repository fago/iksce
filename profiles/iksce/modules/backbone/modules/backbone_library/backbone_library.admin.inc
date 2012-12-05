<?php
/**
 * @file
 * Admin form for backbone_libary module.
 */

/**
 * Settings form for the Backbone Library module.
 *
 * Allows admin user to specify on which pages the backbone.js
 * library should be loaded on.
 *
 * @todo Add conditional inclusion by path setting.
 *
 * @access public
 * @return Array
 *   Form API array, prepared by system_settings_form.
 */
function backbone_library_settings_form() {
  $form = module_invoke_all('backbone_settings_form');
  return system_settings_form($form);
}

function backbone_library_backbone_settings_form() {
  $form['backbone_compression_type'] = array(
    '#type' => 'radios',
    '#title' => t('Choose Backbone compression level'),
    '#options' => array(
      'min' => t('Production (Minified)'),
      'none' => t('Development (Uncompressed Code)'),
    ),
    '#default_value' => _backbone_variable_get('compression_type', 'min'),
  );

  $form['backbone_pages'] = array(
    '#type' => 'textarea',
    '#title' => t('Pages'),
    '#description' => t("Specify pages to add the backbone library to by using their paths. Enter one path per line. The '*' character is a wildcard. Example paths are %blog for the blog page and %blog-wildcard for every personal blog. %front is the front page.", array('%blog' => 'blog', '%blog-wildcard' => 'blog/*', '%front' => '<front>')),
    '#default_value' => variable_get('backbone_pages', ''),
  );
  $form['backbone_description'] = array(
    '#type' => 'item',
    '#markup' => '<p class="description">' . t("If you want to embed the library directly in your custom module you can just call drupal_add_library('backbone_library'));") . '</p>',
  );
  return $form;
}
