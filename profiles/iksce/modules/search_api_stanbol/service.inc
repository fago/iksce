<?php

/**
 * Search service class using Stanbol server.
 */
class SearchApiStanbolService extends SearchApiAbstractService {

  public function __construct(SearchApiServer $server) {
    parent::__construct($server);
  }

  /**
   * Form callback. Might be called on an uninitialized object - in this case,
   * the form is for configuring a newly created server.
   *
   * Returns an empty form by default.
   *
   * @return array
   *   A form array for setting service-specific options.
   */
  public function configurationForm(array $form, array &$form_state) {
    if ($this->options) {
      // Editing this server
      $url = 'http://' . $this->options['host'] . ':' . $this->options['port'] . $this->options['path'];
      $form['server_description'] = array(
        '#type' => 'item',
        '#title' => t('Stanbol EntityHub service endpoint'),
        '#description' => l($url, $url),
      );
    }

    $options = $this->options + array(
      'host' => 'localhost',
      'port' => '8080',
      'path' => '/entityhub/entity',
      'http_user' => '',
      'http_pass' => '',
    );

    $form['host'] = array(
      '#type' => 'textfield',
      '#title' => t('Stanbol host'),
      '#description' => t('The host name or IP of your Stanbol server, e.g. <code>localhost</code> or <code>www.example.com</code>.'),
      '#default_value' => $options['host'],
      '#required' => TRUE,
    );
    $form['port'] = array(
      '#type' => 'textfield',
      '#title' => t('Stanbol port'),
      '#description' => t('The Jetty example server is at port 8983, while Tomcat uses 8080 by default.'),
      '#default_value' => $options['port'],
      '#required' => TRUE,
    );
    $form['path'] = array(
      '#type' => 'textfield',
      '#title' => t('Stanbol path'),
      '#description' => t('The path that identifies the Stanbol instance to use on the server.'),
      '#default_value' => $options['path'],
    );

    $form['http'] = array(
      '#type' => 'fieldset',
      '#title' => t('Basic HTTP authentication'),
      '#description' => t('If your Stanbol server is protected by basic HTTP authentication, enter the login data here.'),
      '#collapsible' => TRUE,
      '#collapsed' => empty($options['http_user']),
    );
    $form['http']['http_user'] = array(
      '#type' => 'textfield',
      '#title' => t('Username'),
      '#default_value' => $options['http_user'],
    );
    $form['http']['http_pass'] = array(
      '#type' => 'password',
      '#title' => t('Password'),
      '#default_value' => $options['http_pass'],
    );

    return $form;
  }

  /**
   * Validation callback for the form returned by configurationForm().
   *
   * Does nothing by default.
   *
   * @param array $form
   *   The form returned by configurationForm().
   * @param array $values
   *   The part of the $form_state['values'] array corresponding to this form.
   * @param array $form_state
   *   The complete form state.
   */
  public function configurationFormValidate(array $form, array &$values, array &$form_state) {
    if (isset($values['port']) && (!is_numeric($values['port']) || $values['port'] < 0 || $values['port'] > 65535)) {
      form_error($form['port'], t('The port has to be an integer between 0 and 65535.'));
    }
  }

  /**
   * Submit callback for the form returned by configurationForm().
   *
   * The default implementation just ensures that additional elements in
   * $options, not present in the form, don't get lost at the update.
   *
   * @param array $form
   *   The form returned by configurationForm().
   * @param array $values
   *   The part of the $form_state['values'] array corresponding to this form.
   * @param array $form_state
   *   The complete form state.
   */
  public function configurationFormSubmit(array $form, array &$values, array &$form_state) {
    // Since the form is nested into another, we can't simply use #parents for
    // doing this array restructuring magic. (At least not without creating an
    // unnecessary dependency on internal implementation.)
    $values += $values['http'];
    unset($values['http']);

    parent::configurationFormSubmit($form, $values, $form_state);
  }

  /**
   * View this server's settings. Output can be HTML or a render array, a <dl>
   * listing all relevant settings is preferred.
   *
   * The default implementation does a crude output as a definition list, with
   * option names taken from the configuration form.
   */
  public function viewSettings() {
    $output = '';
    $options = $this->options;

    $url = 'http://' . $options['host'] . ':' . $options['port'] . $options['path'];
    $output .= "<dl>\n  <dt>";
    $output .= t('Stanbol server URI');
    $output .= "</dt>\n  <dd>";
    $output .= l($url, $url);
    $output .= '</dd>';
    if ($options['http_user']) {
      $output .= "\n  <dt>";
      $output .= t('Basic HTTP authentication');
      $output .= "</dt>\n  <dd>";
      $output .= t('Username: @user', array('@user' => $options['http_user']));
      $output .= "</dd>\n  <dd>";
      $output .= t('Password: @pass', array('@pass' => str_repeat('*', strlen($options['http_pass']))));
      $output .= '</dd>';
    }
    $output .= "\n</dl>";

    return $output;
  }

  /**
   * Add a new index to this server.
   *
   * @param SearchApiIndex $index
   *   The index to add.
   */
  public function addIndex(SearchApiIndex $index) {
    if (module_exists('search_api_multi') && module_exists('search_api_views')) {
      views_invalidate_cache();
    }
  }

  /**
   * Notify the server that the indexed field settings for the index have
   * changed.
   * If any user action is necessary as a result of this, the method should
   * use drupal_set_message() to notify the user.
   *
   * @param SearchApiIndex $index
   *   The updated index.
   *
   * @return
   *   TRUE, if this change affected the server in any way that forces it to
   *   re-index the content. FALSE otherwise.
   */
  public function fieldsUpdated(SearchApiIndex $index) {
    if (module_exists('search_api_multi') && module_exists('search_api_views')) {
      views_invalidate_cache();
    }
    return TRUE;
  }

