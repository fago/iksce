<?php
/**
 * Implementation of hook_features_export().
 *
 * Defines one or more component types that are available to Features for export
 * and a variety of settings for each type.
 */
function rdf_mappings_features_export($data, &$export, $module_name = '') {
  // Any feature exporting RDF mappings need the rdf and rdfx modules.
  $export['dependencies']['rdf'] = 'rdf';
  $export['dependencies']['rdfx'] = 'rdfx';

  foreach ($data as $name) {
    $parts = explode(':', $name);
    $entity_type = $parts[0];
    $bundle_name = $parts[1];
    $property = !empty($parts[2]) ? $parts[2] : NULL;

    $rdf_mapping = rdf_mapping_load($entity_type, $bundle_name);
    if (!empty($rdf_mapping['rdftype']) && empty($property)) {
      $export['features']['rdf_mappings'][$entity_type . ':' . $bundle_name] = $rdf_mapping['rdftype'];
    }
    elseif (!empty($rdf_mapping[$property])) {
      $export['features']['rdf_mappings'][$entity_type . ':' . $bundle_name . ':' . $property] = $rdf_mapping[$property];
    }
  }

  return array();
}

/**
 * Implementation of hook_features_export_options().
 *
 * Provides an array of components that can be exported for a given type.
 */
function rdf_mappings_features_export_options() {
  $options = array();
  foreach (entity_get_info() as $entity_type => $entity) {
    foreach ($entity['bundles'] as $bundle_name => $bundle) {
      foreach (rdf_mapping_load($entity_type, $bundle_name) as $name => $mapping) {
        if ($name == 'rdftype') {
          $options[$entity_type . ':' . $bundle_name] = $entity_type . ':' . $bundle_name;
        }
        else {
          $options[$entity_type . ':' . $bundle_name . ':' . $name] = $entity_type . ':' . $bundle_name . ':' . $name;
        }
      }
    }
  }

  return $options;
}

/**
 * Implementation of hook_features_export_render().
 *
 * Renders a set of components to code as a defaults hook.
 */
function rdf_mappings_features_export_render($module, $data, $export = NULL) {
  $code = array();
  $code[] = '  $rdf_mappings = array();';
  $code[] = '';

  foreach ($data as $key => $entity_type_bundle) {
    if (is_array($entity_type_bundle)) {
      $entity_type_bundle = $key;
    }

    $var = array();
    $parts = explode(':', $entity_type_bundle);
    $entity_type = $parts[0];
    $bundle_name = $parts[1];
    $property = !empty($parts[2]) ? $parts[2] : NULL;
    $rdf_mapping = rdf_mapping_load($entity_type, $bundle_name);

    if (!empty($rdf_mapping['rdftype']) && empty($property)) {
      $component = $entity_type . ':' . $bundle_name;
      $var['rdf types'] = $rdf_mapping['rdftype'];
    }
    elseif (!empty($rdf_mapping[$property])) {
      $component = $entity_type . ':' . $bundle_name . ':' . $property;
      $var['rdf properties'] = $rdf_mapping[$property]['predicates'];
      if (!empty($rdf_mapping[$property]['datatype'])) {
        $var['rdf value datatype'] = $rdf_mapping[$property]['datatype'];
      }
      if (!empty($rdf_mapping[$property]['callback'])) {
        $var['rdf value callback'] = $rdf_mapping[$property]['callback'];
      }
    }
    if ($var) {
      $var_export = features_var_export($var, '  ');
      $code[] = "  // Exported Entity RDF mapping: {$component}";
      $code[] = "  \$rdf_mappings['$component'] = $var_export;";
      $code[] = "";
    }
  }

  $code[] = '  return $rdf_mappings;';
  $code = implode("\n", $code);
  return array('rdf_default_mappings' => $code);
}

/**
 * Implementation of hook_features_revert().
 *
 * Reverts components of a feature back to their default state.
 */
function rdf_mappings_features_revert($module) {
  return rdf_mappings_features_rebuild($module);
}

/**
 * Implementation of hook_features_rebuild().
 *
 * Updates faux-exportable components back to their default state.
 */
function rdf_mappings_features_rebuild($module) {
  // not supported.
}
