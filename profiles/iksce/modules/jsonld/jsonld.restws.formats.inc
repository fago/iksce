<?php

/**
 * Formatters for all RDF serialization formats.
 */
class JsonldRestWSFormatJsonld extends RDFxRestWSBaseFormat {
  public function viewResource($resourceController, $id) {
    $rdf = rdfx_get_rdf_model($resourceController->resource(), $id);

    // Enable CORS on JSON-LD output.
    header("Access-Control-Allow-Origin: *");

    return json_encode(jsonld_fromrdf($rdf));
  }
}