  /**
   * Index the specified items.
   *
   * @param SearchApiIndex $index
   *   The search index for which items should be indexed.
   * @param array $items
   *   An array of items to be indexed, keyed by their id. The values are
   *   associative arrays of the fields to be stored, where each field is an
   *   array with the following keys:
   *   - type: One of the data types recognized by the Search API, or the
   *     special type "tokens" for fulltext fields.
   *   - original_type: The original type of the property, as defined by the
   *     datasource controller for the index's item type.
   *   - value: The value to index.
   *
   *   The special field "search_api_language" contains the item's language and
   *   should always be indexed.
   *
   *   The value of fields with the "tokens" type is an array of tokens. Each
   *   token is an array containing the following keys:
   *   - value: The word that the token represents.
   *   - score: A score for the importance of that word.
   *
   * @return array
   *   An array of the ids of all items that were successfully indexed.
   *
   * @throws SearchApiException
   *   If indexing was prevented by a fundamental configuration error.
   */
  public function indexItems(SearchApiIndex $index, array $items) {
    $documents = array();
    $ret = array();

    foreach ($items as $id => $item) {
      try {
        // Builds an RDF resource for the entity.
        $documents[] = rdfx_get_rdf_model($index->item_type, $id);
        $ret[] = $id;
      }
      catch (Exception $e) {
        watchdog_exception('search_api_stanbol', $e, "%type while indexing @type with ID @id: !message in %function (line %line of %file).", array('@type' => $index->item_type, '@id' => $id), WATCHDOG_WARNING);
      }
    }

    if (!$documents) {
      return array();
    }

    try {
      // Merges resources together.
      $resources = $this->getMergedResources($documents);

      // Serializes resources as RDF/XML, a format that is supported by Stanbol.
      $serializer = ARC2::getSer('RDFXML', array('ns' => $resources->ns));
      $resources_rdfxml = $serializer->getSerializedIndex($resources->index);

      // Sends RDF data to Stanbol EntityHub service endpoint.
      $options = $this->options;
      $endpoint_url = 'http://' . $options['host'] . ':' . $options['port'] . $options['path'];

      $request_options = array(
        'method' => 'PUT',
        'data' => $resources_rdfxml,
        'headers' => array('Content-Type' => 'application/rdf+xml'),
      );
      $response = drupal_http_request($endpoint_url, $request_options);
      // Supports multiple OK status codes as the Stanbol API keeps changing.
      if ($response->code == 200 || $response->code == 201 || $response->code == 204) {
        return $ret;
      }
      throw new SearchApiException(t('HTTP status @status: @msg.',
          array('@status' => $response->code, '@msg' => $response->status_message)));
    }
    catch (Exception $e) {
      watchdog_exception('search_api_stanbol', $e, "%type while indexing: !message in %function (line %line of %file).");
    }
    return array();
  }

  /**
   * Returns an ARC2 resource composed of the merge of input resources.
   */
  public function getMergedResources(array $resources) {
    $index = array();
    $ns = array();
    $collection = new ARC2_Resource();

    foreach ($resources as $resource) {
      // Merge namespaces.
      $ns = array_merge($ns, $resource->ns);
      // Merge indexes.
      foreach ($resource->index as $s => $ps) {
        if (!isset($index[$s])) $index[$s] = array();
        foreach ($ps as $p => $os) {
          if (!isset($index[$s][$p])) $index[$s][$p] = array();
          foreach ($os as $o) {
            if (!in_array($o, $index[$s][$p])) {
              $index[$s][$p][] = $o;
            }
          }
        }
      }
    }

    $collection->ns = $ns;
    $collection->index = $index;

    return $collection;
  }

  /**
   * Delete items from an index on this server.
   *
   * Might be either used to delete some items (given by their ids) from a
   * specified index, or all items from that index, or all items from all
   * indexes on this server.
   *
   * This method has a custom, Solr-specific extension:
   * If $ids is a string other than "all", it is treated as a Solr query. All
   * items matching that Solr query are then deleted. If $index is additionally
   * specified, then only those items also lying on that index will be deleted.
   * It is up to the caller to ensure $ids is a valid query when the method is
   * called in this fashion.
   *
   * @param $ids
   *   Either an array containing the ids of the items that should be deleted,
   *   or 'all' if all items should be deleted. Other formats might be
   *   recognized by implementing classes, but these are not standardized.
   * @param SearchApiIndex $index
   *   The index from which items should be deleted, or NULL if all indexes on
   *   this server should be cleared (then, $ids has to be 'all').
   */
  public function deleteItems($ids = 'all', SearchApiIndex $index = NULL) {
    try {
      // We only support one index per EntityHub service endpoint for now.
      // Does Stanbol support multiple indexes per endpoint anyways?
      // Sends RDF data to Stanbol EntityHub service endpoint.
      $options = $this->options;
      $endpoint_url = 'http://' . $options['host'] . ':' . $options['port'] . $options['path'];

      $request_options = array(
        'method' => 'DELETE',
        'headers' => array('Content-Type' => 'application/rdf+xml'),
      );
      // @todo support individual item deletion.
      $response = drupal_http_request($endpoint_url . '?id=*', $request_options);
      if ($response->code != 200) {
        throw new SearchApiException(t('HTTP status @status: @msg.',
          array('@status' => $response->code, '@msg' => $response->status_message)));
      }

    }
    catch(Exception $e) {
      watchdog_exception('search_api_solr', $e, '%type while deleting items from server @server: !message in %function (line %line of %file).', array('@server' => $this->server->name));
    }
  }

  public function search(SearchApiQueryInterface $query) {
    throw new SearchApiException(t('The Stanbol search API service does not support search. Please query the Stanbol EntityHub directly.'));
  }

}
