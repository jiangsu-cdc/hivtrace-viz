var d3 = require("d3"),
  _ = require("underscore"),
  jsConvert = require("js-convert-case"),
  topojson = require("topojson");

var misc = require("./misc"),
  helpers = require("./helpers"),
  colorPicker = require("./colorPicker"),
  scatterPlot = require("./scatterplot"),
  utils = require("./utils"),
  tables = require("./tables"),
  timeDateUtil = require("./timeDateUtil"),
  nodesTab = require("./nodesTab"),
  clustersOfInterest = require("./clustersOfInterest");


const _networkSubclusterSeparator = ".";
var _networkGraphAttrbuteID = "patient_attribute_schema";
var _networkNodeAttributeID = "patient_attributes";
var _networkMissing = __("general")["missing"];
var _networkReducedValue = "Different (other) value";
var _networkMissingOpacity = "0.1";
var _networkMissingColor = "#999";
var _networkContinuousColorStops = 9;
export var _networkWarnExecutiveMode =
  "This feature is not available in the executive mode.";

var _networkShapeOrdering = [
  "circle",
  "square",
  "hexagon",
  "diamond",
  "cross",
  "octagon",
  "ellipse",
  "pentagon",
];

var _defaultFloatFormat = d3.format(",.2r");
var _defaultPercentFormat = d3.format(",.3p");
var _defaultPercentFormatShort = d3.format(".2p");
export var _defaultDateFormats = [d3.time.format.iso];

var _defaultDateViewFormat = d3.time.format("%b %d, %Y");
var _defaultDateViewFormatShort = d3.time.format("%B %Y");
export var _defaultDateViewFormatSlider = d3.time.format("%Y-%m-%d");
var _networkDotFormatPadder = d3.format("08d");
var _defaultDateViewFormatExport = d3.time.format("%m/%d/%Y");
var _defaultDateViewFormatClusterCreate = d3.time.format("%Y%m");

var _networkCategoricalBase = [
  "#a6cee3",
  "#1f78b4",
  "#b2df8a",
  "#33a02c",
  "#fb9a99",
  "#e31a1c",
  "#fdbf6f",
  "#ff7f00",
  "#cab2d6",
  "#6a3d9a",
  "#ffff99",
  "#b15928",
];

var _networkEdgeColorBase = ["#000000", "#aaaaaa"];

var _networkCategorical = [];

_.each([0, -0.8], function (k) {
  _.each(_networkCategoricalBase, function (s) {
    _networkCategorical.push(d3.rgb(s).darker(k).toString());
  });
});

var _maximumValuesInCategories = _networkCategorical.length;

var _networkSequentialColor = {
  2: ["#feb24c", "#e31a1c"],
  3: ["#ffeda0", "#feb24c", "#f03b20"],
  4: ["#ffffb2", "#fecc5c", "#fd8d3c", "#e31a1c"],
  5: ["#ffffb2", "#fecc5c", "#fd8d3c", "#f03b20", "#bd0026"],
  6: ["#ffffb2", "#fed976", "#feb24c", "#fd8d3c", "#f03b20", "#bd0026"],
  7: [
    "#ffffb2",
    "#fed976",
    "#feb24c",
    "#fd8d3c",
    "#fc4e2a",
    "#e31a1c",
    "#b10026",
  ],
  8: [
    "#ffffcc",
    "#ffeda0",
    "#fed976",
    "#feb24c",
    "#fd8d3c",
    "#fc4e2a",
    "#e31a1c",
    "#b10026",
  ],
  9: [
    "#ffffcc",
    "#ffeda0",
    "#fed976",
    "#feb24c",
    "#fd8d3c",
    "#fc4e2a",
    "#e31a1c",
    "#bd0026",
    "#800026",
  ],
};

/*
Sex/Transmission Risk

IDU= blue
Heterosexual= green
Perinatal, child= red
MMSC= orange
Other= grey (leave as-is)*/

var _networkPresetColorSchemes = {
  sex_trans: {
    "MSM-Male": "#1f78b4",
    "MMSC-Male": "#FFBF00",
    "MSM-Unknown sex": "#1f78b4",
    "MMSC-Unknown sex": "#FFBF00",
    "Heterosexual Contact-Male": "#AAFF00",
    "Heterosexual Contact-Female": "#AAFF00",
    "Heterosexual Contact-Unknown sex": "#AAFF00",
    "IDU-Male": "#0096FF",
    "MSM & IDU-Male": "#33a02c",
    "MMSC & IDU-Unknown sex": "#0096FF",
    "MMSC & IDU-Male": "#FFBF00",
    "IDU-Female": "#0096FF",
    "IDU-Unknown sex": "#0096FF",
    "Other/Unknown-Male": "#636363",
    "Other/Unknown-Female": "#636363",
    "Other-Male": "#636363",
    "Other-Female": "#636363",
    Missing: "#636363",
    "": "#636363",
    "Other/Unknown-Unknown sex": "#636363",
    Perinatal: "#D2042D",
    "Other/Unknown-Child": "#D2042D",
    "Other-Child": "#D2042D",
  },

  race_cat: {
    Asian: "#1f77b4",
    "Black/African American": "#bcbd22",
    "Hispanic/Latino": "#9467bd",
    "American Indian/Alaska Native": "#2ca02c",
    "Native Hawaiian/Other Pacific Islander": "#17becf",
    "Multiple Races": "#e377c2",
    Multiracial: "#e377c2",
    "Multiple races": "#e377c2",
    "Unknown race": "#999",
    Missing: "#999",
    missing: "#999",
    White: "#d62728",
  },
  sex_birth: {
    Male: "#FF6700",
    Female: "#50c878",
    Unknown: "#999",
  },
  birth_sex: {
    Male: "#FF6700",
    Female: "#50c878",
    Unknown: "#999",
  },

  gender_identity: {
    Woman: "#AAFF00",
    "Transgender woman": "#228B22",
    Man: "#FFBF00",
    "Transgender man": "#FF5F1F",
    "Declined to answer": "#FAFA33",
    "Additional gender identity": "#D2042D",
    Missing: "#999",
    Unknown: "#999",
  },
};

var _networkPresetShapeSchemes = {
  birth_sex: {
    Male: "square",
    Female: "ellipse",
    Missing: "diamond",
    missing: "diamond",
    Unknown: "diamond",
  },
  sex_birth: {
    Male: "square",
    Female: "ellipse",
    Missing: "diamond",
    missing: "diamond",
    Unknown: "diamond",
  },
  gender_identity: {
    Man: "square",
    Woman: "ellipse",
    "Transgender man": "hexagon",
    "Transgender woman": "circle",
    "Additional gender identity": "pentagon",
    Unknown: "diamond",
    "Declined to answer": "diamond",
    Unknown: "diamond",
  },
  race_cat: {
    Asian: "hexagon",
    "Black/African American": "square",
    "Hispanic/Latino": "triangle",
    "American Indian/Alaska Native": "pentagon",
    "Native Hawaiian/Other Pacific Islander": "octagon",
    "Multiple Races": "diamond",
    "Unknown race": "diamond",
    Missing: "diamond",
    missing: "diamond",
    White: "ellipse",
  },
  current_gender: {
    Male: "square",
    Female: "ellipse",
    "Transgender-Male to Female": "hexagon",
    "Transgender-Female to Male": "pentagon",
    "Additional Gender Identity": "diamond",
    Unknown: "diamond",
    Missing: "diamond",
    missing: "diamond",
  },
};

export var _cdcPrioritySetKind = [
  "01 state/local molecular cluster analysis",
  "02 national molecular cluster analysis",
  "03 state/local time-space cluster analysis",
  "04 national time-space cluster analysis",
  "05 provider notification",
  "06 partner services notification",
  "07 other",
];

export var _cdcTrackingOptions = [
  "01. Add cases diagnosed in the past 3 years and linked at 0.5% to a member in this cluster of interest",
  "02. Add cases (regardless of HIV diagnosis date) linked at 0.5% to a member in this cluster of interest",
  "03. Add cases diagnosed in the past 3 years and linked at 1.5% to a member in this cluster of interest",
  "04. Add cases (regardless of HIV diagnosis date) linked at 1.5% to a member in this cluster of interest",
  "05. Do not add cases to this cluster of interest. I do not want to monitor growth in this cluster of interest over time.",
];

var _cdcConciseTrackingOptions = {};
_cdcConciseTrackingOptions[_cdcTrackingOptions[0]] = "3 years, 0.5% distance";
_cdcConciseTrackingOptions[_cdcTrackingOptions[1]] = "0.5% distance";
_cdcConciseTrackingOptions[_cdcTrackingOptions[2]] = "3 years, 1.5% distance";
_cdcConciseTrackingOptions[_cdcTrackingOptions[3]] = "1.5% distance";
_cdcConciseTrackingOptions[_cdcTrackingOptions[4]] = "None";

var _cdcTrackingOptionsFilter = {};
_cdcTrackingOptionsFilter[_cdcTrackingOptions[0]] = (e, d) => e.length < 0.005;
_cdcTrackingOptionsFilter[_cdcTrackingOptions[1]] = (e, d) => e.length < 0.005;
_cdcTrackingOptionsFilter[_cdcTrackingOptions[2]] = (e, d) => e.length < 0.015;
_cdcTrackingOptionsFilter[_cdcTrackingOptions[3]] = (e, d) => e.length < 0.015;

var _cdcTrackingOptionsCutoff = {};
_cdcTrackingOptionsCutoff[_cdcTrackingOptions[0]] = 36;
_cdcTrackingOptionsCutoff[_cdcTrackingOptions[1]] = 100000;
_cdcTrackingOptionsCutoff[_cdcTrackingOptions[2]] = 36;
_cdcTrackingOptionsCutoff[_cdcTrackingOptions[3]] = 100000;

export var _cdcTrackingOptionsDefault = _cdcTrackingOptions[0];
export var _cdcTrackingNone = _cdcTrackingOptions[4];

export var _cdcCreatedBySystem = "System";
export var _cdcCreatedByManual = "Manual";

var _cdcPrioritySetKindAutoExpand = {
  "01 state/local molecular cluster analysis": true,
};

export var _cdcPrioritySetNodeKind = [
  "01 through analysis/notification",
  "02 through investigation",
];

var _cdcPOImember = "Ever in national priority clusterOI?";

var _cdcJurisdictionCodes = {
  alabama: "al",
  alaska: "ak",
  americansamoa: "as",
  arizona: "az",
  arkansas: "ar",
  california: "ca",
  colorado: "co",
  connecticut: "ct",
  delaware: "de",
  districtofcolumbia: "dc",
  federatedstatesofmicronesia: "fm",
  florida: "fl",
  georgia: "ga",
  guam: "gu",
  hawaii: "hi",
  houston: "hx",
  idaho: "id",
  illinois: "il",
  indiana: "in",
  iowa: "ia",
  kansas: "ks",
  kentucky: "ky",
  louisiana: "la",
  maine: "me",
  marshallislands: "mh",
  maryland: "md",
  massachusetts: "ma",
  michigan: "mi",
  minnesota: "mn",
  mississippi: "ms",
  missouri: "mo",
  montana: "mt",
  nebraska: "ne",
  nevada: "nv",
  newhampshire: "nh",
  newjersey: "nj",
  newmexico: "nm",
  newyorkstate: "ny",
  nyc: "nx",
  northcarolina: "nc",
  north_dakota: "nd",
  northernmarianaislands: "mp",
  ohio: "oh",
  oklahoma: "ok",
  oregon: "or",
  palau: "pw",
  pennsylvania: "pa",
  puertorico: "pr",
  rhodeisland: "ri",
  southcarolina: "sc",
  southdakota: "sd",
  tennessee: "tn",
  texas: "tx",
  utah: "ut",
  vermont: "vt",
  virginislands: "vi",
  virginia: "va",
  washington: "wa",
  washingtondc: "dc",
  westvirginia: "wv",
  wisconsin: "wi",
  wyoming: "wy",
  chicago: "cx",
  philadelphia: "px",
  losangeles: "lx",
  sanfrancisco: "sx",
  americansamoa: "as",
  guam: "gu",
  republicofpalau: "pw",
  "u.s.virginislands": "vi",
};

const CDCJurisdictionLowMorbidity = new Set([
  "alaska",
  "delaware",
  "hawaii",
  "idaho",
  "iowa",
  "kansas",
  "maine",
  "montana",
  "nebraska",
  "new hampshire",
  "newhampshire",
  "new mexico",
  "newmexico",
  "north dakota",
  "northdakota",
  "rhode island",
  "rhodeisland",
  "south dakota",
  "southdakota",
  "utah",
  "vermont",
  "virgin islands",
  "virginislands",
  "west virginia",
  "westvirginia",
  "wyoming",
]);

const _cdcPrioritySetKindAutomaticCreation = _cdcPrioritySetKind[0];
export const _cdcPrioritySetDefaultNodeKind = _cdcPrioritySetNodeKind[0];

// Constants for the map.

var hivtrace_date_or_na_if_missing = (date, formatter) => {
  formatter = formatter || _defaultDateViewFormatExport;
  if (date) {
    return formatter(date);
  }
  return "N/A";
};

// TODO: convert and save this data rather than do it each time.

var hivtrace_cluster_depthwise_traversal = function (
  nodes,
  edges,
  edge_filter,
  save_edges,
  seed_nodes,
  white_list
  // an optional set of node IDs (a subset of 'nodes') that will be considered for traversal
  // it is further assumed that seed_nodes are a subset of white_list, if the latter is specified
) {
  var clusters = [],
    adjacency = {},
    by_node = {};

  seed_nodes = seed_nodes || nodes;

  _.each(nodes, function (n) {
    n.visited = false;
    adjacency[n.id] = [];
  });

  if (edge_filter) {
    edges = _.filter(edges, edge_filter);
  }

  if (white_list) {
    edges = _.filter(edges, (e) => {
      return (
        white_list.has(nodes[e.source].id) && white_list.has(nodes[e.target].id)
      );
    });
  }

  _.each(edges, function (e) {
    try {
      adjacency[nodes[e.source].id].push([nodes[e.target], e]);
      adjacency[nodes[e.target].id].push([nodes[e.source], e]);
    } catch (err) {
      throw (
        "Edge does not map to an existing node " + e.source + " to " + e.target
      );
    }
  });

  var traverse = function (node) {
    if (!(node.id in by_node)) {
      clusters.push([node]);
      by_node[node.id] = clusters.length - 1;
      if (save_edges) {
        save_edges.push([]);
      }
    }
    node.visited = true;

    _.each(adjacency[node.id], function (neighbor) {
      if (!neighbor[0].visited) {
        by_node[neighbor[0].id] = by_node[node.id];
        clusters[by_node[neighbor[0].id]].push(neighbor[0]);
        if (save_edges) {
          save_edges[by_node[neighbor[0].id]].push(neighbor[1]);
        }
        traverse(neighbor[0]);
      }
    });
  };

  _.each(seed_nodes, function (n) {
    if (!n.visited) {
      traverse(n);
    }
  });

  return clusters;
};

var _networkUpperBoundOnDate = new Date().getFullYear();

var hivtrace_cluster_network_graph = function (
  json,
  network_container,
  network_status_string,
  network_warning_tag,
  button_bar_ui,
  attributes,
  filter_edges_toggle,
  clusters_table,
  nodes_table,
  parent_container,
  options
) {
  // [REQ] json                        :          the JSON object containing network nodes, edges, and meta-information
  // [REQ] network_container           :          the CSS selector of the DOM element where the SVG containing the network will be placed (e.g. '#element')
  // [OPT] network_status_string       :          the CSS selector of the DOM element where the text describing the current state of the network is shown (e.g. '#element')
  // [OPT] network_warning_tag         :          the CSS selector of the DOM element where the any warning messages would go (e.g. '#element')
  // [OPT] button_bar_ui               :          the ID of the control bar which can contain the following elements (prefix = button_bar_ui value)
  //                                                - [prefix]_cluster_operations_container : a drop-down for operations on clusters
  //                                                - [prefix]_attributes :  a drop-down for operations on attributes
  //                                                - [prefix]_filter : a text box used to search the graph
  // [OPT] network_status_string       :          the CSS selector of the DOM element where the text describing the current state of the network is shown (e.g. '#element')
  // [OPT] attributes                  :          A JSON object with mapped node attributes

  if (json.Settings && json.Settings.compact_json) {
    _.each(["Nodes", "Edges"], (key) => {
      var fields = _.keys(json[key]);
      var expanded = [];
      _.each(fields, (f, idx) => {
        var field_values = json[key][f];
        if (!_.isArray(field_values) && "values" in field_values) {
          //console.log ('COMPRESSED');
          var expanded_values = [];
          _.each(field_values["values"], (v) => {
            expanded_values.push(field_values["keys"][v]);
          });
          field_values = expanded_values;
        }
        _.each(field_values, (fv, j) => {
          if (idx == 0) {
            expanded.push({});
          }
          expanded[j][f] = fv;
        });
      });
      json[key] = expanded;
    });
  }

  // if schema is not set, set to empty dictionary
  if (!json[_networkGraphAttrbuteID]) {
    json[_networkGraphAttrbuteID] = {};
  }

  // Make attributes case-insensitive by LowerCasing all keys in schema
  const new_schema = Object.fromEntries(
    Object.entries(json[_networkGraphAttrbuteID]).map(([k, v]) => [
      k.toLowerCase(),
      v,
    ])
  );

  json[_networkGraphAttrbuteID] = new_schema;

  // Attempt Translations
  $("#filter_input")
    .val("")
    .attr("placeholder", __("network_tab")["text_in_attributes"]);
  $("#show_as").html(__("attributes_tab")["show_as"]);

  // Make attributes case-insensitive by LowerCasing all keys in node attributes
  let label_key_map = _.object(
    _.map(json.patient_attribute_schema, (d, k) => [d.label, k])
  );

  _.each(json.Nodes, (n) => {
    if ("patient_attributes" in n) {
      let new_attrs = {};
      if (n["patient_attributes"] != null) {
        new_attrs = Object.fromEntries(
          Object.entries(n.patient_attributes).map(([k, v]) => [
            k.toLowerCase(),
            v,
          ])
        );
      }

      // Map attributes from patient_schema labels to keys, if necessary
      let unrecognizedKeys = _.difference(
        _.keys(new_attrs),
        _.keys(json.patient_attribute_schema)
      );

      if (unrecognizedKeys.length) {
        _.each(unrecognizedKeys, (k) => {
          if (_.contains(_.keys(label_key_map), k)) {
            new_attrs[label_key_map[k]] = new_attrs[k];
            delete new_attrs[k];
          }
        });
      }

      n.patient_attributes = new_attrs;
    }
  });

  // annotate each node with patient_attributes if does not exist
  json.Nodes.forEach(function (n) {
    if (!n["attributes"]) {
      n["attributes"] = [];
    }

    if (!n[_networkNodeAttributeID]) {
      n[_networkNodeAttributeID] = [];
    }
  });

  /** SLKP 20190902: somehow our networks have malformed edges! This will remove them */
  json.Edges = _.filter(json.Edges, (e) => "source" in e && "target" in e);

  var self = {};

  self._is_CDC_ = options && options["no_cdc"] ? false : true;
  self._is_seguro = options && options["seguro"] ? true : false;
  self._is_CDC_executive_mode =
    options && options["cdc-executive-mode"] ? true : false;

  self.json = json;

  self.uniqs = helpers.get_unique_count(json.Nodes, new_schema);
  self.uniqValues = helpers.getUniqueValues(json.Nodes, new_schema);

  self.schema = json[_networkGraphAttrbuteID];
  // set initial color schemes
  self.networkColorScheme = _networkPresetColorSchemes;

  self.ww =
    options && options["width"]
      ? options["width"]
      : d3.select(parent_container).property("clientWidth");
  self.container = network_container;
  self.nodes = [];
  self.edges = [];
  self.clusters = [];
  self.cluster_sizes = [];
  self.cluster_mapping = {};
  self.percent_format = _defaultPercentFormat;
  self.missing = _networkMissing;
  self.cluster_attributes = json["Cluster description"]
    ? json["Cluster description"]
    : null;
  self.warning_string = "";
  self.precomputed_subclusters = json["Subclusters"]
    ? json["Subclusters"]
    : null;

  if (self.cluster_attributes) {
    _.each(self.cluster_attributes, function (cluster) {
      if ("old_size" in cluster && "size" in cluster) {
        cluster["delta"] = cluster["size"] - cluster["old_size"];
        cluster["deleted"] =
          cluster["old_size"] +
          (cluster["new_nodes"] ? cluster["new_nodes"] : 0) -
          cluster["size"];
      } else {
        if (cluster["type"] == "new") {
          cluster["delta"] = cluster["size"];
          if ("moved" in cluster) {
            cluster["delta"] -= cluster["moved"];
          }
        } else {
          cluster["delta"] = 0;
        }
      }
      cluster["flag"] = cluster["moved"] || cluster["deleted"] ? 2 : 3;
      //console.log (cluster);
    });
  }

  if (options && _.isFunction(options["init_code"])) {
    options["init_code"].call(null, self, options);
  }

  self.dom_prefix =
    options && options["prefix"] ? options["prefix"] : "hiv-trace";
  self.extra_cluster_table_columns =
    options && options["cluster-table-columns"]
      ? options["cluster-table-columns"]
      : null;

  self.subcluster_table = null;
  self.isPrimaryGraph = options && "secondary" in options ? false : true;
  utils.init(self.isPrimaryGraph, button_bar_ui);
  self.parent_graph_object =
    options && "parent_graph" in options ? options["parent_graph"] : null;

  if (json.Settings && json.Settings.created) {
    self.today = new Date(json.Settings.created);
  } else {
    self.today =
      options && options["today"] ? options["today"] : timeDateUtil.getCurrentDate();
  }

  self.get_reference_date = function () {
    if (!self.isPrimaryGraph && self.parent_graph_object)
      return self.parent_graph_object.today;

    return self.today;
  };

  if (self._is_CDC_) {
    // define various CDC settings

    self._is_CDC_auto_mode =
      options && options["cdc-no-auto-priority-set-mode"] ? false : true;

    self._lookup_option = function (key, default_value) {
      if (self.json.Settings && self.json.Settings[key])
        return self.json.Settings[key];
      if (options && options[key]) return options[key];
      return default_value;
    };

    self.displayed_node_subset =
      options && options["node-attributes"]
        ? options["node-attributes"]
        : [
          tables._networkNodeIDField,
          "sex_trans",
          "race_cat",
          "hiv_aids_dx_dt",
          "cur_city_name",
        ];

    self.subcluster_table =
      options && options["subcluster-table"]
        ? d3.select(options["subcluster-table"])
        : null;

    self.extra_subcluster_table_columns = null;

    var lookup_form_generator = function () {
      return '<div><ul data-hivtrace-ui-role = "priority-membership-list"></ul></div>';
    };

    // SLKP 20200727 issues

    self.CDC_data = {
      jurisdiction: self
        ._lookup_option("jurisdiction", "unknown")
        .toLowerCase()
        .replace(/\s/g, ""),
      timestamp: self.today,
      "autocreate-priority-set-size": 5,
    };

    if (self.CDC_data.jurisdiction in _cdcJurisdictionCodes) {
      self.CDC_data["jurisdiction_code"] =
        _cdcJurisdictionCodes[self.CDC_data.jurisdiction].toUpperCase();
    } else {
      self.CDC_data["jurisdiction_code"] = "PG";
    }

    if (_cdcJurisdictionLowMorbidity.has(self.CDC_data["jurisdiction"])) {
      self.CDC_data["autocreate-priority-set-size"] = 3;
    }

    var cdc_extra = [
      {
        description: {
          value: "Cases dx within 36 months",
          sort: function (c) {
            return c.value.length ? c.value[0].length : 0;
          },
          help: "Number of cases diagnosed in the past 36 months connected only through cases diagnosed within the past 36 months",
        },
        generator: function (cluster) {
          return {
            html: true,
            value: cluster.recent_nodes,
            volatile: true,
            format: function (v) {
              v = v || [];
              if (v.length) {
                return _.map(v, (v) => v.length).join(", ");
              } else {
                return "";
              }
            },
            actions: function (item, value) {
              if (
                !self.priority_set_editor ||
                cluster.recent_nodes.length == 0
              ) {
                return null;
              } else {
                return _.map(cluster.recent_nodes, function (c) {
                  let nodeset = new Set(c);
                  return {
                    icon: "fa-plus",
                    action: function (button, v) {
                      if (self.priority_set_editor) {
                        self.priority_set_editor.append_node_objects(
                          _.filter(cluster.children, (n) => {
                            return nodeset.has(n.id) && n.priority_flag > 0;
                          })
                        );
                      }
                      return false;
                    },
                    help: "Add to cluster of interest",
                  };
                });
              }
            },
          };
        },
      },
      {
        description: {
          value: "Cases dx within 12 months",
          //"value",
          sort: function (c) {
            let v = c.value || [];
            return v.length > 0 ? v[0].length : 0;
          },
          presort: "desc",
          help: "Number of cases diagnosed in the past 12 months connected only through cases diagnosed within the past 36 months",
        },
        generator: function (cluster) {
          let definition = {
            html: true,
            value: cluster.priority_score,
            volatile: true,
            format: function (v) {
              v = v || [];
              if (v.length) {
                var str = _.map(v, (c) => c.length).join(", ");
                if (
                  v[0].length >= self.CDC_data["autocreate-priority-set-size"]
                ) {
                  var color = "red";
                  return "<span style='color:" + color + "'>" + str + "</span>";
                }
                return str;
              }
              return "";
            },
          };

          definition["actions"] = function (item, value) {
            let result = [];

            if (cluster.priority_score.length > 0) {
              result = result.concat(
                _.map(cluster.priority_score, function (c) {
                  return {
                    icon: "fa-question",
                    help:
                      "Do some of these " +
                      c.length +
                      " nodes belong to a cluster of interest?",
                    action: function (this_button, cv) {
                      let nodeset = new Set(c);
                      this_button = $(this_button.node());
                      if (this_button.data("popover_shown") != "shown") {
                        let popover = this_button
                          .popover({
                            sanitize: false,
                            placement: "right",
                            container: "body",
                            html: true,
                            content: lookup_form_generator,
                            trigger: "manual",
                          })
                          .on("shown.bs.popover", function (e) {
                            var clicked_object = d3.select(this);
                            var popover_div = d3.select(
                              "#" + clicked_object.attr("aria-describedby")
                            );
                            var list_element = popover_div.selectAll(
                              utils.get_ui_element_selector_by_role(
                                "priority-membership-list",
                                true
                              )
                            );

                            list_element.selectAll("li").remove();
                            let check_membership = _.filter(
                              _.map(self.defined_priority_groups, (g) => {
                                //console.log(g);
                                return [
                                  g.name,
                                  _.filter(g.nodes, (n) => nodeset.has(n.name))
                                    .length,
                                  _.filter(
                                    g.partitioned_nodes[1]["new_direct"],
                                    (n) => nodeset.has(n.id)
                                  ).length,
                                  _.filter(
                                    g.partitioned_nodes[1]["new_indirect"],
                                    (n) => nodeset.has(n.id)
                                  ).length,
                                ];
                              }),
                              (gg) => gg[1] + gg[2] + gg[3] > 0
                            );

                            if (check_membership.length == 0) {
                              check_membership = [
                                [
                                  "No nodes belong to any cluster of interest or are linked to any of the clusters of interest.",
                                ],
                              ];
                            } else {
                              check_membership = _.map(
                                check_membership,
                                (m) => {
                                  let description = "";
                                  if (m[1]) {
                                    description += " " + m[1] + " nodes belong";
                                  }
                                  if (m[2]) {
                                    description +=
                                      (description.length ? ", " : " ") +
                                      m[2] +
                                      " nodes are directly linked @ " +
                                      _defaultPercentFormatShort(
                                        self.subcluster_threshold
                                      );
                                  }
                                  if (m[3]) {
                                    description +=
                                      (description.length ? ", " : " ") +
                                      m[3] +
                                      " nodes are indirectly linked @ " +
                                      _defaultPercentFormatShort(
                                        self.subcluster_threshold
                                      );
                                  }

                                  description +=
                                    " to cluster of interest <code>" +
                                    m[0] +
                                    "</code>";
                                  return description;
                                }
                              );
                            }
                            list_element = list_element
                              .selectAll("li")
                              .data(check_membership);
                            list_element.enter().insert("li");
                            list_element.html(function (d) {
                              return d;
                            });
                          });

                        popover.popover("show");
                        this_button.data("popover_shown", "shown");
                        this_button
                          .off("hidden.bs.popover")
                          .on("hidden.bs.popover", function () {
                            $(this).data("popover_shown", "hidden");
                          });
                      } else {
                        this_button.data("popover_shown", "hidden");
                        this_button.popover("destroy");
                      }
                    },
                  };
                })
              );
            }

            if (self.priority_set_editor && cluster.priority_score.length > 0) {
              result = result.concat(
                _.map(cluster.priority_score, function (c) {
                  let nodeset = new Set(c);
                  return {
                    icon: "fa-plus",
                    action: function (button, v) {
                      if (self.priority_set_editor) {
                        self.priority_set_editor.append_node_objects(
                          _.filter(cluster.children, (n) => {
                            return (
                              nodeset.has(n.id) &&
                              (n.priority_flag == 2 || n.priority_flag == 1)
                            );
                          })
                        );
                      }
                      return false;
                    },
                    help: "Add to cluster of interest",
                  };
                })
              );
            }

            return result;
          };

          return definition;
        },
      },
    ];
  } // end self._is_CDC_

  self.node_label_drag = d3.behavior
    .drag()
    .on("drag", function (d) {
      d.label_x += d3.event.dx;
      d.label_y += d3.event.dy;
      d3.select(this).attr(
        "transform",
        "translate(" +
        (d.label_x + d.rendered_size * 1.25) +
        "," +
        (d.label_y + d.rendered_size * 0.5) +
        ")"
      );
    })
    .on("dragstart", function () {
      d3.event.sourceEvent.stopPropagation();
    })
    .on("dragend", function () {
      d3.event.sourceEvent.stopPropagation();
    });

  if (self.subcluster_table) {
    self.extra_subcluster_table_columns = cdc_extra;
  } else {
    if (self.extra_cluster_table_columns) {
      self.extra_cluster_table_columns =
        self.extra_cluster_table_columns.concat(cdc_extra);
    } else {
      self.extra_cluster_table_columns = cdc_extra;
    }
  }

  self.extra_node_table_columns =
    options && options["node-table-columns"]
      ? options["node-table-columns"]
      : self._is_CDC_
        ? [
          {
            description: {
              value: "Recent and Rapid",
              sort: "value",
              help: "Is the node a member of a regular or recent & rapid subcluster?",
            },
            generator: function (node) {
              return {
                callback: function (element, payload) {
                  //payload = _.filter (payload, function (d) {return d});
                  var this_cell = d3.select(element);

                  var data_to_use = [
                    [payload[0][0], payload[0][1], payload[0][2]],
                    [payload[1][0] ? "36 months" : "", payload[1][1]],
                    [payload[2][0] ? "12 months" : "", payload[2][1]],
                    [
                      payload.length > 3 && payload[3][0]
                        ? "Recent cluster >= 3"
                        : "",
                      payload.length > 3 ? payload[3][1] : null,
                    ],
                  ];

                  var buttons = this_cell.selectAll("span").remove();

                  _.each(data_to_use, function (button_text) {
                    //self.open_exclusive_tab_view (cluster_id)
                    if (button_text[0].length) {
                      var button_obj = this_cell
                        .append("span")
                        .classed("btn btn-xs btn-node-property", true)
                        .classed(button_text[1], true)
                        .text(button_text[0]);

                      if (_.isFunction(button_text[2])) {
                        button_obj.on("click", button_text[2]);
                      } else {
                        button_obj.attr("disabled", true);
                      }
                    }
                  });
                },
                value: function () {
                  return [
                    [
                      node.subcluster_label
                        ? "Subcluster " + node.subcluster_label
                        : "",
                      "btn-primary",
                      node.subcluster_label
                        ? function () {
                          self.view_subcluster(
                            node.subcluster_label,
                            function (n) {
                              return (
                                n.subcluster_label == node.subcluster_label
                              );
                            },
                            "Subcluster " + node.subcluster_label
                          );
                        }
                        : null,
                    ],

                    [node.priority_flag == 3, "btn-warning"],
                    [node.priority_flag == 1, "btn-danger"],
                    [node.priority_flag == 2, "btn-danger"],
                  ];
                },
              };
            },
          },
        ]
        : null;

  self.colorizer = {
    selected: function (d) {
      return d == "selected" ? d3.rgb(51, 122, 183) : "#FFF";
    },
  };

  self.subcluster_threshold =
    options && options["subcluster-thershold"]
      ? options["subcluster-thershold"]
      : 0.005;

  self.highlight_unsuppored_edges = true;

  //---------------------------------------------------------------------------------------------------
  // BEGIN: NODE SET GROUPS
  //---------------------------------------------------------------------------------------------------

  self.defined_priority_groups = [];
  /**
    {
         'name'  : 'unique name',
         'nodes' : [
          {
              'node_id' : text,
              'added' : date,
              'kind' : text
          }],
         'created' : date,
         'description' : 'text',
         'modified' : date,
         'kind' : 'text'
     }
  */

  self.priority_groups_pending = function () {
    return _.filter(self.defined_priority_groups, (pg) => pg.pending).length;
  };
  self.priority_groups_expanded = function () {
    return _.filter(self.defined_priority_groups, (pg) => pg.expanded).length;
  };
  self.priority_groups_automatic = function () {
    return _.filter(
      self.defined_priority_groups,
      (pg) => pg.createdBy == _cdcCreatedBySystem
    ).length;
  };

  self.priority_groups_check_name = function (string, prior_name) {
    if (string.length) {
      if (string.length == 36) return false;
      return !_.some(
        self.defined_priority_groups,
        (d) => d.name == string && d.name != prior_name
      );
    }
    return false;
  };

  self.load_priority_sets = function (url, is_writeable) {
    d3.json(url, function (error, results) {
      if (error) {
        throw "Failed loading cluster of interest file " + error.responseURL;
      } else {
        let latest_date = new Date();
        latest_date.setFullYear(1900);
        self.defined_priority_groups = _.clone(results);
        _.each(self.defined_priority_groups, (pg) => {
          _.each(pg.nodes, (n) => {
            try {
              n.added = _defaultDateFormats[0].parse(n.added);
              if (n.added > latest_date) {
                latest_date = n.added;
              }
            } catch (e) { }
          });
        });

        self.priority_set_table_writeable = is_writeable == "writeable";

        self.priority_groups_validate(
          self.defined_priority_groups,
          self._is_CDC_auto_mode
        );

        self.auto_create_priority_sets = [];
        // propose some
        let today_string = _defaultDateFormats[0](self.today);
        let node_id_to_object = {};

        _.each(self.json.Nodes, (n, i) => {
          node_id_to_object[n.id] = n;
        });

        function _generate_auto_id(subcluster_id) {
          let id =
            self.CDC_data["jurisdiction_code"] +
            "_" +
            _defaultDateViewFormatClusterCreate(self.CDC_data["timestamp"]) +
            "_" +
            subcluster_id;
          let suffix = "";
          let k = 1;
          while (
            _.find(
              self.auto_create_priority_sets,
              (d) => d.name == id + suffix
            ) ||
            _.find(self.defined_priority_groups, (d) => d.name == id + suffix)
          ) {
            suffix = "_" + k;
          }
          return id + suffix;
        }

        if (self._is_CDC_auto_mode) {
          _.each(self.clusters, (cluster_data, cluster_id) => {
            _.each(cluster_data.subclusters, (subcluster_data) => {
              _.each(subcluster_data.priority_score, (priority_score, i) => {
                if (
                  priority_score.length >=
                  self.CDC_data["autocreate-priority-set-size"]
                ) {
                  // only generate a new set if it doesn't match what is already there
                  let node_set = {};
                  _.each(subcluster_data.recent_nodes[i], (n) => {
                    node_set[n] = 1;
                  });

                  let matched_groups = _.filter(
                    _.filter(
                      self.defined_priority_groups,
                      (pg) =>
                        pg.kind in _cdcPrioritySetKindAutoExpand &&
                        pg.createdBy == _cdcCreatedBySystem &&
                        pg.tracking == _cdcTrackingOptionsDefault
                    ),
                    (pg) => {
                      let matched = _.countBy(
                        _.map(pg.nodes, (pn) => pn.name in node_set)
                      );
                      //if (pg.name == 'FL_201709_141.1') console.log (matched);
                      return (
                        //matched[true] == subcluster_data.recent_nodes[i].length
                        matched[true] >= 1
                      );
                    }
                  );

                  if (matched_groups.length >= 1) {
                    return;
                  }

                  let autoname = _generate_auto_id(subcluster_data.cluster_id);
                  self.auto_create_priority_sets.push({
                    name: autoname,
                    description:
                      "Automatically created cluster of interest " + autoname,
                    nodes: _.map(subcluster_data.recent_nodes[i], (n) =>
                      self.priority_group_node_record(n, self.today)
                    ),
                    created: today_string,
                    kind: _cdcPrioritySetKindAutomaticCreation,
                    tracking: _cdcTrackingOptions[0],
                    createdBy: _cdcCreatedBySystem,
                    autocreated: true,
                    autoexpanded: false,
                    pending: true,
                  });
                }
              });
            });
          });
        }

        if (self.auto_create_priority_sets.length) {
          // SLKP 20200727 now check to see if any of the priority sets
          // need to be auto-generated
          //console.log (self.auto_create_priority_sets);
          self.defined_priority_groups.push(...self.auto_create_priority_sets);
        }
        const autocreated = self.defined_priority_groups.filter(
          (pg) => pg.autocreated
        ).length,
          autoexpanded = self.defined_priority_groups.filter(
            (pg) => pg.autoexpanded
          ).length,
          automatic_action_taken = autocreated + autoexpanded > 0,
          left_to_review = self.defined_priority_groups.filter(
            (pg) => pg.pending
          ).length;

        if (automatic_action_taken) {
          self.warning_string +=
            "<br/>Automatically created <b>" +
            autocreated +
            "</b> and expanded <b>" +
            autoexpanded +
            "</b> clusters of interest." +
            (left_to_review > 0
              ? " <b>Please review <span id='banner_coi_counts'></span> clusters in the <code>Clusters of Interest</code> tab.</b><br>"
              : "");
          self.display_warning(self.warning_string, true);
        }

        let tab_pill = utils.get_ui_element_selector_by_role(
          "priority_set_counts",
          true
        );

        if (!self.priority_set_table_writeable) {
          const rationale =
            is_writeable == "old"
              ? "the network is <b>older</b> than some of the Clusters of Interest"
              : "the network was ran in <b>standalone</b> mode so no data is stored";
          self.warning_string += `<p class="alert alert-danger"class="alert alert-danger">READ-ONLY mode for Clusters of Interest is enabled because ${rationale}. None of the changes to clustersOI made during this session will be recorded.</p>`;
          self.display_warning(self.warning_string, true);
          if (tab_pill) {
            d3.select(tab_pill).text("Read-only");
          }
        } else {
          if (tab_pill && left_to_review > 0) {
            d3.select(tab_pill).text(left_to_review);
            d3.select("#banner_coi_counts").text(left_to_review);
          }
        }
        self.priority_groups_validate(self.defined_priority_groups);
        _.each(self.auto_create_priority_sets, (pg) =>
          self.priority_groups_update_node_sets(pg.name, "insert")
        );
        const groups_that_expanded = self.defined_priority_groups.filter(
          (pg) => pg.expanded
        );
        _.each(groups_that_expanded, (pg) =>
          self.priority_groups_update_node_sets(pg.name, "update")
        );

        self.draw_priority_set_table();
        if (
          self.showing_diff &&
          self.has_network_attribute("subcluster_or_priority_node")
        ) {
          self.handle_attribute_categorical("subcluster_or_priority_node");
        }
        //self.update();
      }
    });
  };

  self.priority_groups_find_by_name = function (name) {
    if (self.defined_priority_groups) {
      return _.find(self.defined_priority_groups, (g) => g.name == name);
    }
    return null;
  };

  self.priority_groups_all_events = function () {
    // generate a set of all unique temporal events (when new data were added to ANY PG)
    let events = new Set();
    if (self.defined_priority_groups) {
      _.each(self.defined_priority_groups, (g) => {
        _.each(g.nodes, (n) => {
          events.add(_defaultDateViewFormatSlider(n.added));
        });
      });
    }
    return events;
  };

  self.priority_group_node_record = function (node_id, date, kind) {
    return {
      name: node_id,
      added: date || self.today,
      kind: kind || _cdcPrioritySetDefaultNodeKind,
      autoadded: true,
    };
  };

  self.priority_groups_compute_overlap = function (groups) {
    /**
        compute the overlap between priority sets (PS)
        
        1. Populate self.priority_node_overlap dictionary which
           stores, for every node present in AT LEAST ONE PS, the set of all 
           PGs it belongs to, as in "node-id" => set ("PG1", "PG2"...)
           
        2. For each PS, create and populate a member field, .overlaps
           which is a dictionary that stores
           {
                sets : #of PS with which it shares nodes
                nodes: the # of nodes contained in overlaps
           }
    
    */
    self.priority_node_overlap = {};
    let size_by_pg = {};
    _.each(groups, (pg) => {
      size_by_pg[pg.name] = pg.nodes.length;
      _.each(pg.nodes, (n) => {
        if (n.name in self.priority_node_overlap == false) {
          self.priority_node_overlap[n.name] = new Set();
        }
        self.priority_node_overlap[n.name].add(pg.name);
      });
    });

    _.each(groups, (pg) => {
      let overlap = {
        sets: new Set(),
        nodes: 0,
        supersets: [],
        duplicates: [],
      };

      let by_set_count = {};
      _.each(pg.nodes, (n) => {
        if (self.priority_node_overlap[n.name].size > 1) {
          overlap.nodes++;
          self.priority_node_overlap[n.name].forEach((pgn) => {
            if (pgn != pg.name) {
              if (!(pgn in by_set_count)) {
                by_set_count[pgn] = [];
              }
              by_set_count[pgn].push(n.name);
            }
            overlap.sets.add(pgn);
          });
        }
      });

      _.each(by_set_count, (nodes, name) => {
        if (nodes.length == pg.nodes.length) {
          if (size_by_pg[name] == pg.nodes.length) {
            overlap.duplicates.push(name);
          } else {
            overlap.supersets.push(name);
          }
        }
      });

      pg.overlap = {
        nodes: overlap.nodes,
        sets: Math.max(0, overlap.sets.size - 1),
        superset: overlap.supersets,
        duplicate: overlap.duplicates,
      };
    });
  };

  self.auto_expand_pg_handler = function (pg, nodeID2idx) {
    if (!nodeID2idx) {
      let nodeset = {};
      nodeID2idx = {};
      _.each(self.json.Nodes, (n, i) => {
        nodeset[n.id] = n;
        nodeID2idx[n.id] = i;
      });
    }

    let core_node_set = new Set(_.map(pg.nodes, (n) => nodeID2idx[n.name]));
    let added_nodes = new Set();
    let filter = _cdcTrackingOptionsFilter[pg.tracking];

    if (filter) {
      let time_cutoff = _n_months_ago(
        self.get_reference_date(),
        _cdcTrackingOptionsCutoff[pg.tracking]
      );
      const expansion_test = hivtrace_cluster_depthwise_traversal(
        self.json.Nodes,
        self.json.Edges,
        (e) => {
          let pass = filter(e);
          if (pass) {
            if (!(core_node_set.has(e.source) && core_node_set.has(e.target))) {
              pass =
                pass &&
                self._filter_by_date(
                  time_cutoff,
                  timeDateUtil._networkCDCDateField,
                  self.get_reference_date(),
                  self.json.Nodes[e.source]
                ) &&
                self._filter_by_date(
                  time_cutoff,
                  timeDateUtil._networkCDCDateField,
                  self.get_reference_date(),
                  self.json.Nodes[e.target]
                );
            }
          }
          return pass;
        },
        false,
        _.filter(
          _.map([...core_node_set], (d) => self.json.Nodes[d]),
          (d) => d
        )
      );

      _.each(expansion_test, (c) => {
        _.each(c, (n) => {
          if (!core_node_set.has(nodeID2idx[n.id])) {
            added_nodes.add(nodeID2idx[n.id]);
          }
        });
      });
    }
    return added_nodes;
  };

  self.priority_groups_validate = function (groups, auto_extend) {
    /**
      groups is a list of priority groups

      name: unique string
      description: string,
      nodes: {
          {
              'id' : node id,
              'added' : date,
              'kind' : enum (one of _cdcPrioritySetNodeKind)
          }
      },
      created: date,
      kind: enum (one of _cdcPrioritySetKind),
      tracking: enum (one of _cdcTrackingOptions)
      createdBy : enum (on of [_cdcCreatedBySystem,_cdcCreatedByManual])


    */

    if (_.some(groups, (g) => !g.validated)) {
      let priority_subclusters = _.map(
        _.filter(
          _.flatten(
            _.map(
              _.flatten(
                _.map(self.clusters, (c) =>
                  _.filter(
                    _.filter(c.subclusters, (sc) => sc.priority_score.length)
                  )
                )
              ),
              (d) => d.priority_score
            ),
            1
          ),
          (d) => d.length >= self.CDC_data["autocreate-priority-set-size"]
        ),
        (d) => new Set(d)
      );

      let nodeset = {};
      let nodeID2idx = {};
      _.each(self.json.Nodes, (n, i) => {
        nodeset[n.id] = n;
        nodeID2idx[n.id] = i;
      });
      _.each(groups, (pg) => {
        if (!pg.validated) {
          pg.node_objects = [];
          pg.not_in_network = [];
          pg.validated = true;
          pg.created = _.isDate(pg.created)
            ? pg.created
            : _defaultDateFormats[0].parse(pg.created);
          pg.modified = pg.modified
            ? _.isDate(pg.modified)
              ? pg.modified
              : _defaultDateFormats[0].parse(pg.modified)
            : pg.created;
          if (!pg.tracking) {
            if (pg.kind == _cdcPrioritySetKind[0]) {
              pg.tracking = _cdcTrackingOptions[0];
            } else {
              pg.tracking = _cdcTrackingOptions[4];
            }
          }
          if (!pg.createdBy) {
            if (pg.kind == _cdcPrioritySetKind[0]) {
              pg.createdBy = _cdcCreatedBySystem;
            } else {
              pg.createdBy = _cdcCreatedByManual;
            }
          }

          _.each(pg.nodes, (node) => {
            let nodeid = node.name;
            if (nodeid in nodeset) {
              pg.node_objects.push(nodeset[nodeid]);
            } else {
              pg.not_in_network.push(nodeid);
            }
          });

          /**     extract network data at 0.015 and subcluster thresholds
                            filter on dates subsequent to created date
                     **/

          let my_nodeset = new Set(_.map(pg.node_objects, (n) => n.id));

          let node_set15 = _.flatten(
            hivtrace_cluster_depthwise_traversal(
              json["Nodes"],
              json["Edges"],
              (e) => {
                return e.length <= 0.015;
              },
              null,
              pg.node_objects
            )
          );

          let saved_traversal_edges = auto_extend ? new Array() : null;

          let node_set_subcluster = _.flatten(
            hivtrace_cluster_depthwise_traversal(
              json["Nodes"],
              json["Edges"],
              (e) => {
                return e.length <= self.subcluster_threshold;
              },
              saved_traversal_edges,
              pg.node_objects
            )
          );

          let direct_at_15 = new Set();

          let json15 = _extract_single_cluster(
            node_set15,
            (e) => {
              return (
                e.length <= 0.015 &&
                (my_nodeset.has(json["Nodes"][e.target].id) ||
                  my_nodeset.has(json["Nodes"][e.source].id))
              );
            },
            //null,
            true
          );

          _.each(json15["Edges"], (e) => {
            _.each([e.source, e.target], (nid) => {
              if (!my_nodeset.has(json15["Nodes"][nid].id)) {
                direct_at_15.add(json15["Nodes"][nid].id);
              }
            });
          });

          let current_time = self.today;
          let current_time_str = _defaultDateFormats[0](current_time);

          let json_subcluster = _extract_single_cluster(
            node_set_subcluster,
            (e) => {
              return (
                e.length <= self.subcluster_threshold &&
                (my_nodeset.has(json["Nodes"][e.target].id) ||
                  my_nodeset.has(json["Nodes"][e.source].id))
                /*|| (auto_extend && (self._filter_by_date(
                    pg.modified || pg.created,
                    timeDateUtil._networkCDCDateField,
                    current_time,
                    json["Nodes"][e.target],
                    true
                  ) || self._filter_by_date(
                    pg.modified || pg.created,
                    timeDateUtil._networkCDCDateField,
                    current_time,
                    json["Nodes"][e.source],
                    true
                  )))*/
              );
            },
            true
          );

          let direct_subcluster = new Set();
          let direct_subcluster_new = new Set();
          _.each(json_subcluster["Edges"], (e) => {
            _.each([e.source, e.target], (nid) => {
              if (!my_nodeset.has(json_subcluster["Nodes"][nid].id)) {
                direct_subcluster.add(json_subcluster["Nodes"][nid].id);

                if (
                  self._filter_by_date(
                    pg.modified || pg.created,
                    timeDateUtil._networkCDCDateField,
                    current_time,
                    json_subcluster["Nodes"][nid],
                    true
                  )
                )
                  direct_subcluster_new.add(json_subcluster["Nodes"][nid].id);
              }
            });
          });

          pg.partitioned_nodes = _.map(
            [
              [node_set15, direct_at_15],
              [node_set_subcluster, direct_subcluster],
            ],
            (ns) => {
              let nodesets = {
                existing_direct: [],
                new_direct: [],
                existing_indirect: [],
                new_indirect: [],
              };

              _.each(ns[0], (n) => {
                if (my_nodeset.has(n.id)) return;
                let key = "";
                if (
                  self._filter_by_date(
                    pg.modified || pg.created,
                    timeDateUtil._networkCDCDateField,
                    current_time,
                    n,
                    true
                  )
                ) {
                  key = "new";
                } else {
                  key = "existing";
                }

                if (ns[1].has(n.id)) {
                  key += "_direct";
                } else {
                  key += "_indirect";
                }

                nodesets[key].push(n);
              });

              return nodesets;
            }
          );

          if (auto_extend && pg.tracking != _cdcTrackingNone) {
            let added_nodes = self.auto_expand_pg_handler(pg, nodeID2idx);

            if (added_nodes.size) {
              _.each([...added_nodes], (nid) => {
                let n = self.json.Nodes[nid];
                pg.nodes.push({
                  name: n.id,
                  added: current_time,
                  kind: _cdcPrioritySetDefaultNodeKind,
                  autoadded: true,
                });
                pg.node_objects.push(n);
              });
              pg.validated = false;
              pg.autoexpanded = true;
              pg.pending = true;
              pg.expanded = added_nodes.size;
              pg.modified = self.today;
            }
          }

          let node_set = new Set(_.map(pg.nodes, (n) => n.name));
          pg.meets_priority_def = _.some(priority_subclusters, (ps) => {
            return (
              _.filter([...ps], (psi) => node_set.has(psi)).length == ps.size
            );
          });
          const cutoff12 = _n_months_ago(self.get_reference_date(), 12);
          pg.last12 = _.filter(pg.node_objects, (n) =>
            self._filter_by_date(
              cutoff12,
              timeDateUtil._networkCDCDateField,
              self.today,
              n,
              false
            )
          ).length;
        }
      });
    }
  };

  self.priority_groups_update_node_sets = function (name, operation) {
    // name : the name of the priority group being added
    // operation: one of
    // "insert" , "delete", "update"

    const sets = self.priority_groups_export().filter((pg) => pg.name == name);
    let to_post = {
      operation: operation,
      name: name,
      url: window.location.href,
      sets: JSON.stringify(sets),
    };

    if (self.priority_set_table_write && self.priority_set_table_writeable) {
      d3.text(self.priority_set_table_write)
        .header("Content-Type", "application/json")
        .post(JSON.stringify(to_post), function (error, data) {
          if (error) {
            console.log("received fatal error:", error);
            /*
            $(".container").html(
              '<div class="alert alert-danger">FATAL ERROR. Please reload the page and contact help desk.</div>'
            );
            */
          }
        });
    }
  };

  self.priority_groups_compute_node_membership = function () {
    let pg_nodesets = [];

    _.each(self.defined_priority_groups, (g) => {
      pg_nodesets.push([
        g.name,
        g.createdBy == _cdcCreatedBySystem,
        new Set(_.map(g.nodes, (n) => n.name)),
      ]);
    });

    const pg_enum = [
      "Yes (dx≤12 months)",
      "Yes (12<dx≤ 36 months)",
      "Yes (dx>36 months)",
      "No",
    ];

    _.each(
      {
        subcluster_or_priority_node: {
          depends: [timeDateUtil._networkCDCDateField],
          label: _cdcPOImember,
          enum: pg_enum,
          type: "String",
          volatile: true,
          color_scale: function () {
            return d3.scale
              .ordinal()
              .domain(pg_enum.concat([_networkMissing]))
              .range([
                "red",
                "orange",
                "yellow",
                "steelblue",
                _networkMissingColor,
              ]);
          },
          map: function (node) {
            const npcoi = _.some(pg_nodesets, (d) => d[1] && d[2].has(node.id));
            if (npcoi) {
              const cutoffs = [
                _n_months_ago(self.get_reference_date(), 12),
                _n_months_ago(self.get_reference_date(), 36),
              ];

              //const ysd = self.attribute_node_value_by_id(
              //  node,
              //  "years_since_dx"
              //);

              if (
                self._filter_by_date(
                  cutoffs[0],
                  timeDateUtil._networkCDCDateField,
                  self.get_reference_date(),
                  node,
                  false
                )
              )
                return pg_enum[0];
              if (
                self._filter_by_date(
                  cutoffs[1],
                  timeDateUtil._networkCDCDateField,
                  self.get_reference_date(),
                  node,
                  false
                )
              )
                return pg_enum[1];
              return pg_enum[2];
            }
            return pg_enum[3];
          },
        },
        cluster_uid: {
          depends: [timeDateUtil._networkCDCDateField],
          label: "Clusters of Interest",
          type: "String",
          volatile: true,
          map: function (node) {
            const memberships = _.filter(pg_nodesets, (d) => d[2].has(node.id));
            if (memberships.length == 1) {
              return memberships[0][0];
            } else {
              if (memberships.length > 1) {
                return "Multiple";
              }
            }
            return "None";
          },
        },
        subcluster_id: {
          depends: [timeDateUtil._networkCDCDateField],
          label: "Subcluster ID",
          type: "String",
          //label_format: d3.format(".2f"),
          map: function (node) {
            try {
              return node.subcluster_label ? node.subcluster_label : "None";
            } catch (err) { }
            return _networkMissing;
          },
        },
      },
      self._aux_populated_predefined_attribute
    );
    self._aux_populate_category_menus();
  };

  self.priority_groups_add_set = function (
    nodeset,
    update_table,
    not_validated,
    prior_name,
    op_code
  ) {
    function check_dup() {
      if (
        nodeset.name[0] == " " ||
        nodeset.name[nodeset.name.length - 1] == " "
      ) {
        alert(
          "Cluster of interest '" +
          nodeset.name +
          "' has spaces either at the beginning or end of the name. Secure HIV-TRACE does not allow names that start or end with spaces."
        );
        return true;
      }
      let my_nodes = new Set(_.map(nodeset.nodes, (d) => d.name));
      return _.some(self.defined_priority_groups, (d) => {
        if (d.nodes.length == my_nodes.size) {
          const same_nodes =
            d.nodes.filter((x) => my_nodes.has(x.name)).length ==
            d.nodes.length;
          if (same_nodes && d.tracking == nodeset.tracking) {
            alert(
              "Cluster of interest '" +
              d.name +
              "' has the same set of nodes and the same growth criterion as this new cluster of interest. Secure HIV-TRACE does not allow creating exact duplicates of clusters of interest."
            );
            return true;
          } else if (same_nodes) {
            let keep_duplicate = confirm(
              "Warning! Cluster of interest '" +
              d.name +
              "' has the same set of nodes as this cluster of interest, but a different growth criterion'. Click 'OK' to create, or 'Cancel' to abort."
            );
            let is_duplicate = !keep_duplicate;
            return is_duplicate;
          }
        }
        return false;
      });
    }

    op_code = op_code || "insert";
    if (not_validated) {
      self.priority_groups_validate([nodeset]);
    }
    if (prior_name) {
      let prior_index = _.findIndex(
        self.defined_priority_groups,
        (d) => d.name == prior_name
      );
      if (prior_index >= 0) {
        if (prior_name != nodeset.name) {
          self.priority_groups_update_node_sets(prior_name, "delete");
          op_code = "insert";
        }
        self.defined_priority_groups[prior_index] = nodeset;
      } else {
        if (check_dup()) return false;
        self.defined_priority_groups.push(nodeset);
      }
    } else {
      if (check_dup()) return false;
      self.defined_priority_groups.push(nodeset);
    }
    self.priority_groups_update_node_sets(nodeset.name, op_code);

    if (update_table) {
      self.draw_priority_set_table();
    }

    return true;
  };

  self.priority_groups_edit_set_description = function (
    name,
    description,
    update_table
  ) {
    if (self.defined_priority_groups) {
      var idx = _.findIndex(
        self.defined_priority_groups,
        (g) => g.name == name
      );
      if (idx >= 0) {
        self.defined_priority_groups[idx].description = description;
        self.priority_groups_update_node_sets(name, "update");
        if (update_table) {
          self.draw_priority_set_table();
        }
      }
    }
  };

  self.priority_groups_remove_set = function (name, update_table) {
    if (self.defined_priority_groups) {
      var idx = _.findIndex(
        self.defined_priority_groups,
        (g) => g.name == name
      );
      if (idx >= 0) {
        self.defined_priority_groups.splice(idx, 1);
        self.priority_groups_update_node_sets(name, "delete");
        if (update_table) {
          self.draw_priority_set_table();
        }
      }
    }
  };

  self.priority_groups_export = function (group_set, include_unvalidated) {
    group_set = group_set || self.defined_priority_groups;

    return _.map(
      _.filter(group_set, (g) => include_unvalidated || g.validated),
      (g) => {
        return {
          name: g.name,
          description: g.description,
          nodes: g.nodes,
          modified: _defaultDateFormats[0](g.modified),
          kind: g.kind,
          created: _defaultDateFormats[0](g.created),
          createdBy: g.createdBy,
          tracking: g.tracking,
          autocreated: g.autocreated,
          autoexpanded: g.autoexpanded,
          pending: g.pending,
        };
      }
    );
  };

  self.priority_groups_is_new_node = function (group_set, node) {
    return node.autoadded;
  };

  self.priority_groups_export_nodes = function (
    group_set,
    include_unvalidated
  ) {
    group_set = group_set || self.defined_priority_groups;

    return _.flatten(
      _.map(
        _.filter(group_set, (g) => include_unvalidated || g.validated),
        (g) => {
          //const refTime = g.modified.getTime();
          //console.log ("GROUP: ",g.name, " = ", g.modified);

          const exclude_nodes = new Set(g.not_in_network);
          let cluster_detect_size = 0;
          g.nodes.forEach((node) => {
            if (node.added <= g.created) cluster_detect_size++;
          });
          return _.map(
            _.filter(g.nodes, (gn) => !exclude_nodes.has(gn.name)),
            (gn) => {
              //console.log (gn.added);
              return {
                eHARS_uid: gn.name,
                cluster_uid: g.name,
                cluster_ident_method: g.kind,
                person_ident_method: gn.kind,
                person_ident_dt: hivtrace_date_or_na_if_missing(gn.added),
                new_linked_case: self.priority_groups_is_new_node(g, gn)
                  ? 1
                  : 0,
                cluster_created_dt: hivtrace_date_or_na_if_missing(g.created),
                network_date: hivtrace_date_or_na_if_missing(self.today),
                cluster_detect_size: cluster_detect_size,
                cluster_type: g.createdBy,
                cluster_modified_dt: hivtrace_date_or_na_if_missing(g.modified),
                cluster_growth: _cdcConciseTrackingOptions[g.tracking],
                national_priority: g.meets_priority_def,
                cluster_current_size: g.nodes.length,
                cluster_dx_recent12_mo: g.last12,
                cluster_overlap: g.overlap.sets,
              };
            }
          );
        }
      )
    );
  };

  self.priority_groups_export_sets = function () {
    return _.flatten(
      _.map(
        _.filter(self.defined_priority_groups, (g) => g.validated),
        (g) => {
          return {
            cluster_type: g.createdBy,
            cluster_uid: g.name,
            cluster_modified_dt: hivtrace_date_or_na_if_missing(g.modified),
            cluster_created_dt: hivtrace_date_or_na_if_missing(g.created),
            cluster_ident_method: g.kind,
            cluster_growth: _cdcConciseTrackingOptions[g.tracking],
            cluster_current_size: g.nodes.length,
            national_priority: g.meets_priority_def,
            cluster_dx_recent12_mo: g.last12,
            cluster_overlap: g.overlap.sets,
          };
        }
      )
    );
  };

  //---------------------------------------------------------------------------------------------------
  // END: NODE SET GROUPS
  //---------------------------------------------------------------------------------------------------

  //---------------------------------------------------------------------------------------------------
  // BEGIN: NODE SET EDITOR
  //---------------------------------------------------------------------------------------------------

  self.priority_set_editor = null;

  self.priority_set_view = function (priority_set, options) {
    options = options || {};

    let nodes = priority_set.node_objects || priority_set.network_nodes;
    let current_time = timeDateUtil.getCurrentDate();
    let edge_length =
      options["priority-edge-length"] || self.subcluster_threshold;
    let reference_date = options["timestamp"] || self.today;
    let title = options["title"] || "clusterOI " + priority_set.prior_name;
    let node_dates = {};

    if (priority_set.nodes) {
      _.each(priority_set.nodes, (nd) => {
        node_dates[nd.name] = nd.added;
      });
    } else {
      _.each(priority_set.network_nodes, (nd) => {
        node_dates[nd.id] = nd["_priority_set_date"];
      });
    }

    let nodeDates = {};
    if (options.priority_set && options.priority_set.nodes) {
      _.each(options.priority_set.nodes, (d) => {
        nodeDates[d.name] = d.added;
      });
    }

    _.each(nodes, (d) => {
      //console.log (d);
      d.priority_set = 1;
      d._added_date =
        d.id in nodeDates ? nodeDates[d.id] : d._priority_set_date;
      if (d._added_date)
        d._added_date = _defaultDateViewFormatSlider(d._added_date);
      else d._added_date = null;
    });

    let pgDates = _.sortBy(_.keys(_.groupBy(nodes, (d) => d._added_date)));

    let node_set = _.flatten(
      hivtrace_cluster_depthwise_traversal(
        json["Nodes"],
        json["Edges"],
        (e) => {
          return e.length <= edge_length;
        },
        null,
        nodes
      )
    );

    let refDate = _defaultDateViewFormat(reference_date);

    let dco = "fee8c8fdbb84e34a33";
    let defColorsOther = d3.scale
      .ordinal()
      .range(_.map(_.range(0, dco.length, 6), (d) => "#" + dco.substr(d, 6)));

    let maxColors = 4;
    let dcpg = "7b3294c2a5cfa6dba0008837";
    let defColorsPG = d3.scale
      .ordinal()
      .range(_.map(_.range(0, dcpg.length, 6), (d) => "#" + dcpg.substr(d, 6)));

    let viewEnum = [];
    let dateID = {};
    _.each(pgDates, (d, i) => {
      if (d) {
        if (pgDates.length > maxColors) {
          if (i < pgDates.length - maxColors) {
            dateID[d] = 0;
            return;
          } else {
            if (i == pgDates.length - maxColors) {
              dateID[d] = viewEnum.length;
              viewEnum.push(
                "In cluster of interest (added on or before " + d + ")"
              );
              return;
            }
          }
        }
        dateID[d] = viewEnum.length;
        viewEnum.push("In cluster of interest (added " + d + ")");
      }
    });

    let priorityColorOffset = viewEnum.length;

    viewEnum.push("Diagnosed and in network before " + refDate);
    viewEnum.push(
      "Diagnosed or in network on or after " +
      refDate +
      " [directly linked to cluster of interest]"
    );
    viewEnum.push(
      "Diagnosed or in network on or after " +
      refDate +
      " [indirectly linked to cluster of interest]"
    );
    let viewEnumMissing = [...viewEnum, _networkMissing];

    let viewEnumMissingColors = _.map(viewEnumMissing, (d, i) => {
      if (d != _networkMissing) {
        if (i < priorityColorOffset) {
          return defColorsPG(d);
        }
        return defColorsOther(d);
      }
      return "gray";
    });

    let subcluster_view = self
      .view_subcluster(
        -1,
        node_set,
        title,
        {
          skip_recent_rapid: true,
          init_code: function (network) {
            _.each(network.json.Edges, (e) => {
              let other_node = null;
              if (network.json.Nodes[e.target].priority_set == 1) {
                other_node = network.json.Nodes[e.source];
              } else {
                if (network.json.Nodes[e.source].priority_set == 1) {
                  other_node = network.json.Nodes[e.target];
                }
              }
              if (other_node && other_node.priority_set != 1) {
                other_node.priority_set = 2; // directly linked to a priority set node
              }
            });
          },
          "computed-attributes": {
            date_added: {
              depends: [timeDateUtil._networkCDCDateField],
              label: "Date added to cluster of interest",
              type: "Date",
              map: function (node) {
                return node.id in node_dates
                  ? node_dates[node.id]
                  : _networkMissing;
              },
            },
            priority_set: {
              depends: [timeDateUtil._networkCDCDateField],
              label: "Cluster of Interest Status",
              enum: viewEnum,
              type: "String",
              map: function (node) {
                //console.log ("PS", node.id, node.priority_set);
                if (node.priority_set == 1) {
                  if (node._added_date) {
                    return viewEnum[dateID[node._added_date]];
                  }
                  return viewEnum[0];
                }
                if (
                  self._filter_by_date(
                    reference_date,
                    timeDateUtil._networkCDCDateField,
                    current_time,
                    node,
                    true
                  )
                ) {
                  if (node.priority_set == 2) {
                    return viewEnum[priorityColorOffset + 1];
                  } else {
                    return viewEnum[priorityColorOffset + 2];
                  }
                }
                return viewEnum[priorityColorOffset];
              },
              color_scale: function () {
                return d3.scale
                  .ordinal()
                  .domain(viewEnumMissing)
                  .range(viewEnumMissingColors);
              },
            },
          },
        },
        null,
        null,
        edge_length
      )
      .handle_attribute_categorical("priority_set");

    _.each(nodes, (d) => {
      delete d.priority_set;
    });
  };
  self.get_priority_set_editor = function () {
    if (self.priority_set_editor) {
      return self.priority_set_editor;
    }
    if (self.parent_graph_object) {
      return self.parent_graph_object.get_priority_set_editor();
    }
    return null;
  };

  self.priority_set_inject_node_attibutes = function (nodes, node_attributes) {
    let attr_by_id = {};
    _.each(node_attributes, (n, i) => {
      attr_by_id[n.name] = {
        _priority_set_date: n.added || self.today,
        _priority_set_kind: n.kind || _cdcPrioritySetDefaultNodeKind,
        _priority_set_autoadded: n.autoadded || false,
      };
    });
    _.each(nodes, (n) => {
      if (n.id in attr_by_id) {
        _.extend(n, attr_by_id[n.id]);
      }
    });
  };

  self.handle_inline_confirm = function (
    this_button,
    generator,
    text,
    action,
    disabled
  ) {
    this_button = $(this_button.node());
    if (this_button.data("popover_shown") != "shown") {
      let popover = this_button
        .popover({
          sanitize: false,
          placement: "right",
          container: "body",
          html: true,
          content: generator,
          trigger: "manual",
        })
        .on("shown.bs.popover", function (e) {
          var clicked_object = d3.select(this);
          var popover_div = d3.select(
            "#" + clicked_object.attr("aria-describedby")
          );
          var textarea_element = popover_div.selectAll(
            utils.get_ui_element_selector_by_role(
              "priority-description-form",
              true
            )
          );
          var button_element = popover_div.selectAll(
            utils.get_ui_element_selector_by_role(
              "priority-description-save",
              true
            )
          );
          textarea_element.text(text);
          if (disabled) textarea_element.attr("disabled", true);
          button_element.on("click", function (d) {
            action($(textarea_element.node()).val());
            d3.event.preventDefault();
            this_button.click();
          });
          button_element = popover_div.selectAll(
            utils.get_ui_element_selector_by_role(
              "priority-description-dismiss",
              true
            )
          );
          button_element.on("click", function (d) {
            d3.event.preventDefault();
            this_button.click();
          });
        });

      popover.popover("show");
      this_button.data("popover_shown", "shown");
      this_button.off("hidden.bs.popover").on("hidden.bs.popover", function () {
        $(this).data("popover_shown", "hidden");
      });
    } else {
      this_button.data("popover_shown", "hidden");
      this_button.popover("destroy");
    }
  };

  clustersOfInterest.init(self);

  //---------------------------------------------------------------------------------------------------
  // END: NODE SET EDITOR
  //---------------------------------------------------------------------------------------------------

  //---------------------------------------------------------------------------------------------------

  self.node_shaper = {
    id: null,
    shaper: function () {
      return "circle";
    },
  };

  nodesTab.init(d3.select(nodes_table));

  (self.filter_edges = true),
    (self.hide_hxb2 = false),
    (self.charge_correction = 5),
    (self.margin = {
      top: 20,
      right: 10,
      bottom: 30,
      left: 10,
    }),
    (self.width = self.ww - self.margin.left - self.margin.right),
    (self.height = (self.width * 9) / 16),
    (self.cluster_table = d3.select(clusters_table)),
    (self.priority_set_table =
      self._is_CDC_ && options && options["priority-table"]
        ? d3.select(options["priority-table"])
        : null),
    (self.priority_set_table_write =
      self._is_CDC_ && options && options["priority-table-writeback"]
        ? options["priority-table-writeback"]
        : null);
  (self.needs_an_update = false),
    (self.hide_unselected = false),
    (self.show_percent_in_pairwise_table = false),
    (self.gradient_id = 0);

  self.priority_set_table_writeable = true;

  self._calc_country_nodes = function (options) {
    if (options && "country-centers" in options) {
      self.mapProjection = d3.geo
        .mercator()
        .translate([
          self.margin.left + self.width / 2,
          self.margin.top + self.height / 2,
        ])
        .scale((150 * self.width) / 960);
      _.each(self.countryCentersObject, function (value) {
        value.countryXY = self.mapProjection([value.longt, value.lat]);
      });
    }
  };

  if (
    options &&
    "country-centers" in options &&
    "country-outlines" in options
  ) {
    self.countryCentersObject = options["country-centers"];
    self.countryOutlines = options["country-outlines"];
    self._calc_country_nodes(options);
    //console.log (self.countryCentersObject);
    self.showing_on_map = options.showing_on_map;
    //console.log (self.showing_on_map);
  } else {
    self.countryCentersObject = null;
    self.showing_on_map = false;
  }

  self._additional_node_pop_fields = [];
  /** this array contains fields that will be appended to node pop-overs in the network tab
      they will precede all the fields that are shown based on selected labeling */

  if (options && "minimum size" in options) {
    self.minimum_cluster_size = options["minimum size"];
  } else {
    if (self._is_CDC_) {
      self.minimum_cluster_size = 5;
    } else {
      self.minimum_cluster_size = 5;
    }
  }

  timeDateUtil.init(options, self._is_CDC_, timeDateUtil._networkCDCDateField);

  if (self._is_CDC_) {
    self._additional_node_pop_fields.push(timeDateUtil._networkCDCDateField);
  }

  if (options && "core-link" in options) {
    self.core_link_length = options["core-link"];
  } else {
    self.core_link_length = -1;
  }

  if (options && "edge-styler" in options) {
    self.additional_edge_styler = options["edge-styler"];
  } else {
    self.additional_edge_styler = null;
  }

  self.filter_by_size = function (cluster, value) {
    return cluster.children.length >= self.minimum_cluster_size;
  };

  self.filter_singletons = function (cluster, value) {
    return cluster.children.length > 1;
  };

  self.filter_if_added = function (cluster) {
    return self.cluster_attributes[cluster.cluster_id].type != "existing";
  };

  self.filter_time_period = function (cluster) {
    return _.some(self.nodes_by_cluster[cluster.cluster_id], function (n) {
      return (
        self.attribute_node_value_by_id(n, timeDateUtil.getClusterTimeScale()) >=
        self.using_time_filter
      );
    });
  };

  self.cluster_filtering_functions = {
    size: self.filter_by_size,
    singletons: self.filter_singletons,
  };

  self.using_time_filter = null;

  if (self.json.Notes) {
    _.each(self.json.Notes, (s) => (self.warning_string += s + "<br>"));
  }

  if (self.cluster_attributes) {
    self.warning_string += __("network_tab")["cluster_display_info"];
    self.showing_diff = true;
    self.cluster_filtering_functions["new"] = self.filter_if_added;
  } else {
    self.showing_diff = false;
    if (
      timeDateUtil.getClusterTimeScale() &&
      "Cluster sizes" in self.json &&
      self.json["Cluster sizes"].length > 250
    ) {
      self.using_time_filter = timeDateUtil.getCurrentDate();
      self.warning_string += __("network_tab")["cluster_display_info"];
      self.using_time_filter.setFullYear(
        self.using_time_filter.getFullYear() - 1
      );
      self.cluster_filtering_functions["recent"] = self.filter_time_period;
    }
  }

  self.cluster_display_filter = function (cluster) {
    return _.every(self.cluster_filtering_functions, function (filter) {
      return filter(cluster);
    });
  };

  self.initial_packed =
    options && options["initial_layout"] == "tiled" ? false : true;

  self.recent_rapid_definition_simple = function (network, date) {
    date = date || self.get_reference_date();

    var subcluster_enum_simple = [
      "Not a member of national priority clusterOI", // 1,4,5,6
      "12 months and in national priority clusterOI", // 2
      "36 months and in national priority clusterOI", // 3
      ">36 months and in national priority clusterOI", // 0
    ];

    return {
      depends: [timeDateUtil._networkCDCDateField],
      label: "Subcluster or Priority Node",
      enum: subcluster_enum_simple,
      type: "String",
      color_scale: function () {
        return d3.scale
          .ordinal()
          .domain(subcluster_enum_simple.concat([_networkMissing]))
          .range(
            _.union(
              ["#CCCCCC", "red", "blue", "#9A4EAE"],
              [_networkMissingColor]
            )
          );
      },

      map: function (node) {
        if (node.subcluster_label) {
          if (node.nationalCOI) {
            return subcluster_enum_simple[node.nationalCOI];
          }
        }
        return subcluster_enum_simple[0];
      },
    };
  };

  self.recent_rapid_definition = function (network, date) {
    date = date || self.get_reference_date();
    var subcluster_enum = [
      "No, dx>36 months", // 0
      "No, but dx≤12 months",
      "Yes (dx≤12 months)",
      "Yes (12<dx≤ 36 months)",
      "Future node", // 4
      "Not a member of subcluster", // 5
      "Not in a subcluster",
      "No, but 12<dx≤ 36 months",
    ];

    return {
      depends: [timeDateUtil._networkCDCDateField],
      label: "ClusterOI membership as of " + _defaultDateViewFormat(date),
      enum: subcluster_enum,
      //type: "String",
      volatile: true,
      color_scale: function () {
        return d3.scale
          .ordinal()
          .domain(subcluster_enum.concat([_networkMissing]))
          .range(
            _.union(
              [
                "steelblue",
                "pink",
                "red",
                "#FF8C00",
                "#9A4EAE",
                "yellow",
                "#FFFFFF",
                "#FFD580",
              ],
              [_networkMissingColor]
            )
          );
      },

      map: function (node) {
        if (node.subcluster_label) {
          if (node.priority_flag > 0) {
            return subcluster_enum[node.priority_flag];
          }
          return subcluster_enum[0];
        }
        return subcluster_enum[6];
      },
    };
  };

  self._networkPredefinedAttributeTransforms = {
    /** runtime computed node attributes, e.g. transforms of existing attributes */

    binned_vl_recent_value: {
      depends: ["vl_recent_value"],
      label: "binned_vl_recent_value",
      enum: ["<200", "200-10000", ">10000"],
      type: "String",
      color_scale: function () {
        return d3.scale
          .ordinal()
          .domain(["<200", "200-10000", ">10000", _networkMissing])
          .range(_.union(_networkSequentialColor[3], [_networkMissingColor]));
      },

      map: function (node) {
        var vl_value = self.attribute_node_value_by_id(
          node,
          "vl_recent_value",
          true
        );
        if (vl_value != _networkMissing) {
          if (vl_value <= 200) {
            return "<200";
          }
          if (vl_value <= 10000) {
            return "200-10000";
          }
          return ">10000";
        }
        return _networkMissing;
      },
    },

    binned_vl_recent_value_adj: {
      depends: ["vl_recent_value_adj"],
      label: "Most Recent Viral Load Category Binned",
      enum: ["<200", "200-10000", ">10000"],
      type: "String",
      color_scale: function () {
        return d3.scale
          .ordinal()
          .domain(["<200", "200-10000", ">10000", _networkMissing])
          .range(_.union(_networkSequentialColor[3], [_networkMissingColor]));
      },

      map: function (node) {
        var vl_value = self.attribute_node_value_by_id(
          node,
          "vl_recent_value_adj",
          true
        );
        if (vl_value != _networkMissing) {
          if (vl_value <= 200) {
            return "<200";
          }
          if (vl_value <= 10000) {
            return "200-10000";
          }
          return ">10000";
        }
        return _networkMissing;
      },
    },

    vl_result_interpretation: {
      depends: ["vl_recent_value", "result_interpretation"],
      label: "vl_result_interpretation",
      color_stops: 6,
      scale: d3.scale.log(10).domain([10, 1e6]).range([0, 5]),
      category_values: ["Suppressed", "Viremic (above assay limit)"],
      type: "Number-categories",
      color_scale: function (attr) {
        var color_scale_d3 = d3.scale
          .linear()
          .range([
            "#d53e4f",
            "#fc8d59",
            "#fee08b",
            "#e6f598",
            "#99d594",
            "#3288bd",
          ])
          .domain(_.range(_networkContinuousColorStops, -1, -1));

        return function (v) {
          if (_.isNumber(v)) {
            return color_scale_d3(attr.scale(v));
          }
          switch (v) {
            case attr.category_values[0]:
              return color_scale_d3(0);
              break;
            case attr.category_values[1]:
              return color_scale_d3(5);
              break;

            default:
              return _networkMissingColor;
          }
        };
      },
      label_format: d3.format(",.0f"),
      map: function (node) {
        var vl_value = self.attribute_node_value_by_id(
          node,
          "vl_recent_value",
          true
        );
        var result_interpretation = self.attribute_node_value_by_id(
          node,
          "result_interpretation"
        );

        if (
          vl_value != _networkMissing ||
          result_interpretation != _networkMissing
        ) {
          if (result_interpretation != _networkMissing) {
            if (result_interpretation == "<") {
              return "Suppressed";
            }
            if (result_interpretation == ">") {
              return "Viremic (above assay limit)";
            }
            if (vl_value != _networkMissing) {
              return vl_value;
            }
          } else {
            return vl_value;
          }
        }

        return _networkMissing;
      },
    },

    //subcluster_or_priority_node_simple: self.recent_rapid_definition_simple,
    //subcluster_or_priority_node: self.recent_rapid_definition,

    /*subcluster_index: {
      depends: [timeDateUtil._networkCDCDateField],
      label: "Subcluster ID",
      type: "String",

      map: function (node) {
        return node.subcluster_label;
      },
    },*/

    age_dx_normalized: {
      depends: ["age_dx"],
      overwrites: "age_dx",
      label: "Age at Diagnosis",
      enum: ["<13", "13-19", "20-29", "30-39", "40-49", "50-59", "≥60"],
      type: "String",
      color_scale: function () {
        return d3.scale
          .ordinal()
          .domain([
            "<13",
            "13-19",
            "20-29",
            "30-39",
            "40-49",
            "50-59",
            "≥60",
            _networkMissing,
          ])
          .range([
            "#b10026",
            "#e31a1c",
            "#fc4e2a",
            "#fd8d3c",
            "#feb24c",
            "#fed976",
            "#ffffb2",
            "#636363",
          ]);
      },
      map: function (node) {
        var vl_value = self.attribute_node_value_by_id(node, "age_dx");
        if (vl_value == ">=60") {
          return "≥60";
        }
        if (vl_value == "\ufffd60") {
          return "≥60";
        }
        if (+vl_value >= 60) {
          return "≥60";
        }
        return vl_value;
      },
    },

    years_since_dx: {
      depends: [timeDateUtil._networkCDCDateField],
      label: "Years since diagnosis",
      type: "Number",
      label_format: d3.format(".2f"),
      map: function (node) {
        try {
          var value = self._parse_dates(
            self.attribute_node_value_by_id(node, timeDateUtil._networkCDCDateField)
          );

          if (value) {
            value = (self.today - value) / 31536000000;
          } else {
            value = _networkMissing;
          }

          return value;
        } catch (err) {
          return _networkMissing;
        }
      },
      color_scale: function (attr) {
        var range_without_missing = _.without(
          attr.value_range,
          _networkMissing
        );
        var color_scale = _.compose(
          d3.interpolateRgb("#ffffcc", "#800026"),
          d3.scale
            .linear()
            .domain([
              range_without_missing[0],
              range_without_missing[range_without_missing.length - 1],
            ])
            .range([0, 1])
        );
        return function (v) {
          if (v == _networkMissing) {
            return _networkMissingColor;
          }
          return color_scale(v);
        };
      },
    },

    hiv_aids_dx_dt_year: {
      depends: [timeDateUtil._networkCDCDateField],
      label: "Diagnosis Year",
      type: "Number",
      label_format: d3.format(".0f"),
      map: function (node) {
        try {
          var value = self._parse_dates(
            self.attribute_node_value_by_id(node, timeDateUtil._networkCDCDateField)
          );
          if (value) {
            value = "" + value.getFullYear();
          } else {
            value = _networkMissing;
          }
          return value;
        } catch (err) {
          return _networkMissing;
        }
      },
      color_scale: function (attr) {
        var range_without_missing = _.without(
          attr.value_range,
          _networkMissing
        );
        var color_scale = _.compose(
          d3.interpolateRgb("#ffffcc", "#800026"),
          d3.scale
            .linear()
            .domain([
              range_without_missing[0],
              range_without_missing[range_without_missing.length - 1],
            ])
            .range([0, 1])
        );
        return function (v) {
          if (v == _networkMissing) {
            return _networkMissingColor;
          }
          return color_scale(v);
        };
      },
    },
  };

  if (self.cluster_attributes) {
    self._networkPredefinedAttributeTransforms["_newly_added"] = {
      label: "Compared to previous network",
      enum: ["Existing", "New", "Moved clusters"],
      type: "String",
      map: function (node) {
        if (node.attributes.indexOf("new_node") >= 0) {
          return "New";
        }
        if (node.attributes.indexOf("moved_clusters") >= 0) {
          return "Moved clusters";
        }
        return "Existing";
      },
      color_scale: function () {
        return d3.scale
          .ordinal()
          .domain(["Existing", "New", "Moved clusters", _networkMissing])
          .range(["#7570b3", "#d95f02", "#1b9e77", "gray"]);
      },
    };
  }

  if (self.precomputed_subclusters) {
    _.each(self.precomputed_subclusters, (v, k) => {
      self._networkPredefinedAttributeTransforms["_subcluster" + k] = {
        label: "Subcluster @" + d3.format("p")(+k),
        type: "String",
        map: function (node) {
          if ("subcluster" in node) {
            var sub_at_k = _.find(node.subcluster, (t) => t[0] == k);
            if (sub_at_k) {
              return sub_at_k[1];
            }
          }
          return "Not in a subcluster";
        },
      };
    });
  }

  if (options && options["computed-attributes"]) {
    _.extend(
      self._networkPredefinedAttributeTransforms,
      options["computed-attributes"]
    );
  }

  self._parse_dates = function (value) {
    if (value instanceof Date) {
      return value;
    }
    var parsed_value = null;

    var passed = _.any(_defaultDateFormats, function (f) {
      parsed_value = f.parse(value);
      return parsed_value;
    });

    //console.log (value + " mapped to " + parsed_value);

    if (passed) {
      if (
        self._is_CDC_ &&
        (parsed_value.getFullYear() < 1970 ||
          parsed_value.getFullYear() > _networkUpperBoundOnDate)
      ) {
        throw "Invalid date";
      }
      return parsed_value;
    }

    throw "Invalid date";
  };

  /*------------ Network layout code ---------------*/
  var handle_cluster_click = function (cluster, release) {
    var container = d3.select(self.container);
    var id = "d3_context_menu_id";
    var menu_object = container.select("#" + id);

    if (menu_object.empty()) {
      menu_object = container
        .append("ul")
        .attr("id", id)
        .attr("class", "dropdown-menu")
        .attr("role", "menu");
    }

    menu_object.selectAll("li").remove();

    var already_fixed = cluster && cluster.fixed == 1;

    if (cluster) {
      menu_object
        .append("li")
        .append("a")
        .attr("tabindex", "-1")
        .text("Expand cluster")
        .on("click", function (d) {
          cluster.fixed = 0;
          self.expand_cluster_handler(cluster, true);
          menu_object.style("display", "none");
        });

      menu_object
        .append("li")
        .append("a")
        .attr("tabindex", "-1")
        .text("Center on screen")
        .on("click", function (d) {
          cluster.fixed = 0;
          center_cluster_handler(cluster);
          menu_object.style("display", "none");
        });

      menu_object
        .append("li")
        .append("a")
        .attr("tabindex", "-1")
        .text(function (d) {
          if (cluster.fixed) return "Allow cluster to float";
          return "Hold cluster at current position";
        })
        .on("click", function (d) {
          cluster.fixed = !cluster.fixed;
          menu_object.style("display", "none");
        });

      if (self.isPrimaryGraph) {
        menu_object
          .append("li")
          .append("a")
          .attr("tabindex", "-1")
          .text(function (d) {
            return "Show this cluster in separate tab";
          })
          .on("click", function (d) {
            self.open_exclusive_tab_view(
              cluster.cluster_id,
              null,
              null,
              self._distance_gate_options()
            );
            menu_object.style("display", "none");
          });
      }

      if (self.get_priority_set_editor()) {
        menu_object
          .append("li")
          .append("a")
          .attr("tabindex", "-1")
          .text(function (d) {
            return "Add this cluster to the cluster of interest";
          })
          .on("click", function (d) {
            self
              .get_priority_set_editor()
              .append_nodes(_.map(cluster.children, (c) => c.id));
          });
      }

      // Only show the "Show on map" option for clusters with valid country info (for now just 2 letter codes) for each node.
      var show_on_map_enabled = self.countryCentersObject;

      show_on_map_enabled = _.every(cluster.children, function (node) {
        //console.log (node.patient_attributes);
        return self._get_node_country(node).length == 2;
      });

      if (show_on_map_enabled) {
        menu_object
          .append("li")
          .append("a")
          .attr("tabindex", "-1")
          .text("Show on map")
          .on("click", function (d) {
            //console.log(cluster)
            self.open_exclusive_tab_view(
              cluster.cluster_id,
              null,
              (cluster_id) => {
                return "Map of cluster: " + cluster_id;
              },
              { showing_on_map: true }
            );
          });
      }

      cluster.fixed = 1;

      menu_object
        .style("position", "absolute")
        .style("left", "" + d3.event.offsetX + "px")
        .style("top", "" + d3.event.offsetY + "px")
        .style("display", "block");
    } else {
      if (release) {
        release.fixed = 0;
      }
      menu_object.style("display", "none");
    }

    container.on(
      "click",
      function (d) {
        handle_cluster_click(null, already_fixed ? null : cluster);
      },
      true
    );
  };

  /*self._handle_inline_charts = function (e) {

  }*/

  self._get_node_country = function (node) {
    var countryCodeAlpha2 = self.attribute_node_value_by_id(node, "country");
    if (countryCodeAlpha2 == _networkMissing) {
      countryCodeAlpha2 = self.attribute_node_value_by_id(node, "Country");
    }
    return countryCodeAlpha2;
  };

  self._draw_topomap = function (no_redraw) {
    if (options && "showing_on_map" in options) {
      var countries = topojson.feature(
        countryOutlines,
        countryOutlines.objects.countries
      ).features;
      var mapsvg = d3.select("#" + self.dom_prefix + "-network-svg");
      var path = d3.geo.path().projection(self.mapProjection);
      var countries = mapsvg.selectAll(".country").data(countries);

      countries.enter().append("path");
      countries.exit().remove();

      self.countries_in_cluster = {};

      _.each(self.nodes, function (node) {
        var countryCodeAlpha2 = self._get_node_country(node);
        var countryCodeNumeric =
          self.countryCentersObject[countryCodeAlpha2].countryCodeNumeric;
        if (!(countryCodeNumeric in self.countries_in_cluster)) {
          self.countries_in_cluster[countryCodeNumeric] = true;
        }
      });

      countries
        .attr("class", "country")
        .attr("d", path)
        .attr("stroke", "saddlebrown")
        .attr("fill", function (d) {
          if (d.id in self.countries_in_cluster) {
            return "navajowhite";
          } else {
            return "bisque";
          }
        })
        .attr("stroke-width", function (d) {
          if (d.id in self.countries_in_cluster) {
            return 1.5;
          } else {
            return 0.5;
          }
        });
    }
    return self;
  };

  self._check_for_time_series = function (export_items) {
    var event_handler = function (network, e) {
      if (e) {
        e = d3.select(e);
      }
      if (!network.network_cluster_dynamics) {
        network.network_cluster_dynamics = network.network_svg
          .append("g")
          .attr("id", self.dom_prefix + "-dynamics-svg")
          .attr("transform", "translate (" + network.width * 0.45 + ",0)");

        network.handle_inline_charts = function (plot_filter) {
          var attr = null;
          var color = null;
          if (
            network.colorizer["category_id"] &&
            !network.colorizer["continuous"]
          ) {
            var attr_desc =
              network.json[_networkGraphAttrbuteID][
              network.colorizer["category_id"]
              ];
            attr = {};
            attr[network.colorizer["category_id"]] = attr_desc["label"];
            color = {};
            color[attr_desc["label"]] = network.colorizer["category"];
          }

          misc.cluster_dynamics(
            network.extract_network_time_series(
              timeDateUtil.getClusterTimeScale(),
              attr,
              plot_filter
            ),
            network.network_cluster_dynamics,
            "Quarter of Diagnosis",
            "Number of Cases",
            null,
            null,
            {
              base_line: 20,
              top: network.margin.top,
              right: network.margin.right,
              bottom: 3 * 20,
              left: 5 * 20,
              font_size: 12,
              rect_size: 14,
              width: network.width / 2,
              height: network.height / 2,
              colorizer: color,
              prefix: network.dom_prefix,
              barchart: true,
              drag: {
                x: network.width * 0.45,
                y: 0,
              },
            }
          );
        };
        network.handle_inline_charts();
        if (e) {
          e.text("Hide time-course plots");
        }
      } else {
        if (e) {
          e.text("Show time-course plots");
        }
        network.network_cluster_dynamics.remove();
        network.network_cluster_dynamics = null;
        network.handle_inline_charts = null;
      }
    };

    if (timeDateUtil.getClusterTimeScale()) {
      if (export_items) {
        export_items.push(["Show time-course plots", event_handler]);
      } else {
        event_handler(self);
      }
    }
  };

  self.open_exclusive_tab_close = function (
    tab_element,
    tab_content,
    restore_to_tag
  ) {
    //console.log (restore_to_tag);
    $(restore_to_tag).tab("show");
    $("#" + tab_element).remove();
    $("#" + tab_content).remove();
  };

  self.open_exclusive_tab_view = function (
    cluster_id,
    custom_filter,
    custom_name,
    additional_options,
    include_injected_edges
  ) {
    var cluster = _.find(self.clusters, function (c) {
      return c.cluster_id == cluster_id;
    });

    if (!cluster) {
      return;
    }

    additional_options = additional_options || {};

    additional_options["parent_graph"] = self;

    var filtered_json = _extract_single_cluster(
      custom_filter
        ? _.filter(self.json.Nodes, custom_filter)
        : cluster.children,
      null,
      null,
      null,
      include_injected_edges
    );

    if (_networkGraphAttrbuteID in json) {
      filtered_json[_networkGraphAttrbuteID] = {};
      jQuery.extend(
        true,
        filtered_json[_networkGraphAttrbuteID],
        json[_networkGraphAttrbuteID]
      );
    }

    var export_items = [];
    if (!self._is_CDC_executive_mode) {
      export_items.push([
        "Export cluster to .CSV",
        function (network) {
          helpers.export_csv_button(
            self._extract_attributes_for_nodes(
              self._extract_nodes_by_id(cluster_id),
              self._extract_exportable_attributes()
            )
          );
        },
      ]);
    }

    //self._check_for_time_series(export_items);

    if ("extra_menu" in additional_options) {
      _.each(export_items, function (item) {
        additional_options["extra_menu"]["items"].push(item);
      });
    } else {
      _.extend(additional_options, {
        extra_menu: {
          title: "Action",
          items: export_items,
        },
      });
    }

    return self.open_exclusive_tab_view_aux(
      filtered_json,
      custom_name ? custom_name(cluster_id) : "Cluster " + cluster_id,
      additional_options
    );
  };

  self._random_id = function (alphabet, length) {
    alphabet = alphabet || ["a", "b", "c", "d", "e", "f", "g"];
    length = length || 32;
    var s = "";
    for (var i = 0; i < length; i++) {
      s += _.sample(alphabet);
    }
    return s;
  };

  self.open_exclusive_tab_view_aux = function (
    filtered_json,
    title,
    option_extras
  ) {
    var letters = ["a", "b", "c", "d", "e", "f", "g"];

    var random_prefix = self._random_id(letters, 32);
    var random_tab_id = random_prefix + "_tab";
    var random_content_id = random_prefix + "_div";
    var random_button_bar = random_prefix + "_ui";

    while (
      $("#" + random_tab_id).length ||
      $("#" + random_content_id).length ||
      $("#" + random_button_bar).length
    ) {
      random_prefix = self._random_id(letters, 32);
      random_tab_id = random_prefix + "_tab";
      random_content_id = random_prefix + "_div";
      random_button_bar = random_prefix + "_ui";
    }

    var tab_container = "top_level_tab_container";
    var content_container = "top_level_tab_content";
    var go_here_when_closed = "#trace-default-tab";

    // add new tab to the menu bar and switch to it
    var new_tab_header = $("<li></li>").attr("id", random_tab_id);

    var new_link = $("<a></a>")
      .attr("href", "#" + random_content_id)
      .attr("data-toggle", "tab")
      .text(title);
    $(
      '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>'
    )
      .appendTo(new_link)
      .on("click", function () {
        self.open_exclusive_tab_close(
          random_tab_id,
          random_content_id,
          go_here_when_closed
        );
      });

    new_link.appendTo(new_tab_header);
    $("#" + tab_container).append(new_tab_header);

    var new_tab_content = $("<div></div>")
      .addClass("tab-pane")
      .attr("id", random_content_id)
      .data("cluster", option_extras.cluster_id);

    if (option_extras.type == "subcluster") {
      new_tab_content
        .addClass("subcluster-view")
        .addClass("subcluster-" + option_extras.cluster_id.replace(".", "_"));
    }

    //     <li class='disabled' id="attributes-tab"><a href="#trace-attributes" data-toggle="tab">Attributes</a></li>
    var new_button_bar = null;
    if (filtered_json) {
      new_button_bar = $('[data-hivtrace="cluster-clone"]')
        .clone()
        .attr("data-hivtrace", null);
      new_button_bar
        .find("[data-hivtrace-button-bar='yes']")
        .attr("id", random_button_bar)
        .addClass("cloned-cluster-tab")
        .attr("data-hivtrace-button-bar", null);

      new_button_bar.appendTo(new_tab_content);
    }
    new_tab_content.appendTo("#" + content_container);

    $(new_link).on("show.bs.tab", function (e) {
      //console.log (e);
      if (e.relatedTarget) {
        //console.log (e.relatedTarget);
        go_here_when_closed = e.relatedTarget;
      }
    });

    // show the new tab
    $(new_link).tab("show");

    var cluster_view;

    if (filtered_json) {
      var cluster_options = {
        no_cdc: options && options["no_cdc"],
        "minimum size": 0,
        secondary: true,
        prefix: random_prefix,
        extra_menu:
          options && "extra_menu" in options ? options["extra_menu"] : null,
        "edge-styler":
          options && "edge-styler" in options ? options["edge-styler"] : null,
        "no-subclusters": true,
        "no-subcluster-compute": false,
      };

      if (option_extras) {
        _.extend(cluster_options, option_extras);
      }

      if (
        option_extras.showing_on_map &&
        self.countryCentersObject &&
        self.countryOutlines
      ) {
        cluster_options["showing_on_map"] = true;
        cluster_options["country-centers"] = self.countryCentersObject;
        cluster_options["country-outlines"] = self.countryOutlines;

        // Create an array of the countries in the selected cluster for use in styling the map.
        if ("extra-graphics" in cluster_options) {
          var draw_map = function (other_code, network) {
            other_code(network);
            return network._draw_topomap();
          };

          cluster_options["extra-graphics"] = _.wrap(
            draw_map,
            cluster_options["extra-graphics"]
          );
        } else {
          cluster_options["extra-graphics"] = function (network) {
            return network._draw_topomap();
          };
        }
      }

      cluster_options["today"] = self.today;

      cluster_view = hivtrace.clusterNetwork(
        filtered_json,
        "#" + random_content_id,
        null,
        null,
        random_button_bar,
        attributes,
        null,
        null,
        null,
        parent_container,
        cluster_options
      );

      if (self.colorizer["category_id"]) {
        if (self.colorizer["continuous"]) {
          cluster_view.handle_attribute_continuous(
            self.colorizer["category_id"]
          );
        } else {
          cluster_view.handle_attribute_categorical(
            self.colorizer["category_id"]
          );
        }
      }

      if (self.node_shaper["id"]) {
        cluster_view.handle_shape_categorical(self.node_shaper["id"]);
      }

      if (self.colorizer["opacity_id"]) {
        cluster_view.handle_attribute_opacity(self.colorizer["opacity_id"]);
      }

      cluster_view.expand_cluster_handler(cluster_view.clusters[0], true);
    } else {
      return new_tab_content.attr("id");
    }
    return cluster_view;
  };

  // ensure all checkboxes are unchecked at initialization
  $('input[type="checkbox"]').prop("checked", false);

  var handle_node_click = function (node) {
    if (d3.event.defaultPrevented) return;
    var container = d3.select(self.container);
    var id = "d3_context_menu_id";
    var menu_object = container.select("#" + id);

    if (menu_object.empty()) {
      menu_object = container
        .append("ul")
        .attr("id", id)
        .attr("class", "dropdown-menu")
        .attr("role", "menu");
    }

    menu_object.selectAll("li").remove();

    if (node) {
      node.fixed = 1;
      menu_object
        .append("li")
        .append("a")
        .attr("tabindex", "-1")
        .text(__("clusters_main")["collapse_cluster"])
        .on("click", function (d) {
          node.fixed = 0;
          collapse_cluster_handler(node, true);
          menu_object.style("display", "none");
        });

      menu_object
        .append("li")
        .append("a")
        .attr("tabindex", "-1")
        .text(function (d) {
          return node.show_label ? "Hide text label" : "Show text label";
        })
        .on("click", function (d) {
          node.fixed = 0;
          //node.show_label = !node.show_label;
          handle_node_label(container, node);
          //collapse_cluster_handler(node, true);
          menu_object.style("display", "none");
        });

      if (self.get_priority_set_editor()) {
        menu_object
          .append("li")
          .append("a")
          .attr("tabindex", "-1")
          .text(function (d) {
            return "Add this node to the cluster of interest";
          })
          .on("click", function (d) {
            self.get_priority_set_editor().append_node(node.id, true);
          });
      }

      // SW20180605 : To be implemented

      //menu_object
      //  .append("li")
      //  .append("a")
      //  .attr("tabindex", "-1")
      //  .text("Show sequences used to make cluster")
      //  .on("click", function(d) {
      //    node.fixed = 0;
      //    show_sequences_in_cluster (node, true);
      //    menu_object.style("display", "none");
      //  });

      menu_object
        .style("position", "absolute")
        .style("left", "" + d3.event.offsetX + "px")
        .style("top", "" + d3.event.offsetY + "px")
        .style("display", "block");
    } else {
      menu_object.style("display", "none");
    }

    container.on(
      "click",
      function (d) {
        handle_node_click(null);
      },
      true
    );
  };

  function get_initial_xy(packed) {
    // create clusters from nodes
    var mapped_clusters = get_all_clusters(self.nodes);

    var d_clusters = {
      id: "root",
      children: [],
    };

    // filter out clusters that are to be excluded
    if (self.exclude_cluster_ids) {
      mapped_clusters = _.omit(mapped_clusters, self.exclude_cluster_ids);
    }

    d_clusters.children = _.map(mapped_clusters, (value, key) => {
      return {
        cluster_id: key,
        children: value,
      };
    });

    var treemap = packed
      ? d3.layout
        .pack()
        .size([self.width, self.height])
        //.sticky(true)
        .children(function (d) {
          return d.children;
        })
        .value(function (d) {
          return Math.pow(d.parent.children.length, 1.5);
        })
        .sort(function (a, b) {
          return b.value - a.value;
        })
        .padding(5)
      : d3.layout
        .treemap()
        .size([self.width, self.height])
        //.sticky(true)
        .children(function (d) {
          return d.children;
        })
        .value(function (d) {
          return Math.pow(d.parent.children.length, 1.0);
        })
        .sort(function (a, b) {
          return a.value - b.value;
        })
        .ratio(1);

    var clusters = treemap.nodes(d_clusters);
    _.each(clusters, function (c) {
      //c.fixed = true;
    });
    return clusters;
  }

  function prepare_data_to_graph() {
    var graphMe = {};
    graphMe.all = [];
    graphMe.edges = [];
    graphMe.nodes = [];
    graphMe.clusters = [];

    var expandedClusters = [];
    var drawnNodes = [];

    self.clusters.forEach(function (x) {
      if (self.cluster_display_filter(x)) {
        // Check if hxb2_linked is in a child
        var hxb2_exists =
          x.children.some(function (c) {
            return c.hxb2_linked;
          }) && self.hide_hxb2;
        if (!hxb2_exists) {
          if (x.collapsed) {
            graphMe.clusters.push(x);
            graphMe.all.push(x);
          } else {
            expandedClusters[x.cluster_id] = true;
          }
        }
      }
    });

    self.nodes.forEach(function (x, i) {
      if (expandedClusters[x.cluster]) {
        drawnNodes[i] = graphMe.nodes.length + graphMe.clusters.length;
        graphMe.nodes.push(x);
        graphMe.all.push(x);
      }
    });

    self.edges.forEach(function (x) {
      if (!(x.removed && self.filter_edges)) {
        if (
          drawnNodes[x.source] !== undefined &&
          drawnNodes[x.target] !== undefined
        ) {
          var y = {};
          for (var prop in x) {
            y[prop] = x[prop];
          }

          y.source = drawnNodes[x.source];
          y.target = drawnNodes[x.target];
          y.ref = x;
          graphMe.edges.push(y);
        }
      }
    });

    return graphMe;
  }

  self._refresh_subcluster_view = function (set_date) {
    self.annotate_priority_clusters(timeDateUtil._networkCDCDateField, 36, 12, set_date);

    var field_def = self.recent_rapid_definition(self, set_date);

    //console.log (field_def.dimension);

    if (field_def) {
      _.each(self.nodes, function (node) {
        const attr_v = field_def["map"](node, self);
        inject_attribute_node_value_by_id(
          node,
          "subcluster_temporal_view",
          attr_v
        );
      });

      self.inject_attribute_description("subcluster_temporal_view", field_def);
      self._aux_process_category_values(
        self._aux_populate_category_fields(
          field_def,
          "subcluster_temporal_view"
        )
      );
      self.handle_attribute_categorical("subcluster_temporal_view");
    }
  };

  self.view_subcluster = function (
    cluster,
    custom_filter,
    custom_name,
    options,
    custom_edge_filter,
    include_injected_edges,
    length_threshold
  ) {
    length_threshold = length_threshold || self.subcluster_threshold;
    var filtered_json = _extract_single_cluster(
      custom_filter
        ? _.isArray(custom_filter)
          ? custom_filter
          : _.filter(self.json.Nodes, custom_filter)
        : cluster.children,
      custom_edge_filter ||
      function (e) {
        return e.length <= length_threshold;
      },
      false,
      null,
      include_injected_edges
    );

    _.each(filtered_json.Nodes, function (n) {
      n.subcluster_label = "1.1";
    });

    if (_networkGraphAttrbuteID in json) {
      filtered_json[_networkGraphAttrbuteID] = {};
      jQuery.extend(
        true,
        filtered_json[_networkGraphAttrbuteID],
        json[_networkGraphAttrbuteID]
      );
    }

    options = options || new Object();

    options["parent_graph"] = self;

    var extra_menu_items = [
      [
        function (network, item) {
          var enclosure = item.append("div").classed("form-group", true);
          var label = enclosure
            .append("label")
            .text("Recalculate National Priority from ")
            .classed("control-label", true);
          var date = enclosure
            .append("input")
            .attr("type", "date")
            .classed("form-control", true)
            .attr("value", _defaultDateViewFormatSlider(self.today))
            .attr("max", _defaultDateViewFormatSlider(self.today))
            .attr(
              "min",
              _defaultDateViewFormatSlider(
                d3.min(network.nodes, function (node) {
                  return network.attribute_node_value_by_id(
                    node,
                    timeDateUtil._networkCDCDateField
                  );
                })
              )
            )
            .on("change", function (e) {
              //d3.event.preventDefault();
              var set_date = _defaultDateViewFormatSlider.parse(this.value);
              if (this.value) {
                network._refresh_subcluster_view(set_date);

                enclosure
                  .classed("has-success", true)
                  .classed("has-error", false);
              } else {
                enclosure
                  .classed("has-success", false)
                  .classed("has-error", true);
              }
            })
            .on("click", function (e) {
              d3.event.stopPropagation();
            });
        },
        null,
      ],
    ];
    if (!self._is_CDC_executive_mode) {
      extra_menu_items.push([
        "Export cluster to .CSV",
        function (network) {
          helpers.export_csv_button(
            network._extract_attributes_for_nodes(
              network._extract_nodes_by_id("1.1"),
              network._extract_exportable_attributes()
            )
          );
        },
      ]);
    }

    options["type"] = "subcluster";
    options["cluster_id"] = cluster.cluster_id || "N/A";
    if ("extra_menu" in options) {
      options["extra_menu"]["items"] =
        options["extra_menu"]["items"].concat(extra_menu_items);
    } else {
      options["extra_menu"] = {
        title: "Action",
        items: extra_menu_items,
      };
    }

    //self._check_for_time_series(extra_menu_items);
    var cluster_view = self.open_exclusive_tab_view_aux(
      filtered_json,
      custom_name || "Subcluster " + cluster.cluster_id,
      options
    );
    if (!options.skip_recent_rapid)
      cluster_view.handle_attribute_categorical("subcluster_or_priority_node");
    return cluster_view;

    /*var selector =
      ".subcluster-" +
      cluster.id.replace(".", "_") +
      " .show-small-clusters-button";

    var item = $(
      '<span class="input-group-addon btn view-parent-btn">View Parent</span>'
    )
      .data("cluster_id", cluster.parent_cluster.cluster_id)
      .insertAfter(selector);

    item.on("click", function(e) {
      self.open_exclusive_tab_view($(this).data("cluster_id"));
    });*/
  };

  function _n_months_ago(reference_date, months) {
    var past_date = new Date(reference_date);
    var past_months = past_date.getMonth();
    var diff_year = Math.floor(months / 12);
    var left_over = months - diff_year * 12;

    if (left_over > past_months) {
      past_date.setFullYear(past_date.getFullYear() - diff_year - 1);
      past_date.setMonth(12 - (left_over - past_months));
    } else {
      past_date.setFullYear(past_date.getFullYear() - diff_year);
      past_date.setMonth(past_months - left_over);
    }

    //past_date.setTime (past_date.getTime () - months * 30 * 24 * 3600000);
    return past_date;
  }

  var oldest_nodes_first = function (n1, n2) {
    let date_field = date_field || timeDateUtil._networkCDCDateField;

    // consistent node sorting, older nodes first
    var node1_dx = self.attribute_node_value_by_id(n1, date_field);
    var node2_dx = self.attribute_node_value_by_id(n2, date_field);

    if (node1_dx == node2_dx) {
      return n1.id < n2.id ? -1 : 1;
    } else {
      return node1_dx < node2_dx ? -1 : 1;
    }

    return 0;
  };

  self._filter_by_date = function (
    cutoff,
    date_field,
    start_date,
    node,
    count_newly_added
  ) {
    if (count_newly_added && self._is_new_node(node)) {
      return true;
    }
    var node_dx = self.attribute_node_value_by_id(node, date_field);
    if (node_dx instanceof Date) {
      return node_dx >= cutoff && node_dx <= start_date;
    } else {
      try {
        node_dx = self._parse_dates(
          self.attribute_node_value_by_id(node, date_field)
        );
        if (node_dx instanceof Date) {
          return node_dx >= cutoff && node_dx <= start_date;
        }
      } catch (err) {
        return undefined;
      }
    }
    return false;
  };

  self.annotate_priority_clusters = function (
    date_field,
    span_months,
    recent_months,
    start_date
  ) {
    /* 
        values for priority_flag
            0: 0.5% subcluster
            1: last 12 months NOT in a priority cluster
            2: last 12 month IN priority cluster
            3: in priority cluster but not in 12 months
            4-7 is only computed for start dates different from the network date
            4: date present but is in the FUTURE compared to start_date
            5: date present but is between 1900 and start_date
            6: date missing
            7: in 0.5% cluster 12<dx<36 months but not a CoI
            
            
        SLKP 20221128:
            Add a calculation for simple classification of priority clusters
            
            0: not in a national priority CoI
            1: IN a national priority CoI ≤12 months
            2: IN a national priority CoI 12 - 36 months
            3: IN a national priority CoI >36 months
    */

    try {
      start_date = start_date || self.get_reference_date();

      var cutoff_long = _n_months_ago(start_date, span_months);
      var cutoff_short = _n_months_ago(start_date, recent_months);

      var node_iterator;

      if (start_date == self.today) {
        node_iterator = self.nodes;
      } else {
        var beginning_of_time = timeDateUtil.getCurrentDate();
        beginning_of_time.setYear(1900);
        node_iterator = [];
        _.each(self.nodes, function (node) {
          var filter_result = self._filter_by_date(
            beginning_of_time,
            date_field,
            start_date,
            node
            //true
          );
          if (_.isUndefined(filter_result)) {
            node.priority_flag = 6;
          } else {
            if (filter_result) {
              node.priority_flag = 5;
              node_iterator.push(node);
            } else {
              node.priority_flag = 4;
            }
          }
        });
      }

      // extract all clusters at once to avoid inefficiencies of multiple edge-set traversals

      var split_clusters = {};
      var node_id_to_local_cluster = {};

      // reset all annotations

      _.each(node_iterator, function (node) {
        node.nationalCOI = 0;
        if (node.cluster) {
          if (!(node.cluster in split_clusters)) {
            split_clusters[node.cluster] = { Nodes: [], Edges: [] };
          }
          node_id_to_local_cluster[node.id] =
            split_clusters[node.cluster]["Nodes"].length;
          split_clusters[node.cluster]["Nodes"].push(node);
        }
      });

      _.each(self.edges, function (edge) {
        if (edge.length <= self.subcluster_threshold) {
          var edge_cluster = self.nodes[edge.source].cluster;

          var source_id = self.nodes[edge.source].id;
          var target_id = self.nodes[edge.target].id;

          if (
            source_id in node_id_to_local_cluster &&
            target_id in node_id_to_local_cluster
          ) {
            var copied_edge = _.clone(edge);

            copied_edge.source = node_id_to_local_cluster[source_id];
            copied_edge.target = node_id_to_local_cluster[target_id];

            split_clusters[edge_cluster]["Edges"].push(copied_edge);
          }
        }
      });

      let cluster_id_match =
        self.precomputed_subclusters &&
          self.subcluster_threshold in self.precomputed_subclusters
          ? self.precomputed_subclusters
          : null;

      _.each(split_clusters, function (cluster_nodes, cluster_index) {
        /** extract subclusters; all nodes at given threshold */
        /** Sub-Cluster: all nodes connected at 0.005 subs/site; there can be multiple sub-clusters per cluster */

        //var cluster_nodes       = _extract_single_cluster (cluster.children, null, true);

        var array_index = self.cluster_mapping[cluster_index];

        self.clusters[array_index].priority_score = 0;

        var edges = [];

        /** all clusters with more than one member connected at 'threshold' edge length */
        var subclusters = _.filter(
          hivtrace_cluster_depthwise_traversal(
            cluster_nodes.Nodes,
            cluster_nodes.Edges,
            null,
            edges
          ),
          function (cc) {
            return cc.length > 1;
          }
        );

        /** all edge sets with more than one edge */
        edges = _.filter(edges, function (es) {
          return es.length > 1;
        });

        /** sort subclusters by oldest node */
        _.each(subclusters, function (c, i) {
          c.sort(oldest_nodes_first);
        });

        subclusters.sort(function (c1, c2) {
          return oldest_nodes_first(c1[0], c2[0]);
        });

        let next_id = subclusters.length + 1;

        subclusters = _.map(subclusters, function (c, i) {
          let subcluster_id = i + 1;

          if (cluster_id_match) {
            let precomputed_values = {};
            _.each(c, function (n) {
              if ("subcluster" in n) {
                var sub_at_k = _.find(
                  n.subcluster,
                  (t) => t[0] == self.subcluster_threshold
                );
                if (sub_at_k) {
                  precomputed_values[
                    sub_at_k[1].split(_networkSubclusterSeparator)[1]
                  ] = 1;
                  return;
                }
              }

              precomputed_values[null] = 1;
            });

            if (
              null in precomputed_values ||
              _.keys(precomputed_values).length != 1
            ) {
              subcluster_id = next_id++;
            } else {
              subcluster_id = _.keys(precomputed_values)[0];
            }

            /*if ((i+1) != 0 + subcluster_id) {
                console.log (self.clusters[array_index].cluster_id, i, "=>", subcluster_id, _.keys(precomputed_values));
             }*/
          }

          var label =
            self.clusters[array_index].cluster_id +
            _networkSubclusterSeparator +
            subcluster_id;

          _.each(c, function (n) {
            //if (!("subcluster_label" in n)) {
            n.subcluster_label = label;
            //}
            n.priority_flag = 0;
          });

          return {
            children: _.clone(c),
            parent_cluster: self.clusters[array_index],
            cluster_id: label,
            distances: helpers.describe_vector(
              _.map(edges[i], function (e) {
                return e.length;
              })
            ),
          };
        });

        _.each(subclusters, function (c) {
          _compute_cluster_degrees(c);
        });

        self.clusters[array_index].subclusters = subclusters;

        /** now, for each subcluster, extract the recent and rapid part */

        /** Recent & Rapid (National Priority) Cluster: the part of the Sub-Cluster inferred using only cases diagnosed in the previous 36 months
                and at least two cases dx-ed in the previous 12 months; there is a path between all nodes in a National Priority Cluster

            20180406 SLKP: while unlikely, this definition could result in multiple National Priority clusters
            per subclusters; for now we will add up all the cases for prioritization, and
            display the largest National Priority cluster if there is more than one
        */

        _.each(subclusters, function (sub) {
          // extract nodes based on dates

          let date_filter = (n) =>
            self._filter_by_date(cutoff_long, date_field, start_date, n);

          var subcluster_json = _extract_single_cluster(
            _.filter(sub.children, date_filter),
            null,
            true,
            cluster_nodes
          );

          var rr_cluster = _.filter(
            hivtrace_cluster_depthwise_traversal(
              subcluster_json.Nodes,
              _.filter(subcluster_json.Edges, function (e) {
                return e.length <= self.subcluster_threshold;
              })
            ),
            (cc) => cc.length > 1
          );

          sub.rr_count = rr_cluster.length;

          rr_cluster.sort(function (a, b) {
            return b.length - a.length;
          });

          sub.priority_score = [];
          sub.recent_nodes = [];

          const future_date = new Date(start_date.getTime() + 1e13);

          _.each(rr_cluster, function (recent_cluster) {
            var priority_nodes = _.groupBy(recent_cluster, (n) =>
              self._filter_by_date(cutoff_short, date_field, start_date, n)
            );

            sub.recent_nodes.push(_.map(recent_cluster, (n) => n.id));
            const meets_priority_def =
              true in priority_nodes &&
              priority_nodes[true].length >=
              (self.CDC_data
                ? self.CDC_data["autocreate-priority-set-size"]
                : 3);

            if (true in priority_nodes) {
              // recent
              sub.priority_score.push(_.map(priority_nodes[true], (n) => n.id));
              _.each(priority_nodes[true], function (n) {
                n.priority_flag = self._filter_by_date(
                  start_date,
                  date_field,
                  future_date,
                  n
                )
                  ? 4
                  : 1;

                if (meets_priority_def) {
                  if (n.priority_flag == 1) {
                    n.priority_flag = 2;
                  }
                  n.nationalCOI = 1;
                }
              });
            }

            if (false in priority_nodes) {
              // not recent
              _.each(priority_nodes[false], function (n) {
                n.priority_flag = 3;

                if (meets_priority_def) {
                  if (
                    self._filter_by_date(cutoff_long, date_field, start_date, n)
                  ) {
                    n.nationalCOI = 2;
                  } else {
                    n.nationalCOI = 3;
                  }
                } else {
                  n.priority_flag = 7;
                }
              });
            }
          });

          //console.log (sub.recent_nodes);
          self.clusters[array_index].priority_score = sub.priority_score;
        });
      });
    } catch (err) {
      console.log(err);
      return;
    }
  };

  function default_layout(packed) {
    // let's create an array of clusters from the json

    var init_layout = get_initial_xy(packed);

    if (self.clusters.length == 0) {
      self.clusters = init_layout.filter(function (v, i, obj) {
        return !(typeof v.cluster_id === "undefined");
      });
    } else {
      var coordinate_update = {};
      _.each(self.clusters, function (c) {
        coordinate_update[c.cluster_id] = c;
      });
      _.each(init_layout, function (c) {
        if ("cluster_id" in c) {
          _.extendOwn(coordinate_update[c.cluster_id], c);
        }
      });
    }

    //var sizes = network_layout.size();

    var set_init_coords = packed
      ? function (n) {
        n.x += n.r * 0.5;
        n.y += n.r * 0.5;
      }
      : function (n) {
        n.x += n.dx * 0.5;
        n.y += n.dy * 0.5;
      };

    _.each([self.nodes, self.clusters], function (list) {
      _.each(list, set_init_coords);
    });

    self.clusters.forEach(collapse_cluster);
  }

  function change_spacing(delta) {
    self.charge_correction = self.charge_correction * delta;
    network_layout.start();
  }

  function change_window_size(delta, trigger) {
    if (delta) {
      var x_scale = (self.width + delta / 2) / self.width;
      var y_scale = (self.height + delta / 2) / self.height;

      self.width += delta;
      self.height += delta;

      var rescale_x = d3.scale.linear().domain(
        d3.extent(network_layout.nodes(), function (node) {
          return node.x;
        })
      );
      rescale_x.range(
        _.map(rescale_x.domain(), function (v) {
          return v * x_scale;
        })
      );
      //.range ([50,self.width-50]),
      var rescale_y = d3.scale.linear().domain(
        d3.extent(network_layout.nodes(), function (node) {
          return node.y;
        })
      );
      rescale_y.range(
        _.map(rescale_y.domain(), function (v) {
          return v * y_scale;
        })
      );

      _.each(network_layout.nodes(), function (node) {
        node.x = rescale_x(node.x);
        node.y = rescale_y(node.y);
      });
    }

    self.width = Math.min(Math.max(self.width, 200), 4000);
    self.height = Math.min(Math.max(self.height, 200), 4000);

    network_layout.size([self.width, self.height]);
    self.network_svg.attr("width", self.width).attr("height", self.height);
    self._calc_country_nodes(options);
    self._draw_topomap(true);
    if (trigger) {
      network_layout.start();
    } else {
      if (delta) {
        self.update(true);
      }
    }
  }

  self.compute_adjacency_list = _.once(function () {
    self.nodes.forEach(function (n) {
      n.neighbors = d3.set();
    });

    self.edges.forEach(function (e) {
      self.nodes[e.source].neighbors.add(e.target);
      self.nodes[e.target].neighbors.add(e.source);
    });
  });

  self.compute_local_clustering_coefficients = _.once(function () {
    self.compute_adjacency_list();

    self.nodes.forEach(function (n) {
      _.defer(function (a_node) {
        neighborhood_size = a_node.neighbors.size();
        if (neighborhood_size < 2) {
          a_node.lcc = misc.undefined;
        } else {
          if (neighborhood_size > 500) {
            a_node.lcc = misc.too_large;
          } else {
            // count triangles
            neighborhood = a_node.neighbors.values();
            counter = 0;
            for (n1 = 0; n1 < neighborhood_size; n1 += 1) {
              for (n2 = n1 + 1; n2 < neighborhood_size; n2 += 1) {
                if (
                  self.nodes[neighborhood[n1]].neighbors.has(neighborhood[n2])
                ) {
                  counter++;
                }
              }
            }

            a_node.lcc =
              (2 * counter) / neighborhood_size / (neighborhood_size - 1);
          }
        }
      }, n);
    });
  });

  self.get_node_by_id = function (id) {
    return self.nodes.filter(function (n) {
      return n.id == id;
    })[0];
  };

  self.compute_local_clustering_coefficients_worker = _.once(function () {
    var worker = new Worker("workers/lcc.js");

    worker.onmessage = function (event) {
      var nodes = event.data.Nodes;

      nodes.forEach(function (n) {
        node_to_update = self.get_node_by_id(n.id);
        node_to_update.lcc = n.lcc ? n.lcc : misc.undefined;
      });
    };

    var worker_obj = {};
    worker_obj["Nodes"] = self.nodes;
    worker_obj["Edges"] = self.edges;
    worker.postMessage(worker_obj);
  });

  var estimate_cubic_compute_cost = _.memoize(
    function (c) {
      self.compute_adjacency_list();
      return _.reduce(
        _.first(_.pluck(c.children, "degree").sort(d3.descending), 3),
        function (memo, value) {
          return memo * value;
        },
        1
      );
    },
    function (c) {
      return c.cluster_id;
    }
  );

  self.compute_global_clustering_coefficients = _.once(function () {
    self.compute_adjacency_list();

    self.clusters.forEach(function (c) {
      _.defer(function (a_cluster) {
        cluster_size = a_cluster.children.length;
        if (cluster_size < 3) {
          a_cluster.cc = misc.undefined;
        } else {
          if (estimate_cubic_compute_cost(a_cluster, true) >= 5000000) {
            a_cluster.cc = misc.too_large;
          } else {
            // pull out all the nodes that have this cluster id
            member_nodes = [];

            var triads = 0;
            var triangles = 0;

            self.nodes.forEach(function (n, i) {
              if (n.cluster == a_cluster.cluster_id) {
                member_nodes.push(i);
              }
            });
            member_nodes.forEach(function (node) {
              my_neighbors = self.nodes[node].neighbors
                .values()
                .map(function (d) {
                  return +d;
                })
                .sort(d3.ascending);
              for (n1 = 0; n1 < my_neighbors.length; n1 += 1) {
                for (n2 = n1 + 1; n2 < my_neighbors.length; n2 += 1) {
                  triads += 1;
                  if (
                    self.nodes[my_neighbors[n1]].neighbors.has(my_neighbors[n2])
                  ) {
                    triangles += 1;
                  }
                }
              }
            });

            a_cluster.cc = triangles / triads;
          }
        }
      }, c);
    });
  });

  self.mark_nodes_as_processing = function (property) {
    self.nodes.forEach(function (n) {
      n[property] = misc.processing;
    });
  };

  self.compute_graph_stats = function () {
    d3.select(this).classed("disabled", true).select("i").classed({
      "fa-calculator": false,
      "fa-cog": true,
      "fa-spin": true,
    });
    self.mark_nodes_as_processing("lcc");
    self.compute_local_clustering_coefficients_worker();
    self.compute_global_clustering_coefficients();
    d3.select(this).remove();
  };

  /*------------ Constructor ---------------*/
  function initial_json_load() {
    var connected_links = {};
    var total = 0;
    self.exclude_cluster_ids = {};
    self.has_hxb2_links = false;
    self.cluster_sizes = [];

    graph_data.Nodes.forEach(function (d) {
      if (typeof self.cluster_sizes[d.cluster - 1] === "undefined") {
        self.cluster_sizes[d.cluster - 1] = 1;
      } else {
        self.cluster_sizes[d.cluster - 1]++;
      }
      if ("is_lanl" in d) {
        d.is_lanl = d.is_lanl == "true";
      }

      if (!("attributes" in d)) {
        d.attributes = [];
      }

      if (d.attributes.indexOf("problematic") >= 0) {
        self.has_hxb2_links = d.hxb2_linked = true;
      }
    });

    /* add buttons and handlers */
    /* clusters first */
    self._is_new_node = function (n) {
      return n.attributes.indexOf("new_node") >= 0;
    };

    self._extract_attributes_for_nodes = function (nodes, column_names) {
      var result = [
        _.map(column_names, function (c) {
          return c.raw_attribute_key;
        }),
      ];

      _.each(nodes, function (n) {
        result.push(
          _.map(column_names, function (c) {
            if (c.raw_attribute_key == tables._networkNodeIDField) {
              if (self._is_new_node(n)) {
                return n.id + tables._networkNewNodeMarker;
              }
              return n.id;
            }
            if (_.has(n, c.raw_attribute_key)) {
              return n[c.raw_attribute_key];
            }
            return self.attribute_node_value_by_id(n, c.raw_attribute_key);
          })
        );
      });
      return result;
    };

    self._extract_exportable_attributes = function (extended) {
      var allowed_types = {
        String: 1,
        Date: 1,
        Number: 1,
      };

      var return_array = [];

      if (extended) {
        return_array = [
          {
            raw_attribute_key: tables._networkNodeIDField,
            type: "String",
            label: "Node ID",
            format: function () {
              return "Node ID";
            },
          },
          {
            raw_attribute_key: "cluster",
            type: "String",
            label: "Which cluster the individual belongs to",
            format: function () {
              return __("clusters_tab")["cluster_id"];
            },
          },
        ];
      }

      return_array.push(
        _.filter(self.json[_networkGraphAttrbuteID], function (d) {
          return d.type in allowed_types;
        })
      );

      return _.flatten(return_array, true);
    };

    self._extract_nodes_by_id = function (id) {
      var string_id = id.toString();
      return _.filter(self.nodes, function (n) {
        return n.cluster == id || n.subcluster_label == string_id;
      });
    };

    self._cluster_list_view_render = function (
      cluster_id,
      group_by_attribute,
      the_list,
      priority_group
    ) {
      the_list.selectAll("*").remove();
      var column_ids = self._extract_exportable_attributes();
      var cluster_nodes;

      if (priority_group) {
        cluster_nodes = self.priority_groups_find_by_name(priority_group);
        if (cluster_nodes) {
          cluster_nodes = cluster_nodes.node_objects;
        } else {
          return;
        }
      } else {
        cluster_nodes = self._extract_nodes_by_id(cluster_id);
      }

      d3.select(
        utils.get_ui_element_selector_by_role("cluster_list_data_export", true)
      ).on("click", function (d) {
        if (self._is_CDC_executive_mode) {
          alert(_networkWarnExecutiveMode);
        } else {
          helpers.export_csv_button(
            self._extract_attributes_for_nodes(cluster_nodes, column_ids)
          );
        }
      });

      if (group_by_attribute) {
        _.each(column_ids, function (column) {
          var binned = _.groupBy(cluster_nodes, function (n) {
            return self.attribute_node_value_by_id(n, column.raw_attribute_key);
          });
          var sorted_keys = _.keys(binned).sort();
          var attribute_record = the_list.append("li");
          attribute_record
            .append("code")
            .text(column.label || column.raw_attribute_key);
          var attribute_list = attribute_record
            .append("dl")
            .classed("dl-horizontal", true);
          _.each(sorted_keys, function (key) {
            attribute_list.append("dt").text(key);
            attribute_list.append("dd").text(
              _.map(binned[key], function (n) {
                return n.id;
              }).join(", ")
            );
          });
        });
      } else {
        _.each(cluster_nodes, function (node) {
          var patient_record = the_list.append("li");
          patient_record.append("code").text(node.id);
          var patient_list = patient_record
            .append("dl")
            .classed("dl-horizontal", true);
          _.each(column_ids, function (column) {
            patient_list
              .append("dt")
              .text(column.label || column.raw_attribute_key);
            patient_list
              .append("dd")
              .text(
                self.attribute_node_value_by_id(node, column.raw_attribute_key)
              );
          });
        });
      }
    };

    self._setup_cluster_list_view = function () {
      d3.select(
        utils.get_ui_element_selector_by_role("cluster_list_view_toggle", true)
      ).on("click", function () {
        d3.event.preventDefault();
        var group_by_id = false;

        var button_clicked = $(this);
        if (button_clicked.data(__("clusters_tab")["view"]) == "id") {
          button_clicked.data(__("clusters_tab")["view"], "attribute");
          button_clicked.text(__("clusters_tab")["group_by_id"]);
          group_by_id = false;
        } else {
          button_clicked.data(__("clusters_tab")["view"], "id");
          button_clicked.text(__("clusters_tab")["group_by_attribute"]);
          group_by_id = true;
        }

        var cluster_id = button_clicked.data("cluster");

        self._cluster_list_view_render(
          cluster_id ? cluster_id.toString() : "",
          !group_by_id,
          d3.select(
            utils.get_ui_element_selector_by_role("cluster_list_payload", true)
          ),
          button_clicked.data("priority_list")
        );
      });

      $(utils.get_ui_element_selector_by_role("cluster_list", true)).on(
        "show.bs.modal",
        function (event) {
          var link_clicked = $(event.relatedTarget);
          var cluster_id = link_clicked.data("cluster");
          var priority_list = link_clicked.data("priority_set");

          var modal = d3.select(
            utils.get_ui_element_selector_by_role("cluster_list", true)
          );
          modal
            .selectAll(".modal-title")
            .text(
              __("clusters_tab")["listing_nodes"] +
              (priority_list
                ? " in cluster of interest " + priority_list
                : " " + __("general")["cluster"] + " " + cluster_id)
            );

          var view_toggle = $(
            utils.get_ui_element_selector_by_role(
              "cluster_list_view_toggle",
              true
            )
          );

          if (priority_list) {
            view_toggle.data("priority_list", priority_list);
            view_toggle.data("cluster", "");
          } else {
            view_toggle.data("cluster", cluster_id);
            view_toggle.data("priority_list", null);
          }

          self._cluster_list_view_render(
            cluster_id,
            //cluster_id,
            $(
              utils.get_ui_element_selector_by_role(
                "cluster_list_view_toggle",
                true
              )
            ).data(__("clusters_tab")["view"]) != "id",
            modal.select(
              utils.get_ui_element_selector_by_role("cluster_list_payload", true)
            ),
            priority_list
          );
        }
      );

      $(utils.get_ui_element_selector_by_role("overlap_list", true)).on(
        "show.bs.modal",
        function (event) {
          var link_clicked = $(event.relatedTarget);
          var priority_list = link_clicked.data("priority_set");

          var modal = d3.select(
            utils.get_ui_element_selector_by_role("overlap_list", true)
          );
          modal
            .selectAll(".modal-title")
            .text(
              "View how nodes in cluster of interest " +
              priority_list +
              " overlap with other clusterOI"
            );

          let ps = self.priority_groups_find_by_name(priority_list);
          if (!(ps && self.priority_node_overlap)) return;

          var headers = [
            [
              {
                value: "Node",
                help: "EHARS_ID of the node that overlaps with other clusterOI",
                sort: "value",
              },
              {
                value: "Other Cluster(s) of Interest",
                help: "Names of other clusterOI where this node is included",
                sort: "value",
              },
            ],
          ];

          var rows = [];
          var rows_for_export = [
            ["Overlapping Cluster of Interest", "Node", "Other clusterOI"],
          ];
          _.each(ps.nodes, (n) => {
            let overlap = self.priority_node_overlap[n.name];
            let other_sets = "None";
            if (overlap.size > 1) {
              other_sets = _.sortBy(
                _.filter([...overlap], (d) => d != priority_list)
              ).join("; ");
            }
            rows.push([{ value: n.name }, { value: other_sets }]);
            rows_for_export.push([ps.name, n.name, other_sets]);
          });

          d3.select(
            utils.get_ui_element_selector_by_role(
              "overlap_list_data_export",
              true
            )
          ).on("click", function (d) {
            helpers.export_csv_button(rows_for_export, "overlap");
          });

          tables.add_a_sortable_table(
            modal.select(
              utils.get_ui_element_selector_by_role(
                "overlap_list_data_table",
                true
              )
            ),
            headers,
            rows,
            true,
            null,
            self.get_priority_set_editor()
          );
        }
      );
    };

    $(utils.get_ui_element_selector_by_role("priority_set_merge", true)).on(
      "show.bs.modal",
      function (event) {
        var modal = d3.select(
          utils.get_ui_element_selector_by_role("priority_set_merge", true)
        );

        let desc = modal.selectAll(".modal-desc");

        let proceed_btn = d3.select(
          utils.get_ui_element_selector_by_role(
            "priority_set_merge_table_proceed",
            true
          )
        );

        if (
          self.defined_priority_groups &&
          self.defined_priority_groups.length > 1
        ) {
          desc.text("Select two or more clusters of interest to merge");

          var headers = [
            [
              {
                value: "Select",
              },
              {
                value: "Cluster of interest",
                help: "Cluster of interest Name",
                sort: "value",
              },
              {
                value: "Nodes",
                help: "How many nodes are in this cluster of interest",
                sort: "value",
              },
              {
                value: "Overlaps",
                help: "Overlaps with",
                sort: "value",
              },
            ],
          ];

          let current_selection = new Set();
          let current_node_set = null;
          let current_node_objects = null;

          function handle_selection(name, selected) {
            if (selected) {
              current_selection.add(name);
            } else {
              current_selection.delete(name);
            }
            if (current_selection.size > 1) {
              let total = 0;
              current_node_set = new Set();
              current_node_objects = {};
              _.each(self.defined_priority_groups, (pg) => {
                if (current_selection.has(pg.name)) {
                  total += pg.nodes.length;
                  _.each(pg.nodes, (n) => {
                    current_node_set.add(n.name);
                    current_node_objects[n.name] = {
                      _priority_set_date: n.added,
                      _priority_set_kind: n.kind,
                    };
                  });
                }
              });
              desc.html(
                "Merge " +
                current_selection.size +
                " clusterOI with " +
                total +
                " nodes, creating a new clusterOI with " +
                current_node_set.size +
                " nodes. <br><small>Note that the clusters of interest being merged will <b>not</b> be automatically deleted</small>"
              );
              proceed_btn.attr("disabled", null);
            } else {
              desc.text("Select two or more clusters of interest to merge");
              proceed_btn.attr("disabled", "disabled");
            }
          }

          function handle_merge() {
            if (current_node_set) {
              clustersOfInterest.open_priority_set_editor(
                self,
                [],
                "",
                "Merged from " + [...current_selection].join(" and ")
              );
              self
                .get_priority_set_editor()
                .append_nodes([...current_node_set], current_node_objects);
            }
            $(modal.node()).modal("hide");
          }

          proceed_btn.attr("disabled", "disabled").on("click", handle_merge);

          var rows = [];
          _.each(self.defined_priority_groups, (pg) => {
            let my_overlaps = new Set();
            _.each(pg.nodes, (n) => {
              _.each([...self.priority_node_overlap[n.name]], (ps) => {
                if (ps != pg.name) {
                  my_overlaps.add(ps);
                }
              });
            });

            rows.push([
              {
                value: pg,
                callback: function (element, payload) {
                  var this_cell = d3.select(element);
                  this_cell
                    .append("input")
                    .attr("type", "checkbox")
                    .style("margin-left", "1em")
                    .on("click", function (e) {
                      handle_selection(payload.name, $(this).prop("checked"));
                    });
                },
              },
              { value: pg.name },
              { value: pg.nodes.length },
              {
                value: [...my_overlaps],
                format: (d) => d.join("<br>"),
                html: true,
              },
            ]);
          });

          tables.add_a_sortable_table(
            modal.select(
              utils.get_ui_element_selector_by_role(
                "priority_set_merge_table",
                true
              )
            ),
            headers,
            rows,
            true,
            null,
            self.get_priority_set_editor()
          );
        }
      }
    );

    if (button_bar_ui) {
      self._setup_cluster_list_view();

      var cluster_ui_container = d3.select(
        utils.get_ui_element_selector_by_role("cluster_operations_container")
      );

      cluster_ui_container.selectAll("li").remove();

      var fix_handler = function (do_fix) {
        _.each([self.clusters, self.nodes], function (list) {
          _.each(list, function (obj) {
            obj.fixed = do_fix;
          });
        });
      };

      var node_label_handler = function (do_show) {
        var shown_nodes = self.network_svg.selectAll(".node");
        if (!shown_nodes.empty()) {
          shown_nodes.each(function (node) {
            node.show_label = do_show;
          });
          self.update(true);
        }
      };

      var layout_reset_handler = function (packed) {
        var fixed = [];
        _.each(self.clusters, function (obj) {
          if (obj.fixed) {
            fixed.push(obj);
          }
          obj.fixed = false;
        });
        default_layout(packed);
        network_layout.tick();
        self.update();
        _.each(fixed, function (obj) {
          obj.fixed = true;
        });
      };

      var cluster_commands = [
        [
          __("clusters_main")["export_colors"],
          () => {
            let colorScheme = helpers.exportColorScheme(
              self.uniqValues,
              self.colorizer
            );

            //TODO: If using database backend, use api instead
            helpers.copyToClipboard(JSON.stringify(colorScheme));
          },
          true,
          "hivtrace-export-color-scheme",
        ],
        [
          __("clusters_main")["expand_all"],
          function () {
            return self.expand_some_clusters();
          },
          true,
          "hivtrace-expand-all",
        ],
        [
          __("clusters_main")["collapse_all"],
          function () {
            return self.collapse_some_clusters();
          },
          true,
          "hivtrace-collapse-all",
        ],
        [
          __("clusters_main")["expand_filtered"],
          function () {
            return self.expand_some_clusters(
              self.select_some_clusters(function (n) {
                return n.match_filter;
              })
            );
          },
          true,
          "hivtrace-expand-filtered",
        ],
        [
          __("clusters_main")["collapse_filtered"],
          function () {
            return self.collapse_some_clusters(
              self.select_some_clusters(function (n) {
                return n.match_filter;
              })
            );
          },
          true,
          "hivtrace-collapse-filtered",
        ],
        [
          __("clusters_main")["fix_all_objects_in_place"],
          _.partial(fix_handler, true),
          true,
          "hivtrace-fix-in-place",
        ],
        [
          __("clusters_main")["allow_all_objects_to_float"],
          _.partial(fix_handler, false),
          true,
          "hivtrace-allow-to-float",
        ],
        [
          __("clusters_main")["reset_layout"] + " [packed]",
          _.partial(layout_reset_handler, true),
          true,
          "hivtrace-reset-layout",
        ],
        [
          __("clusters_main")["reset_layout"] + " [tiled]",
          _.partial(layout_reset_handler, false),
          true,
          "hivtrace-reset-layout",
        ],
        [
          __("network_tab")["show_labels_for_all"],
          _.partial(node_label_handler, true),
          true,
          "hivtrace-node-labels-on",
        ],
        [
          __("network_tab")["hide_labels_for_all"],
          _.partial(node_label_handler, false),
          true,
          "hivtrace-node-labels-off",
        ],
        [
          "Hide problematic clusters",
          function (item) {
            d3.select(item).text(
              self.hide_hxb2
                ? "Hide problematic clusters"
                : "Show problematic clusters"
            );
            self.toggle_hxb2();
          },
          self.has_hxb2_links,
          "hivtrace-hide-problematic-clusters",
        ],
        [
          __("network_tab")["highlight_unsupported_edges"],
          function (item) {
            if (self.highlight_unsuppored_edges) {
              d3.select(item).selectAll(".fa-check-square").remove();
            } else {
              d3.select(item)
                .insert("i", ":first-child")
                .classed("fa fa-check-square", true);
            }
            self.toggle_highlight_unsupported_edges();
          },
          true,
          "hivtrace-highlight-unsuppored_edges",
          self.highlight_unsuppored_edges,
        ],
      ];

      if (self.cluster_attributes) {
        cluster_commands.push([
          "Show only changes since last network update",
          function (item) {
            if (self.showing_diff) {
              d3.select(item).selectAll(".fa-check-square").remove();
            } else {
              d3.select(item)
                .insert("i", ":first-child")
                .classed("fa fa-check-square", true);
            }
            self.toggle_diff();
          },
          true,
          "hivtrace-show-network-diff",
          self.showing_diff,
        ]);
      }

      if (timeDateUtil.getClusterTimeScale()) {
        cluster_commands.push([
          __("network_tab")["only_recent_clusters"],
          function (item) {
            if (self.using_time_filter) {
              d3.select(item).selectAll(".fa-check-square").remove();
            } else {
              d3.select(item)
                .insert("i", ":first-child")
                .classed("fa fa-check-square", true);
            }
            self.toggle_time_filter();
          },
          true,
          "hivtrace-show-using-time-filter",
          self.using_time_filter,
        ]);
      }

      if (!self._is_CDC_) {
        cluster_commands.push([
          "Show removed edges",
          function (item) {
            self.filter_edges = !self.filter_edges;
            d3.select(item).text(
              self.filter_edges ? "Show removed edges" : "Hide removed edges"
            );
            self.update(false);
          },
          function () {
            return _.some(self.edges, function (d) {
              return d.removed;
            });
          },
          "hivtrace-show-removed-edges",
        ]);
      } else {
        cluster_commands.push([
          "Add filtered objects to cluster of interest",
          function (item) {
            if (self.get_priority_set_editor())
              self.get_priority_set_editor().append_node_objects(
                _.filter(json["Nodes"], (n) => n.match_filter)
              );
          },
          self.get_priority_set_editor,
          "hivtrace-add-filtered-to-panel",
        ]);
      }

      cluster_commands.forEach(function (item, index) {
        let shown = item[2];
        if (_.isFunction(shown)) {
          shown = shown(item);
        }
        if (shown) {
          var handler_callback = item[1];
          var line_item = this.append("li")
            .append("a")
            .text(item[0])
            .attr("href", "#")
            //.attr("id", item[3])
            .on("click", function (e) {
              handler_callback(this);
              //d3.event.stopPropagation();
              //d3.event.preventDefault();
            });

          if (item.length > 4) {
            // checkbox
            line_item.text("");
            if (item[4]) {
              line_item
                .insert("i", ":first-child")
                .classed("fa fa-check-square", true);
            }
            line_item.insert("span").text(item[0]);
          }
        }
      }, cluster_ui_container);

      var button_group = d3.select(
        utils.get_ui_element_selector_by_role("button_group")
      );

      if (!button_group.empty()) {
        button_group.selectAll("button").remove();
        button_group
          .append("button")
          .classed("btn btn-default btn-sm", true)
          .attr("title", __("network_tab")["expand_spacing"])
          .on("click", function (d) {
            change_spacing(5 / 4);
          })
          .append("i")
          .classed("fa fa-plus", true);
        button_group
          .append("button")
          .classed("btn btn-default btn-sm", true)
          .attr("title", __("network_tab")["compress_spacing"])
          .on("click", function (d) {
            change_spacing(4 / 5);
          })
          .append("i")
          .classed("fa fa-minus", true);
        button_group
          .append("button")
          .classed("btn btn-default btn-sm", true)
          .attr("title", __("network_tab")["enlarge_window"])
          .on("click", function (d) {
            change_window_size(100, true);
          })
          .append("i")
          .classed("fa fa-expand", true);
        button_group
          .append("button")
          .classed("btn btn-default btn-sm", true)
          .attr("title", __("network_tab")["shrink_window"])
          .on("click", function (d) {
            change_window_size(-100, true);
          })
          .append("i")
          .classed("fa fa-compress", true);

        if (!self._is_CDC_) {
          button_group
            .append("button")
            .classed("btn btn-default btn-sm", true)
            .attr("title", "Compute graph statistics")
            .attr("id", "hivtrace-compute-graph-statistics")
            .on("click", function (d) {
              _.bind(self.compute_graph_stats, this)();
            })
            .append("i")
            .classed("fa fa-calculator", true);
        } else {
          button_group
            .append("button")
            .classed("btn btn-default btn-sm", true)
            .attr("title", __("network_tab")["toggle_epicurve"])
            .attr("id", "hivtrace-toggle-epi-curve")
            .on("click", function (d) {
              self._check_for_time_series();
            })
            .append("i")
            .classed("fa fa-line-chart", true);
        }

        var export_image = d3.select(
          utils.get_ui_element_selector_by_role("export_image")
        );

        if (!export_image.empty()) {
          export_image.selectAll("div").remove();

          let buttonGroupDropdown = export_image
            .insert("div", ":first-child")
            .classed("input-group-btn dropdown-img", true);

          let dropdownList = buttonGroupDropdown
            .append("ul")
            .classed("dropdown-menu", true)
            .attr("aria-labelledby", "dropdownImg");

          dropdownList
            .append("li")
            .classed("dropdown-item export-img-item", true)
            .append("a")
            .attr("href", "#")
            .text("SVG")
            .on("click", function (d) {
              helpers.save_image("svg", "#" + self.dom_prefix + "-network-svg");
            });

          dropdownList
            .append("li")
            .classed("dropdown-item export-img-item", true)
            .append("a")
            .attr("href", "#")
            .text("PNG")
            .on("click", function (d) {
              helpers.save_image("png", "#" + self.dom_prefix + "-network-svg");
            });

          let imgBtn = buttonGroupDropdown
            .append("button")
            .attr("id", "dropdownImg")
            .attr("data-toggle", "dropdown")
            .classed("btn btn-default btn-sm dropdown-toggle", true)
            .attr("title", __("network_tab")["save_image"])
            .attr("id", "hivtrace-export-image");

          imgBtn.append("i").classed("fa fa-image", true);

          imgBtn.append("span").classed("caret", true);
        }
      }

      $(utils.get_ui_element_selector_by_role("filter"))
        .off("input propertychange")
        .on(
          "input propertychange",
          _.throttle(function (e) {
            var filter_value = $(this).val();
            self.filter(self.filter_parse(filter_value));
          }, 250)
        );

      $(utils.get_ui_element_selector_by_role("hide_filter"))
        .off("change")
        .on(
          "change",
          _.throttle(function (e) {
            self.hide_unselected = !self.hide_unselected;
            self.filter_visibility();
            self.update(true);
          }, 250)
        );

      $(utils.get_ui_element_selector_by_role("show_small_clusters"))
        .off("change")
        .on(
          "change",
          _.throttle(function (e) {
            if ("size" in self.cluster_filtering_functions) {
              delete self.cluster_filtering_functions["size"];
            } else {
              self.cluster_filtering_functions["size"] = self.filter_by_size;
            }

            self.update(false);
          }, 250)
        );

      $(utils.get_ui_element_selector_by_role("set_min_cluster_size"))
        .off("change")
        .on(
          "change",
          _.throttle(function (e) {
            self.minimum_cluster_size = e.target.value;
            self.update(false);
          }, 250)
        );

      $(utils.get_ui_element_selector_by_role("pairwise_table_pecentage", true))
        .off("change")
        .on(
          "change",
          _.throttle(function (e) {
            self.show_percent_in_pairwise_table =
              !self.show_percent_in_pairwise_table;
            render_binned_table(
              "attribute_table",
              self.colorizer["category_map"],
              self.colorizer["category_pairwise"]
            );
          }, 250)
        );
    }

    if (_networkGraphAttrbuteID in json) {
      attributes = json[_networkGraphAttrbuteID];
    } else {
      if (attributes && "hivtrace" in attributes) {
        attributes = attributes["hivtrace"];
      }
    }

    // Initialize class attributes
    singletons = graph_data.Nodes.filter(function (v, i) {
      return v.cluster === null;
    }).length;

    self.nodes_by_cluster = {};

    self.nodes = graph_data.Nodes.filter(function (v, i) {
      if (
        v.cluster &&
        typeof self.exclude_cluster_ids[v.cluster] === "undefined"
      ) {
        if (v.cluster in self.nodes_by_cluster) {
          self.nodes_by_cluster[v.cluster].push(v);
        } else {
          self.nodes_by_cluster[v.cluster] = [v];
        }

        connected_links[i] = total++;
        return true;
      }
      return false;
    });

    self.edges = graph_data.Edges.filter(function (v, i) {
      return v.source in connected_links && v.target in connected_links;
    });

    self.edges = self.edges.map(function (v, i) {
      var cp_v = _.clone(v);
      cp_v.source = connected_links[v.source];
      cp_v.target = connected_links[v.target];
      cp_v.id = i;
      return cp_v;
    });

    compute_node_degrees(self.nodes, self.edges);

    default_layout(self.initial_packed);
    self.clusters.forEach(function (d, i) {
      self.cluster_mapping[d.cluster_id] = i;
      d.hxb2_linked = d.children.some(function (c) {
        return c.hxb2_linked;
      });
      _compute_cluster_degrees(d);
      d.distances = [];
    });

    try {
      if (options && options["extra_menu"]) {
        var extra_ui_container = d3.select(
          utils.get_ui_element_selector_by_role("extra_operations_container")
        );

        d3.select(
          utils.get_ui_element_selector_by_role("extra_operations_enclosure")
        )
          .selectAll("button")
          .text(options["extra_menu"]["title"])
          .append("span")
          .classed("caret", "true");
        //extra_ui_container
        extra_ui_container.selectAll("li").remove();

        options["extra_menu"]["items"].forEach(function (item, index) {
          //console.log (item);
          var handler_callback = item[1];
          if (_.isFunction(item[0])) {
            item[0](self, this.append("li"));
          } else {
            this.append("li")
              .append("a")
              .text(item[0])
              .attr("href", "#")
              .on("click", function (e) {
                handler_callback(self, this);
                d3.event.preventDefault();
              });
          }
        }, extra_ui_container);

        d3.select(
          utils.get_ui_element_selector_by_role("extra_operations_enclosure")
        ).style("display", null);
      }
    } catch (err) {
      console.log(err);
    }

    self._aux_populate_category_menus = function () {
      if (button_bar_ui) {
        // decide if the variable can be considered categorical by examining its range

        //console.log ("self._aux_populate_category_menus");
        var valid_cats = _.filter(
          _.map(
            graph_data[_networkGraphAttrbuteID],
            self._aux_populate_category_fields
          ),
          function (d) {
            /*if (d.discrete) {
                console.log (d["value_range"].length);
            }*/
            return (
              d.discrete &&
              "value_range" in d &&
              /*d["value_range"].length <= _maximumValuesInCategories &&*/
              !d["_hidden_"]
            );
          }
        );

        var valid_shapes = _.filter(valid_cats, function (d) {
          return (
            (d.discrete && d.dimension <= 7) ||
            (d["raw_attribute_key"] in _networkPresetShapeSchemes &&
              !d["_hidden_"])
          );
        });

        // sort values alphabetically for consistent coloring

        _.each([valid_cats, valid_shapes], function (list) {
          _.each(list, self._aux_process_category_values);
        });

        let color_stops = _networkContinuousColorStops;

        try {
          color_stops =
            graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]][
            "color_stops"
            ] || _networkContinuousColorStops;
        } catch (err) { }

        var valid_scales = _.filter(
          _.map(graph_data[_networkGraphAttrbuteID], function (d, k) {
            function determine_scaling(d, values, scales) {
              var low_var = Infinity;
              _.each(scales, function (scl, i) {
                d["value_range"] = d3.extent(values);
                var bins = _.map(_.range(color_stops), function () {
                  return 0;
                });
                scl.range([0, color_stops - 1]).domain(d["value_range"]);
                _.each(values, function (v) {
                  bins[Math.floor(scl(v))]++;
                });

                var mean = values.length / color_stops;
                var vrnc = _.reduce(bins, function (p, c) {
                  return p + (c - mean) * (c - mean);
                });

                if (vrnc < low_var) {
                  low_var = vrnc;
                  d["scale"] = scl;
                }
              });
            }

            d["raw_attribute_key"] = k;

            if (true) {
              if (d.type == "Number" || d.type == "Number-categories") {
                var values = _.filter(
                  _.map(graph_data.Nodes, function (nd) {
                    return self.attribute_node_value_by_id(
                      nd,
                      k,
                      d.type == "Number"
                    );
                  }),
                  function (v) {
                    return _.isNumber(v);
                  }
                );
                // automatically determine the scale and see what spaces the values most evenly
                const range = d3.extent(values);
                let scales_to_consider = [d3.scale.linear()];
                if (range[0] > 0) {
                  scales_to_consider.push(d3.scale.log());
                }
                if (range[0] >= 0) {
                  scales_to_consider.push(d3.scale.pow().exponent(1 / 3));
                  scales_to_consider.push(d3.scale.pow().exponent(1 / 4));
                  scales_to_consider.push(d3.scale.pow().exponent(1 / 2));
                  scales_to_consider.push(d3.scale.pow().exponent(1 / 8));
                  scales_to_consider.push(d3.scale.pow().exponent(1 / 16));
                }
                determine_scaling(d, values, scales_to_consider);
              } else {
                if (d.type == "Date") {
                  var values = _.filter(
                    _.map(graph_data.Nodes, function (nd) {
                      try {
                        var a_date = self.attribute_node_value_by_id(nd, k);
                        if (d.raw_attribute_key == "hiv_aids_dx_dt") {
                          //console.log (nd, k, a_date);
                        }
                        inject_attribute_node_value_by_id(
                          nd,
                          k,
                          self._parse_dates(a_date)
                        );
                      } catch (err) {
                        inject_attribute_node_value_by_id(
                          nd,
                          k,
                          _networkMissing
                        );
                      }
                      return self.attribute_node_value_by_id(nd, k);
                    }),
                    function (v) {
                      return v == _networkMissing ? null : v;
                    }
                  );
                  // automatically determine the scale and see what spaces the values most evenly
                  if (values.length == 0) {
                    // invalid scale
                    return {};
                  }

                  determine_scaling(d, values, [d3.time.scale()]);
                }
              }
            }
            return d;
          }),
          function (d) {
            return (
              (d.type == "Number" ||
                d.type == "Date" ||
                d.type == "Number-categories") &&
              !d["_hidden_"]
            );
          }
        );

        function _menu_label_gen(d) {
          return (
            (d["annotation"] ? "[" + d["annotation"] + "] " : "") + d["label"]
          );
        }

        //console.log (valid_scales);
        //valid_cats.splice (0,0, {'label' : 'None', 'index' : -1});

        [
          d3.select(utils.get_ui_element_selector_by_role("attributes")),
          d3.select(
            utils.get_ui_element_selector_by_role("attributes_cat", true)
          ),
        ].forEach(function (m) {
          //console.log (m);

          if (m.empty()) {
            return;
          }
          m.selectAll("li").remove();

          var menu_items = [
            [
              [
                "None",
                null,
                _.partial(self.handle_attribute_categorical, null),
              ],
            ],
            [[__("network_tab")["categorical"], "heading", null]],
          ].concat(
            valid_cats.map(function (d, i) {
              return [
                [
                  _menu_label_gen(d),
                  d["raw_attribute_key"],
                  _.partial(
                    self.handle_attribute_categorical,
                    d["raw_attribute_key"]
                  ),
                ],
              ];
            })
          );

          if (valid_scales.length) {
            menu_items = menu_items
              .concat([[[__("network_tab")["continuous"], "heading", null]]])
              .concat(
                valid_scales.map(function (d, i) {
                  return [
                    [
                      _menu_label_gen(d),
                      d["raw_attribute_key"],
                      _.partial(
                        self.handle_attribute_continuous,
                        d["raw_attribute_key"]
                      ),
                    ],
                  ];
                })
              );
          }

          var cat_menu = m.selectAll("li").data(menu_items);

          cat_menu
            .enter()
            .append("li")
            .classed("disabled", function (d) {
              return d[0][1] == "heading";
            })
            .style("font-variant", function (d) {
              return d[0][1] < -1 ? "small-caps" : "normal";
            });

          cat_menu
            .selectAll("a")
            .data(function (d) {
              return d;
            })
            .enter()
            .append("a")
            .html(function (d, i, j) {
              let htm = d[0];
              let type = "unknown";

              if (_.contains(_.keys(self.schema), d[1])) {
                type = self.schema[d[1]].type;
              }

              if (_.contains(_.keys(self.uniqs), d[1]) && type == "String") {
                htm =
                  htm +
                  '<span title="Number of unique values" class="badge pull-right">' +
                  self.uniqs[d[1]] +
                  "</span>";
              }

              return htm;
            })
            .attr("style", function (d, i, j) {
              if (d[1] == "heading") return "font-style: italic";
              if (j == 0) {
                return " font-weight: bold;";
              }
              return null;
            })
            .attr("href", "#")
            .on("click", function (d) {
              if (d[2]) {
                d[2].call();
              }
            });
        });

        [d3.select(utils.get_ui_element_selector_by_role("shapes"))].forEach(
          function (m) {
            m.selectAll("li").remove();
            var cat_menu = m.selectAll("li").data(
              [
                [
                  [
                    "None",
                    null,
                    _.partial(self.handle_shape_categorical, null),
                  ],
                ],
              ].concat(
                valid_shapes.map(function (d, i) {
                  return [
                    [
                      _menu_label_gen(d),
                      d["raw_attribute_key"],
                      _.partial(
                        self.handle_shape_categorical,
                        d["raw_attribute_key"]
                      ),
                    ],
                  ];
                })
              )
            );

            cat_menu
              .enter()
              .append("li")
              .style("font-variant", function (d) {
                return d[0][1] < -1 ? "small-caps" : "normal";
              });

            cat_menu
              .selectAll("a")
              .data(function (d) {
                return d;
              })
              .enter()
              .append("a")
              .html(function (d, i, j) {
                let htm = d[0];
                let type = "unknown";

                if (_.contains(_.keys(self.schema), d[1])) {
                  type = self.schema[d[1]].type;
                }

                if (_.contains(_.keys(self.uniqs), d[1]) && type == "String") {
                  htm =
                    htm +
                    '<span title="Number of unique values" class="badge pull-right">' +
                    self.uniqs[d[1]] +
                    "</span>";
                }

                return htm;
              })
              .attr("style", function (d, i, j) {
                if (j == 0) {
                  return " font-weight: bold;";
                }
                return null;
              })
              .attr("href", "#")
              .on("click", function (d) {
                if (d[2]) {
                  d[2].call();
                }
              });
          }
        );

        $(utils.get_ui_element_selector_by_role("opacity_invert"))
          .off("click")
          .on("click", function (e) {
            if (self.colorizer["opacity_scale"]) {
              self.colorizer["opacity_scale"].range(
                self.colorizer["opacity_scale"].range().reverse()
              );
              self.update(true);
              self.draw_attribute_labels();
            }
            $(this).toggleClass("btn-active btn-default");
          });

        $(utils.get_ui_element_selector_by_role("attributes_invert"))
          .off("click")
          .on("click", function (e) {
            if (self.colorizer["category_id"]) {
              graph_data[_networkGraphAttrbuteID][
                self.colorizer["category_id"]
              ]["scale"].range(
                graph_data[_networkGraphAttrbuteID][
                  self.colorizer["category_id"]
                ]["scale"]
                  .range()
                  .reverse()
              );
              self.clusters.forEach(function (the_cluster) {
                the_cluster["gradient"] = compute_cluster_gradient(
                  the_cluster,
                  self.colorizer["category_id"]
                );
              });
              self.update(true);
              self.draw_attribute_labels();
            }
            $(this).toggleClass("btn-active btn-default");
          });

        [d3.select(utils.get_ui_element_selector_by_role("opacity"))].forEach(
          function (m) {
            m.selectAll("li").remove();
            var cat_menu = m.selectAll("li").data(
              [
                [
                  [
                    "None",
                    null,
                    _.partial(self.handle_attribute_opacity, null),
                  ],
                ],
              ].concat(
                valid_scales.map(function (d, i) {
                  return [
                    [
                      d["label"],
                      d["raw_attribute_key"],
                      _.partial(
                        self.handle_attribute_opacity,
                        d["raw_attribute_key"]
                      ),
                    ],
                  ];
                })
              )
            );

            cat_menu
              .enter()
              .append("li")
              .style("font-variant", function (d) {
                return d[0][1] < -1 ? "small-caps" : "normal";
              });
            cat_menu
              .selectAll("a")
              .data(function (d) {
                return d;
              })
              .enter()
              .append("a")
              .text(function (d, i, j) {
                return d[0];
              })
              .attr("style", function (d, i, j) {
                if (j == 0) {
                  return " font-weight: bold;";
                }
                return null;
              })
              .attr("href", "#")
              .on("click", function (d) {
                if (d[2]) {
                  d[2].call();
                }
              });
          }
        );
      }
    };

    self._aux_populated_predefined_attribute = function (computed, key) {
      if (_.isFunction(computed)) {
        computed = computed(self);
      }

      if (
        !computed["depends"] ||
        _.every(computed["depends"], (d) =>
          _.has(graph_data[_networkGraphAttrbuteID], d)
        )
      ) {
        var extension = {};
        extension[key] = computed;
        _.extend(graph_data[_networkGraphAttrbuteID], extension);
        self.inject_attribute_description(key, computed);
        _.each(graph_data.Nodes, function (node) {
          inject_attribute_node_value_by_id(
            node,
            key,
            computed["map"](node, self)
          );
        });

        // add unique values
        if (computed.enum) {
          self.uniqValues[key] = computed.enum;
        } else {
          self.uniqValues[key] = _.uniq(
            _.map(graph_data.Nodes, (n) =>
              self.attribute_node_value_by_id(n, key, computed.Type == "Number")
            )
          );
        }

        if (computed["overwrites"]) {
          if (
            _.has(graph_data[_networkGraphAttrbuteID], computed["overwrites"])
          ) {
            graph_data[_networkGraphAttrbuteID][computed["overwrites"]][
              "_hidden_"
            ] = true;
          }
        }
      }
    };

    if (attributes) {
      /*
         map attributes into nodes and into the graph object itself using
         _networkGraphAttrbuteID as the key
      */

      if ("attribute_map" in attributes) {
        var attribute_map = attributes["attribute_map"];

        if ("map" in attribute_map && attribute_map["map"].length > 0) {
          graph_data[_networkGraphAttrbuteID] = attribute_map["map"].map(
            function (a, i) {
              return {
                label: a,
                type: null,
                values: {},
                index: i,
                range: 0,
              };
            }
          );

          graph_data.Nodes.forEach(function (n) {
            n[_networkGraphAttrbuteID] = n.id.split(attribute_map["delimiter"]);
            n[_networkGraphAttrbuteID].forEach(function (v, i) {
              if (i < graph_data[_networkGraphAttrbuteID].length) {
                if (!(v in graph_data[_networkGraphAttrbuteID][i]["values"])) {
                  graph_data[_networkGraphAttrbuteID][i]["values"][v] =
                    graph_data[_networkGraphAttrbuteID][i]["range"];
                  graph_data[_networkGraphAttrbuteID][i]["range"] += 1;
                }
              }
              //graph_data [_networkGraphAttrbuteID][i]["values"][v] = 1 + (graph_data [_networkGraphAttrbuteID][i]["values"][v] ? graph_data [_networkGraphAttrbuteID][i]["values"][v] : 0);
            });
          });

          graph_data[_networkGraphAttrbuteID].forEach(function (d) {
            if (
              d["range"] < graph_data.Nodes.length &&
              d["range"] > 1 &&
              d["range"] <= 20
            ) {
              d["type"] = "category";
            }
          });
        }
      }

      _.each(
        self._networkPredefinedAttributeTransforms,
        self._aux_populated_predefined_attribute
      );
      self._aux_populate_category_menus();

      // populate the UI elements
    }

    if (self.cluster_sizes.length > max_points_to_render) {
      var sorted_array = self.cluster_sizes
        .map(function (d, i) {
          return [d, i + 1];
        })
        .sort(function (a, b) {
          return a[0] - b[0];
        });

      for (var k = 0; k < sorted_array.length - max_points_to_render; k++) {
        self.exclude_cluster_ids[sorted_array[k][1]] = 1;
      }

      self.warning_string +=
        (self.warning_string.length ? "<br>" : "") +
        "Excluded " +
        (sorted_array.length - max_points_to_render) +
        " clusters (maximum size " +
        sorted_array[k - 1][0] +
        " nodes) because only " +
        max_points_to_render +
        " objects can be shown at once.";
    }

    self.edges.forEach(function (e, i) {
      self.clusters[
        self.cluster_mapping[self.nodes[e.target].cluster]
      ].distances.push(e.length);
    });

    self.clusters.forEach(function (d, i) {
      d.distances = helpers.describe_vector(d.distances);
    });
    //self.clusters

    self.update();
  }

  function _cluster_table_draw_id(element, payload) {
    var this_cell = d3.select(element);
    this_cell.selectAll("*").remove();
    var _is_subcluster = payload[1];
    var cluster_id = payload[0];

    if (_is_subcluster) {
      //console.log (payload);

      //this_cell.append("i")
      //      .classed("fa fa-arrow-circle-o-right", true).style("padding-right", "0.25em");

      /*if (payload[2].rr_count) {
        this_cell
          .append("i")
          .classed("fa fa-exclamation-triangle", true)
          .attr("title", "Subcluster has recent/rapid nodes");
      }*/
      this_cell.append("span").text(cluster_id).style("padding-right", "0.5em");

      this_cell
        .append("button")
        .classed("btn btn-sm pull-right", true)
        //.text(__("clusters_tab")["view"])
        .on("click", function (e) {
          self.view_subcluster(payload[2]);
        })
        .append("i")
        .classed("fa fa-eye", true)
        .attr("title", __("clusters_tab")["view"]);
    } else {
      this_cell.append("span").text(cluster_id).style("padding-right", "0.5em");
      this_cell
        .append("button")
        .classed("btn btn-sm pull-right", true)
        .style("margin-right", "0.25em")
        .on("click", function (e) {
          self.open_exclusive_tab_view(cluster_id);
        })
        .append("i")
        .classed("fa fa-eye", true)
        .attr("title", __("clusters_tab")["view"]);
    }
    this_cell
      .append("button")
      .classed("btn btn-sm pull-right", true)
      .style("margin-right", "0.25em")
      //.text(__("clusters_tab")["list"])
      .attr("data-toggle", "modal")
      .attr(
        "data-target",
        utils.get_ui_element_selector_by_role("cluster_list", true)
      )
      .attr("data-cluster", cluster_id)
      .append("i")
      .classed("fa fa-list", true)
      .attr("title", __("clusters_tab")["list"]);
  }

  function _cluster_table_draw_buttons(element, payload) {
    var this_cell = d3.select(element);
    const label_diff = function (c_info) {
      const d = c_info["delta"];
      const moved = c_info["moved"];
      const deleted = c_info["deleted"];
      const new_count = c_info["new_nodes"] ? c_info["new_nodes"] : 0;

      /*if (moved) {
            if (d > 0) {
                return "" + moved + " nodes moved +" + d + " new";
            } else {
                if (d == 0) {
                    return "" + moved + " nodes moved";
                } else {
                    return "" + moved + " nodes moved " + (-d) + " removed";
                }
            }

        } else {
            if (d > 0) {
                return "+" + d + " nodes";
            } else {
                if (d == 0) {
                    return "no size change";
                } else {
                    return "" + (-d) + " nodes removed";
                }
            }
        }*/

      var label_str = "";
      if (moved) label_str = " " + moved + " moved ";
      if (new_count) label_str += "+" + new_count + " new ";
      if (deleted) label_str += "-" + deleted + " previous ";
      return label_str;
    };

    var labels = [];

    if (payload[4]) {
      if (payload[4]["type"] == "new") {
        if (payload[4]["moved"]) {
          labels.push(["renamed " + label_diff(payload[4]), 2]);
        } else {
          labels.push(["new", 3]);
        }
      } else {
        if (payload[4]["type"] == "extended") {
          labels.push([label_diff(payload[4]), payload["4"]["flag"]]);
        } else {
          if (payload[4]["type"] == "merged") {
            labels.push([
              "Merged " +
              payload[4]["old_clusters"].join(", ") +
              " " +
              label_diff(payload[4]),
              payload["4"]["flag"],
            ]);
          }
        }
      }
    }

    labels.push([
      [
        payload[0]
          ? __("clusters_tab")["expand"]
          : __("clusters_tab")["collapse"],
        payload[0] ? "fa-expand" : "fa-compress",
      ],
      0,
    ]);
    if (payload[1]) {
      labels.push([["problematic", "fa-exclamation-circle"], 1]);
    }
    if (payload[2]) {
      labels.push([["match", "fa-check-square"], 1]);
    }
    var buttons = this_cell.selectAll("button").data(labels);
    buttons.enter().append("button");
    buttons.exit().remove();
    buttons
      .classed("btn btn-xs", true)
      .classed("btn-default", function (d) {
        return d[1] != 1 && d[1] != 2;
      })
      .classed("btn-danger", function (d) {
        return d[1] == 2;
      })
      .classed("btn-success", function (d) {
        return d[1] == 3;
      })
      /*.text(function(d) {
        return d[0];
      })*/
      .style("margin-right", "0.25em")
      .attr("disabled", function (d) {
        return d[1] == 1 ? "disabled" : null;
      })
      .on("click", function (d) {
        if (d[1] == 0) {
          if (payload[0]) {
            expand_cluster(self.clusters[payload[3] - 1], true);
          } else {
            collapse_cluster(self.clusters[payload[3] - 1]);
          }
          self.update_volatile_elements(self.cluster_table);
          if (self.subcluster_table) {
            self.update_volatile_elements(self.subcluster_table);
          }
        } else {
          if (d[1] == 2 || d[1] == 3) {
            //_social_view_options (labeled_links, shown_types),

            var shown_types = { Existing: 1, "Newly added": 1 },
              link_class = ["Existing", "Newly added"];

            self
              .open_exclusive_tab_view(
                payload[3],
                null,
                (cluster_id) => "Cluster " + cluster_id + " [changes view]",
                self._social_view_options(link_class, shown_types, (e) => {
                  if (_.isObject(e.source) && self._is_new_node(e.source))
                    return "Newly added";
                  if (_.isObject(e.target) && self._is_new_node(e.target))
                    return "Newly added";

                  return e.attributes.indexOf("added-to-prior") >= 0
                    ? "Newly added"
                    : "Existing";
                })
              )
              .handle_attribute_categorical("_newly_added");
          }
        }
      });
    buttons.each(function (d, i) {
      var this_e = d3.select(this);
      if (_.isString(d[0])) {
        this_e.selectAll("i").remove();
        this_e.text(d[0]);
      } else {
        var i_span = this_e.selectAll("i").data([d[0]]);
        i_span.enter().append("i");
        i_span
          .attr(
            "class",
            function (d) {
              return "fa " + d[1];
            },
            true
          )
          .attr("title", function (d) {
            return d[0];
          });
      }
    });
  }

  function _extract_single_cluster(
    nodes,
    filter,
    no_clone,
    given_json,
    include_extra_edges
  ) {
    /**
        Extract the nodes and edges between them into a separate objects
        @param nodes [array]  the list of nodes to extract
        @param filter [function, optional] (edge) -> bool filtering function for deciding which edges will be used to define clusters
        @param no_clone [bool] if set to T, node objects are not shallow cloned in the return object

        @return [dict] the object representing "Nodes" and "Edges" in the extracted cluster

    */

    var cluster_json = {};
    var map_to_id = {};

    cluster_json.Nodes = _.map(nodes, function (c, i) {
      map_to_id[c.id] = i;

      if (no_clone) {
        return c;
      }
      var cc = _.clone(c);
      cc.cluster = 1;
      return cc;
    });

    given_json = given_json || json;

    cluster_json.Edges = _.filter(given_json.Edges, function (e) {
      if (_.isUndefined(e.source) || _.isUndefined(e.target)) {
        return false;
      }

      return (
        given_json.Nodes[e.source].id in map_to_id &&
        given_json.Nodes[e.target].id in map_to_id &&
        (include_extra_edges || !self.is_edge_injected(e))
      );
    });

    if (filter) {
      cluster_json.Edges = _.filter(cluster_json.Edges, filter);
    }

    cluster_json.Edges = _.map(cluster_json.Edges, function (e) {
      var ne = _.clone(e);
      ne.source = map_to_id[given_json.Nodes[e.source].id];
      ne.target = map_to_id[given_json.Nodes[e.target].id];
      return ne;
    });

    return cluster_json;
  }

  function _node_table_draw_buttons(element, payload) {
    var this_cell = d3.select(element);
    var labels = [
      payload.length == 1
        ? _.isString(payload[0])
          ? [payload[0], 1, "btn-warning"]
          : ["can't be shown", 1]
        : [payload[0] ? "hide" : "show", 0],
    ];

    if (payload.length == 2 && payload[1] >= 1) {
      labels.push([
        "view cluster",
        function () {
          self.open_exclusive_tab_view(payload[1]);
        },
      ]);
    }

    var buttons = this_cell.selectAll("button").data(labels);
    buttons.enter().append("button");
    buttons.exit().remove();
    buttons
      .classed("btn btn-xs btn-node-property", true)
      .classed("btn-primary", true)
      //.classed(function (d) {return d.length >=3 ? d[2] : "";}, function (d) {return d.length >= 3;})
      .text(function (d) {
        return d[0];
      })
      .attr("disabled", function (d) {
        return d[1] && !_.isFunction(d[1]) ? "disabled" : null;
      })
      .on("click", function (d) {
        if (_.isFunction(d[1])) {
          d[1].call(d);
        } else {
          if (d[1] == 0) {
            if (payload[0]) {
              collapse_cluster(self.clusters[payload[3] - 1], true);
            } else {
              expand_cluster(self.clusters[payload[3] - 1]);
            }
            //format_a_cell(d3.select(element).datum(), null, element);
            self.update_volatile_elements(nodesTab.getNodeTable());
          }
        }
      });
    buttons.each(function (d, e) {
      if (d.length >= 3) {
        d3.select(this).classed("btn-primary", false).classed(d[2], true);
      }
    });
  }

  /*self.process_table_volatile_event = function (e) {
    console.log (e);
    e.detail
      .selectAll("td")
      .filter(function(d) {
        return "volatile" in d;
      })
      .each(function(d, i) {
        format_a_cell(d, i, this);
      });
  };*/

  self.update_volatile_elements = function (container) {
    //var event = new CustomEvent('hiv-trace-viz-volatile-update', { detail: container });
    //container.node().dispatchEvent (event);

    container
      .selectAll("td, th")
      .filter(function (d) {
        return "volatile" in d;
      })
      .each(function (d, i) {
        // TODO: QUESTION: Should this have priority_set_editor arg passed in as well? 
        tables.format_a_cell(d, i, this);
      });
  };

  self.redraw_tables = function () {
    self.update_volatile_elements(self.cluster_table);
    if (self.subcluster_table) {
      self.update_volatile_elements(self.subcluster_table);
    }
    self.update_volatile_elements(nodesTab.getNodeTable());
    if (self.priority_set_table) {
      self.update_volatile_elements(self.priority_set_table);
    }
  };

  self.draw_extended_node_table = function (
    node_list,
    container,
    extra_columns
  ) {
    container = container || nodesTab.getNodeTable();

    if (container) {
      node_list = node_list || self.nodes;
      var column_ids = self._extract_exportable_attributes(true);

      self.displayed_node_subset = _.filter(
        _.map(self.displayed_node_subset, function (n, i) {
          if (_.isString(n)) {
            n = _.find(column_ids, function (cd) {
              return cd.raw_attribute_key == n;
            });

            if (n) {
              return n;
            }
            return column_ids[i];
          }
          return n;
        }),
        (c) => c
      );

      var node_data = self._extract_attributes_for_nodes(
        node_list,
        self.displayed_node_subset
      );
      node_data.splice(0, 1);
      var table_headers = _.map(
        self.displayed_node_subset,
        function (n, col_id) {
          return {
            value: n.raw_attribute_key,
            sort: "value",
            filter: true,
            volatile: true,
            help: "label" in n ? n.label : n.raw_attribute_key,
            //format: (d) => "label" in d ? d.label : d.raw_attribute_key,
            callback: function (element, payload) {
              var dropdown = d3
                .select(element)
                .append("div")
                .classed("dropdown", true);
              var menu_id = "hivtrace_node_column_" + payload;
              var dropdown_button = dropdown
                .append("button")
                .classed({
                  btn: true,
                  "btn-default": true,
                  "btn-xs": true,
                  "dropdown-toggle": true,
                })
                .attr("type", "button")
                .attr("data-toggle", "dropdown")
                .attr("aria-haspopup", "true")
                .attr("aria-expanded", "false")
                .attr("id", menu_id);

              function format_key(key) {
                let formattedKey = jsConvert.toHeaderCase(key);
                let words = formattedKey.split(" ");
                let mappedWords = _.map(words, (word) => {
                  if (word.toLowerCase() == "hivtrace") {
                    return "HIV-TRACE";
                  }
                  if (word.toLowerCase() == "id") {
                    return "ID";
                  }

                  return word;
                });
                return mappedWords.join(" ");
              }

              function get_text_label(key) {
                return key in json.patient_attribute_schema
                  ? json.patient_attribute_schema[key].label
                  : format_key(key);
              }

              dropdown_button.text(get_text_label(payload));

              dropdown_button.append("i").classed({
                fa: true,
                "fa-caret-down": true,
                "fa-lg": true,
              });
              var dropdown_list = dropdown
                .append("ul")
                .classed("dropdown-menu", true)
                .attr("aria-labelledby", menu_id);

              dropdown_list = dropdown_list.selectAll("li").data(
                _.filter(column_ids, function (alt) {
                  return alt.raw_attribute_key != n.raw_attribute_key;
                })
              );
              dropdown_list.enter().append("li");
              dropdown_list.each(function (data, i) {
                var handle_change = d3
                  .select(this)
                  .append("a")
                  .attr("href", "#")
                  .text(function (data) {
                    return get_text_label(data.raw_attribute_key);
                  });
                handle_change.on("click", function (d) {
                  self.displayed_node_subset[col_id] = d;
                  self.draw_extended_node_table(
                    node_list,
                    container,
                    extra_columns
                  );
                });
              });
              return dropdown;
            },
          };
        }
      );

      if (extra_columns) {
        _.each(extra_columns, function (d) {
          if (d.prepend) {
            table_headers.splice(0, 0, d.description);
          } else {
            table_headers.push(d.description);
          }
        });
      }
      //console.log (self.displayed_node_subset);

      var table_rows = node_data.map(function (n, i) {
        var this_row = _.map(n, function (cell, c) {
          let cell_definition = null;

          if (self.displayed_node_subset[c].type == "Date") {
            cell_definition = {
              value: cell,
              format: function (v) {
                if (v == _networkMissing) {
                  return v;
                }
                return _defaultDateViewFormatSlider(v);
              },
            };
          } else {
            if (self.displayed_node_subset[c].type == "Number") {
              cell_definition = { value: cell, format: d3.format(".2f") };
            }
          }
          if (!cell_definition) {
            cell_definition = { value: cell };
          }

          // this makes the table rendering too slow

          /*if (c == 0 && self._is_CDC_) {
             cell_definition.volatile = true;
             cell_definition.actions = function (item, value) {
              if (!self.priority_set_editor) {
                    return null;
              } else {
                    return [
                        {
                            "icon"   : "fa-plus-square",
                            "action" : function (button,v) {
                                if (self.priority_set_editor) {
                                    self.priority_set_editor.append_node_objects (d.children);
                                }
                                return false;
                            },
                            "help"   : "Add to priority set"
                        }
                    ];
                }
            };
          }*/

          return cell_definition;
        });

        if (extra_columns) {
          _.each(extra_columns, function (ed) {
            if (ed.prepend) {
              this_row.splice(0, 0, ed.generator(node_list[i], self));
            } else {
              this_row.push(ed.generator(node_list[i], self));
            }
          });
        }

        return this_row;
      });

      self.draw_node_table(
        null,
        null,
        [table_headers],
        table_rows,
        container,
        'Showing <span class="badge" data-hivtrace-ui-role="table-count-shown">--</span>/<span class="badge" data-hivtrace-ui-role="table-count-total">--</span> network nodes'
      );
    }
  };

  self.draw_priority_set_table = function (container, priority_groups) {
    container = container || self.priority_set_table;
    if (container) {
      priority_groups = priority_groups || self.defined_priority_groups;
      self.priority_groups_compute_node_membership();
      self.priority_groups_compute_overlap(priority_groups);
      var headers = [
        [
          {
            value: "Type",
            sort: function (c) {
              return c.value;
            },
            help: "How was this cluster of interest created",
            width: 50,
          },
          {
            value: "Name",
            sort: "value",
            filter: true,
            width: 325,
            text_wrap: true,
            help: "Cluster of interest name",
          },
          {
            value: "Modified/created",
            width: 180,
            sort: function (c) {
              return c.value[0];
            },
            help: "When was the cluster of interest created/last modified",
          },
          {
            value: "Growth",
            sort: "value",
            help: "How growth is handled",
            width: 100,
            //text_wrap: true
          },
          {
            value: "Size",
            width: 100,
            presort: "desc",
            sort: function (c) {
              c = c.value;
              if (c) {
                return c[1] + (c[2] ? 1e10 : 0) + (c[3] ? 1e5 : 0);
              }
              return 0;
            },
            help: "Number of nodes in the cluster of interest",
          },
          {
            value: "Priority",
            width: 60,
            sort: "value",
            help: "Does the cluster of interest continue to meet priority criteria?",
          },
          {
            value: "DXs in last 12 mo.",
            width: 50,
            sort: "value",
            help: "The number of cases in the cluster of interest diagnosed in the past 12 months",
          },
          {
            value: "Overlap",
            width: 140,
            sort: function (c) {
              c = c.value;
              if (c) {
                return c[1];
              }
              return 0;
            },
            help: "How many other ClusterOI have overlapping nodes with this ClusterOI, and (if overlapping ClusterOI exist) how many nodes in this ClusterOI overlap with ANY other ClusterOI?",
          },
          /*,
            {
              value: "Cluster",
              sort: "value",
              help: "Which cluster does the node belong to"
            }*/
        ],
      ];

      if (self._is_CDC_auto_mode) {
        headers[0].splice(3, 0, {
          value: "clusterOI identification method",
          width: 100,
          sort: function (c) {
            return c.value;
          },
          help: "Method of cluster identification",
        });
      }

      var edit_form_generator = function () {
        return '<form class="form"> \
                        <div class="form-group"> \
                            <div class="input-group">\
                            <textarea class="form-control input-sm" data-hivtrace-ui-role = "priority-description-form" cols = "40" rows = "3"></textarea>\
                            </div>\
                        </div>\
                        <button data-hivtrace-ui-role = "priority-description-dismiss" class = "btn btn-sm btn-default">Dismiss</button>\
                        <button data-hivtrace-ui-role = "priority-description-save" class = "btn btn-sm btn-default">Save</button>\
                    </form>';
      };

      var rows = [];
      _.each(priority_groups, function (pg) {
        //console.log (pg);
        var this_row = [
          {
            value: pg.createdBy,
            html: true,
            width: 50,
            format: (value) =>
              pg.createdBy == _cdcCreatedBySystem
                ? '<i class="fa fa-2x fa-desktop" title="' +
                _cdcCreatedBySystem +
                '" data-text-export=' +
                _cdcCreatedBySystem +
                "></i>"
                : '<i class="fa fa-2x fa-user" title="' +
                _cdcCreatedByManual +
                '" data-text-export=' +
                _cdcCreatedByManual +
                "></i>",
          },
          {
            value: pg.name,
            width: 325,
            help:
              pg.description +
              (pg.pending ? " (new, pending confirmation)" : "") +
              (pg.expanded
                ? " (" + pg.expanded + " new nodes; pending confirmation)"
                : ""),
            volatile: true,
            format: (value) =>
              "<div style = 'white-space: nowrap; overflow: hidden; text-overflow : ellipsis;'>" +
              (pg.autocreated || pg.autoexpanded
                ? (pg.autoexpanded
                  ? '<span class="label label-default">Grew</span>'
                  : '<span class="label label-danger">New</span>') +
                "&nbsp;<span style = 'font-weight: 900;' data-text-export = '" +
                value +
                "'>" +
                value +
                "</span>"
                : '<span data-text-export = "' +
                value +
                '">' +
                value +
                "</span>") +
              "</div>",
            html: true,
            actions: [],
          },
          {
            width: 180,
            value: [pg.modified, pg.created],
            format: function (value) {
              let vs = _.map(value, (v) => _defaultDateViewFormat(v));

              if (vs[0] != vs[1]) {
                return vs[0] + " / " + vs[1];
              }
              return vs[0];
            },
          },
          {
            width: 100,
            //text_wrap: true,
            value: pg.tracking,
            format: function (value) {
              return _cdcConciseTrackingOptions[value];
            },
          },
          {
            value: [
              pg.node_objects.length,
              _.filter(pg.nodes, (g) => self.priority_groups_is_new_node(pg, g))
                .length,
              pg.createdBy == _cdcCreatedBySystem && pg.pending,
              pg.meets_priority_def,
            ],
            width: 100,
            format: function (v) {
              //console.log (pg);
              if (v) {
                return (
                  v[0] +
                  (v[1]
                    ? ' <span title="Number of nodes added by the system since the last network update" class="label label-default">' +
                      v[1] +
                      " new</span>"
                    : "")
                );
              }
              return "N/A";
            },
            html: true,
          },
          {
            width: 60,
            value: pg.meets_priority_def ? "Yes" : "No",
          },
          {
            width: 50,
            value: pg.last12,
          },
          {
            width: 140,
            value: [
              pg.overlap.sets,
              pg.overlap.nodes,
              pg.overlap.duplicate,
              pg.overlap.superset,
            ],
            format: function (v) {
              if (v) {
                return (
                  "" +
                  v[0] +
                  (v[1]
                    ? ' <span title="Number of nodes in the overlap" class="label label-default pull-right">' +
                    v[1] +
                    " nodes</span>"
                    : "") +
                  (v[2].length
                    ? ' <span title="clusterOIs which are exact duplicates of this clusterOI: ' +
                    v[2].join(", ") +
                    '" class="label label-danger pull-right">' +
                    v[2].length +
                    " duplicate clusterOI</span>"
                    : "") +
                  (v[3].length
                    ? ' <span title="clusterOIs which contain this clusterOI: ' +
                    v[3].join(", ") +
                    '" class="label label-warning pull-right">Fully contained in ' +
                    v[3].length +
                    " clusterOI</span>"
                    : "")
                );
              }
              return "N/A";
            },
            html: true,
            actions:
              pg.overlap.sets == 0
                ? []
                : [
                  {
                    icon: "fa-eye",
                    dropdown: [
                      {
                        label: "List overlaps",
                        data: {
                          toggle: "modal",
                          target: utils.get_ui_element_selector_by_role(
                            "overlap_list",
                            true
                          ),
                          priority_set: pg.name,
                        },
                      },
                    ],
                  },
                ],
          },
        ];

        if (self._is_CDC_auto_mode) {
          this_row.splice(3, 0, {
            value: pg.kind,
            width: 100,
            format: function (v) {
              if (v) {
                return v;
                //"<abbr title = '" + v + "'>" + v.split(" ")[0] + "</abbr>"
              }
              return "N/A";
            },
            html: true,
          });
        }

        if (pg.pending) {
          // pending user review
          this_row[1].actions = [
            {
              icon: "fa-eye",
              help: "Review and adjust this cluster of interest",
              action: function (button, value) {
                let nodeset = self.priority_groups_find_by_name(value);
                if (nodeset) {
                  if (self.priority_set_editor) {
                    alert(
                      "Cannot confirm a cluster of interest while an editor window is open"
                    );
                  } else {
                    clustersOfInterest.open_priority_set_editor(
                      self,
                      nodeset.node_objects,
                      nodeset.name,
                      nodeset.description,
                      nodeset.kind,
                      null,
                      "validate",
                      nodeset,
                      pg.tracking,
                      pg.createdBy
                    );
                    self.redraw_tables();
                  }
                }
              },
            },
          ];
        } else {
          function _action_drop_down() {
            let dropdown = _.flatten(
              [
                _.map([self.subcluster_threshold, 0.015], (threshold) => {
                  return {
                    label:
                      "View this cluster of interest at link distance of " +
                      _defaultPercentFormatShort(threshold),
                    action: function (button, value) {
                      self.priority_set_view(pg, {
                        timestamp: pg.modified || pg.created,
                        priority_set: pg,
                        "priority-edge-length": threshold,
                        title:
                          pg.name + " @" + _defaultPercentFormat(threshold),
                      });
                    },
                  };
                }),
              ],
              true
            );

            if (!self._is_CDC_executive_mode) {
              dropdown.push({
                label: "Clone this cluster of interest in a new editor pane",
                action: function (button, value) {
                  let ref_set = self.priority_groups_find_by_name(pg.name);
                  let copied_node_objects = _.clone(ref_set.node_objects);
                  self.priority_set_inject_node_attibutes(
                    copied_node_objects,
                    pg.nodes
                  );
                  clustersOfInterest.open_priority_set_editor(
                    self,
                    copied_node_objects,
                    "",
                    "Clone of " + pg.name,
                    ref_set.kind
                  );
                  self.redraw_tables();
                },
              });
              if (pg.createdBy != "System") {
                dropdown.push({
                  label: "Delete this cluster of interest",
                  action: function (button, value) {
                    if (confirm("This action cannot be undone. Proceed?")) {
                      self.priority_groups_remove_set(pg.name, true);
                    }
                  },
                });
              }
              dropdown.push({
                label: "View nodes in this cluster of interest",
                data: {
                  toggle: "modal",
                  target: utils.get_ui_element_selector_by_role(
                    "cluster_list",
                    true
                  ),
                  priority_set: pg.name,
                },
              });
            }
            dropdown.push({
              label: "Modify this cluster of interest",
              action: function (button, value) {
                let ref_set = self.priority_groups_find_by_name(pg.name);

                if (ref_set) {
                  /*if (ref_set.modified.getTime() > self.today.getTime()) {
                    if (
                      !confirm(
                        "Editing priority sets modified after the point at which this network was created is not recommended."
                      )
                    )
                      return;
                  }*/
                  clustersOfInterest.open_priority_set_editor(
                    self,
                    ref_set.node_objects,
                    ref_set.name,
                    ref_set.description,
                    ref_set.kind,
                    null,
                    "update",
                    ref_set,
                    ref_set.tracking
                  );
                  self.redraw_tables();
                }
              },
            });

            dropdown.push({
              label: "View history over time",
              action: function (button, value) {
                let ref_set = self.priority_groups_find_by_name(pg.name);
                let report = self.generate_coi_temporal_report(ref_set);
                let container = self.open_exclusive_tab_view_aux(
                  null,
                  "History of " + pg.name,
                  {}
                );
                misc.coi_timeseries(
                  report,
                  d3.select("#" + container).style("padding", "20px"),
                  1000
                );
              },
            });

            return dropdown;
          }

          this_row[1].actions = [_.clone(this_row[1].actions)];
          this_row[1].actions[this_row[1].actions.length - 1].splice(
            -1,
            0,
            {
              icon: "fa-info-circle",
              help: "View/edit this cluster of interest",
              dropdown: _action_drop_down(),
              /*action: function (button, menu_value) {
                  console.log (menu_value);
              }*/
            },
            {
              icon: "fa-edit",
              classed: { "btn-info": true },
              help: "Edit description",
              action: function (this_button, cv) {
                self.handle_inline_confirm(
                  this_button,
                  edit_form_generator,
                  pg.description,
                  function (d) {
                    self.priority_groups_edit_set_description(pg.name, d, true);
                  }
                );
              },
            }
          );
          this_row[1].actions[this_row[1].actions.length - 1].splice(
            -1,
            0,
            function (button_group, value) {
              if (self.priority_set_editor) {
                return {
                  icon: "fa-plus",
                  help: "Add nodes in this cluster of interest to the new cluster of interest",
                  action: function (button, value) {
                    let nodeset = self.priority_groups_find_by_name(value);
                    if (nodeset) {
                      self.priority_set_editor.append_node_objects(
                        nodeset.node_objects
                      );
                    }
                  },
                };
              }
              return null;
            }
          );
        }
        this_row[1].actions = _.flatten(this_row[1].actions);
        //console.log (this_row[0]);
        if (pg.not_in_network.length) {
          this_row[2]["actions"] = [
            {
              text: "" + pg.not_in_network.length + " removed",
              classed: { "btn-danger": true, disabled: true },
              help:
                "Nodes removed from the network: " +
                pg.not_in_network.join(", "),
            },
          ];
        }
        rows.push(this_row);
      });

      let has_automatic = self.priority_groups_pending(),
        has_expanded = self.priority_groups_expanded(),
        has_required_actions = "";

      /*
      if (has_automatic + has_expanded) {
        let labeler = (c, description, c2) => {
          if (c) {
            c2 = c2 ? " and " : "";
            return c2 + c + " " + description;
          }
          return "";
        };

        has_required_actions =
          '<div class="alert alert-info">There are ' +
          "<span style = 'color: darkred'>" + labeler(has_automatic, "automatically created") + "</span>" +
          "<span style = 'color: orange'>" + labeler(has_expanded, "automatically expanded", has_automatic) + "</span>" +
          ' priority sets.</div>';
      } else {
        has_required_actions = "";
      }*/

      tables.add_a_sortable_table(
        container,
        headers,
        rows,
        true,
        has_required_actions +
        'Showing <span class="badge" data-hivtrace-ui-role="table-count-shown">--</span>/<span class="badge" data-hivtrace-ui-role="table-count-total">--</span> clusters of interest.\
            <button class = "btn btn-sm btn-warning pull-right" data-hivtrace-ui-role="priority-subclusters-export">Export to JSON</button>\
            <button class = "btn btn-sm btn-primary pull-right" data-hivtrace-ui-role="priority-subclusters-export-csv">Export to CSV</button>\
            ',
        self.get_priority_set_editor()
      );

      d3.select(
        utils.get_ui_element_selector_by_role(
          "priority-subclusters-export",
          true
        )
      ).on("click", function (d) {
        helpers.export_json_button(
          self.priority_groups_export(),
          _defaultDateViewFormatSlider(self.today)
        );
      });
      d3.select(
        utils.get_ui_element_selector_by_role(
          "priority-subclusters-export-csv",
          true
        )
      ).on("click", function (d) {
        helpers.export_csv_button(
          self.priority_groups_export_nodes(),
          "clusters-of-interest"
        );
      });
      d3.select("#priority_set_table_download").on("click", function (d) {
        helpers.export_csv_button(
          self.priority_groups_export_sets(),
          "clusters_of_interest_table"
        );
      });
    }
  };

  self.generate_coi_temporal_report = function (ref_set, D) {
    if (!ref_set) return {};
    D = D || 0.005;

    let nodesD = hivtrace_cluster_depthwise_traversal(
      json["Nodes"],
      json["Edges"],
      (e) => {
        return e.length <= D;
      },
      null,
      ref_set.node_objects
    );

    let full_subclusters = _.map(nodesD, (cc) =>
      _extract_single_cluster(cc, (e) => e.length <= D)
    );
    // the nodes in full_subclusters are now shallow clones
    let nodeid2cc = _.chain(nodesD)
      .map((cc, i) => _.map(cc, (n) => [n.id, i]))
      .flatten(1)
      .object()
      .value();
    // node id => index of its connected component in the full_subclusters array
    let pg_nodes = new Set(_.map(ref_set.node_objects, (n) => n.id));
    // set of node IDs in the CoI
    let seed_nodes = _.map(full_subclusters, (fc) =>
      _.filter(fc["Nodes"], (n) => pg_nodes.has(n.id))
    );
    // for each connected component, store the list of nodes that are both in the CC and the CoI
    // these are shallow copies
    _.each(seed_nodes, (sn) => _.each(sn, (n) => (n.visited = false)));

    var beginning_of_time = timeDateUtil.getCurrentDate();
    beginning_of_time.setFullYear(1900);

    let nodesD2 = _.map(full_subclusters, (fc, i) => {
      return hivtrace_cluster_depthwise_traversal(
        fc["Nodes"],
        fc["Edges"],
        (e) => {
          return e.length <= D;
        },
        null,
        seed_nodes[i]
      );
    });

    const network_events = _.sortBy([...self.priority_groups_all_events()]);
    network_events.reverse();
    let info_by_event = {};

    _.each(network_events, (DT) => {
      let event_date = _defaultDateViewFormatSlider.parse(DT);
      let event_date_m3y = _defaultDateViewFormatSlider.parse(DT);
      event_date_m3y.setFullYear(event_date.getFullYear() - 3);
      let event_date_m1y = _defaultDateViewFormatSlider.parse(DT);
      event_date_m1y.setFullYear(event_date.getFullYear() - 1);
      const n_filter = (n) =>
        self._filter_by_date(
          beginning_of_time,
          timeDateUtil._networkCDCDateField,
          event_date,
          n
        );
      const n_filter3 = (n) =>
        self._filter_by_date(
          event_date_m3y,
          timeDateUtil._networkCDCDateField,
          event_date,
          n
        );
      const n_filter1 = (n) =>
        self._filter_by_date(
          event_date_m1y,
          timeDateUtil._networkCDCDateField,
          event_date,
          n
        );

      let nodesD2 = _.map(full_subclusters, (fc, i) => {
        const white_list = new Set(
          _.map(_.filter(fc["Nodes"], n_filter), (n) => n.id)
        );
        const cc_nodes = fc["Nodes"];
        return hivtrace_cluster_depthwise_traversal(
          cc_nodes,
          fc["Edges"],
          (e) => {
            return (
              e.length <= D &&
              n_filter3(cc_nodes[e.source]) &&
              n_filter3(cc_nodes[e.target])
            );
          },
          null,
          _.filter(seed_nodes[i], n_filter),
          white_list
        );
      });

      nodesD2 = _.flatten(nodesD2, 1);
      //console.log (nodesD2);

      info_by_event[DT] = {
        connected_componets: _.map(nodesD2, (nd) => nd.length),
        priority_nodes: _.map(nodesD2, (nd) =>
          _.map(_.filter(nd, n_filter1), (n) => n.id)
        ),
      };

      info_by_event[DT]["national_priority"] = _.map(
        info_by_event[DT].priority_nodes,
        (m) => m.length >= self.CDC_data["autocreate-priority-set-size"]
      );
    });

    const report = {
      node_info: _.map(ref_set.node_objects, (n) => [
        n.id,
        _defaultDateViewFormatSlider(
          self.attribute_node_value_by_id(n, timeDateUtil._networkCDCDateField)
        ),
      ]),
      event_info: info_by_event,
    };

    /*let options = ["0","1","2","3","4","5","6","7","8","9","10"];
          let rename = {};
          _.each (report.node_info, (n)=> {
                rename[n[0]] = "N" + _.sample (options, 9).join ("");
                n[0] = rename[n[0]];
          });
          _.each (report.event_info, (d)=> {
              d.priority_nodes = _.map (d.priority_nodes, (d)=>_.map (d, (n)=>rename[n]));
          });
          //console.log (report);
          */

    helpers.export_json_button(report);
    return report;
  };

  self.draw_node_table = function (
    extra_columns,
    node_list,
    headers,
    rows,
    container,
    table_caption
  ) {
    container = container || nodesTab.getNodeTable();

    if (container) {
      node_list = node_list || self.nodes;

      if (!headers) {
        headers = [
          [
            {
              value: "ID",
              sort: "value",
              help: "Node ID",
            },
            {
              value: "Action",
              sort: "value",
            },
            {
              value: "# of links",
              sort: "value",
              help: "Number of links (Node degree)",
            },
            {
              value: "Cluster",
              sort: "value",
              help: "Which cluster does the node belong to",
            },
          ],
        ];

        if (extra_columns) {
          _.each(extra_columns, function (d) {
            if (d.prepend) {
              headers[0].splice(0, 0, d.description);
            } else {
              headers[0].push(d.description);
            }
          });
        }

        rows = node_list.map(function (n, i) {
          var this_row = [
            {
              value: n.id,
              help: "Node ID",
            },
            {
              value: function () {
                if (n.node_class != "injected") {
                  try {
                    if (self.exclude_cluster_ids[n.cluster]) {
                      // parent cluster can't be rendered
                      // because of size restrictions
                      return [n.cluster];
                    }
                    return [
                      !self.clusters[self.cluster_mapping[n.cluster]].collapsed,
                      n.cluster,
                    ];
                  } catch (err) {
                    return [-1];
                  }
                } else {
                  return [n.node_annotation];
                }
              },
              callback: _node_table_draw_buttons,
              volatile: true,
            },
            {
              value: "degree" in n ? n.degree : "Not defined",
              help: "Node degree",
            },
            {
              value: "cluster" in n ? n.cluster : "Not defined",
              help: "Which cluster does the node belong to",
            },
          ];

          if (extra_columns) {
            _.each(extra_columns, function (ed) {
              if (ed.prepend) {
                this_row.splice(0, 0, ed.generator(n, self));
              } else {
                this_row.push(ed.generator(n, self));
              }
            });
          }
          return this_row;
        });
      }

      tables.add_a_sortable_table(
        container,
        headers,
        rows,
        true,
        table_caption,
        self.get_priority_set_editor()
        // rows
      );
    }
  };

  self.draw_cluster_table = function (extra_columns, element, options) {
    var skip_clusters = options && options["no-clusters"];
    var skip_subclusters = !(options && options["subclusters"]);

    element = element || self.cluster_table;

    if (element) {
      var headers = [
        [
          {
            value: __("general")["cluster"] + " ID",
            sort: function (c) {
              return _.map(
                c.value[0].split(_networkSubclusterSeparator),
                function (ss) {
                  return _networkDotFormatPadder(+ss);
                }
              ).join("|");
            },
            help: "Unique cluster ID",
          },
          {
            value: __("general")["attributes"],
            sort: function (c) {
              c = c.value();
              if (c[4]) {
                // has attributes
                return c[4]["delta"];
              } else {
                return c[0];
              }
            },
            help: "Visibility in the network tab and other attributes",
          },
          {
            value: __("clusters_tab")["size"],
            sort: "value",
            help: "Number of nodes in the cluster",
          },
        ],
      ];

      if (self.cluster_attributes) {
        headers[0][1]["presort"] = "desc";
      }

      if (self._is_seguro) {
        headers[0].push({
          value: __("clusters_tab")["number_of_genotypes_in_past_2_months"],
          sort: "value",
          help: "# of cases in cluster genotyped in the last 2 months",
        });

        headers[0].push({
          value:
            __("clusters_tab")["scaled_number_of_genotypes_in_past_2_months"],
          sort: "value",
          help: "# of cases in cluster genotyped in the last 2 months divided by the square-root of the cluster size",
        });
      }

      if (!self._is_CDC_) {
        headers[0].push({
          value:
            __("statistics")["links_per_node"] +
            "<br>" +
            __("statistics")["mean"] +
            "[" +
            __("statistics")["median"] +
            ", IQR]",
          html: true,
        });

        headers[0].push({
          value:
            __("statistics")["genetic_distances_among_linked_nodes"] +
            "<br>" +
            __("statistics")["mean"] +
            "[" +
            __("statistics")["median"] +
            ", IQR]",
          help: "Genetic distance among nodes in the cluster",
          html: true,
        });
      }

      if (extra_columns) {
        _.each(extra_columns, function (d) {
          headers[0].push(d.description);
        });
      }

      if (options && options["headers"]) {
        options["headers"](headers);
      }

      var rows = [];

      _.each(self.clusters, function (cluster) {
        var make_row = function (d, is_subcluster) {
          var this_row = [
            {
              value: [d.cluster_id, is_subcluster, d], //.cluster_id,
              callback: _cluster_table_draw_id,
            },
            {
              value: function () {
                var actual_cluster = is_subcluster ? d.parent_cluster : d;

                return [
                  actual_cluster.collapsed,
                  actual_cluster.hxb2_linked,
                  actual_cluster.match_filter,
                  actual_cluster.cluster_id,
                  is_subcluster
                    ? null
                    : self.cluster_attributes
                      ? self.cluster_attributes[actual_cluster.cluster_id]
                      : null,
                ];
              },
              callback: _cluster_table_draw_buttons,
              volatile: true,
            },
            {
              value: d.children.length,
            },
          ];

          if (self._is_CDC_) {
            this_row[2].volatile = true;
            this_row[2].actions = function (item, value) {
              if (!self.priority_set_editor) {
                return null;
              } else {
                return [
                  {
                    icon: "fa-plus",
                    action: function (button, v) {
                      if (self.priority_set_editor) {
                        self.priority_set_editor.append_node_objects(
                          d.children
                        );
                      }
                      return false;
                    },
                    help: "Add to cluster of interest",
                  },
                ];
              }
            };
          }

          if (self._is_seguro) {
            this_row.push({
              value: d,
              format: function (d) {
                return _.filter(
                  d.children,
                  (child) =>
                    d3.time.months(
                      child.patient_attributes["sample_dt"],
                      timeDateUtil.getCurrentDate()
                    ).length <= 2
                ).length;
              },
            });

            this_row.push({
              value: d,
              format: function (d) {
                let recent = _.filter(
                  d.children,
                  (child) =>
                    d3.time.months(
                      child.patient_attributes["sample_dt"],
                      timeDateUtil.getCurrentDate()
                    ).length <= 2
                ).length;
                return recent / Math.sqrt(d.children.length);
              },
            });
          }

          if (!self._is_CDC_) {
            this_row.push({
              value: d.degrees,
              format: function (d) {
                try {
                  return (
                    _defaultFloatFormat(d["mean"]) +
                    " [" +
                    _defaultFloatFormat(d["median"]) +
                    ", " +
                    _defaultFloatFormat(d["Q1"]) +
                    " - " +
                    _defaultFloatFormat(d["Q3"]) +
                    "]"
                  );
                } catch (e) {
                  return "";
                }
              },
            });
            this_row.push({
              value: d.distances,
              format: function (d) {
                try {
                  return (
                    _defaultFloatFormat(d["mean"]) +
                    " [" +
                    _defaultFloatFormat(d["median"]) +
                    ", " +
                    _defaultFloatFormat(d["Q1"]) +
                    " - " +
                    _defaultFloatFormat(d["Q3"]) +
                    "]"
                  );
                } catch (e) {
                  return "";
                }
              },
            });
          }
          if (extra_columns) {
            _.each(extra_columns, function (ed) {
              this_row.push(ed.generator(d, self));
            });
          }

          return this_row;
        };

        if (!skip_clusters) {
          rows.push(make_row(cluster, false));
        }

        if (!skip_subclusters) {
          _.each(cluster.subclusters, function (sub_cluster) {
            rows.push(make_row(sub_cluster, true));
          });
        }
      });

      tables.add_a_sortable_table(
        element,
        headers,
        rows,
        true,
        options && options["caption"] ? options["caption"] : null,
        self.get_priority_set_editor()
      );
    }
  };

  /*------------ Update layout code ---------------*/
  function update_network_string(node_count, edge_count) {
    if (network_status_string) {
      var clusters_shown = _.filter(self.clusters, function (c) {
        return !c.collapsed;
      }).length,
        clusters_removed = self.cluster_sizes.length - self.clusters.length,
        nodes_removed =
          graph_data.Nodes.length - singletons - self.nodes.length;

      var clusters_selected = _.filter(self.clusters, function (c) {
        return (
          !c.is_hidden && c.match_filter !== undefined && c.match_filter > 0
        );
      }).length;

      var nodes_selected = _.filter(self.nodes, function (n) {
        return n.match_filter && !n.is_hidden;
      }).length;

      /*var s = "Displaying a network on <strong>" + self.nodes.length + "</strong> nodes, <strong>" + self.clusters.length + "</strong> clusters"
              + (clusters_removed > 0 ? " (an additional " + clusters_removed + " clusters and " + nodes_removed + " nodes have been removed due to network size constraints)" : "") + ". <strong>"
              + clusters_shown +"</strong> clusters are expanded. Of <strong>" + self.edges.length + "</strong> edges, <strong>" + draw_me.edges.length + "</strong>, and of  <strong>" + self.nodes.length  + " </strong> nodes,  <strong>" + draw_me.nodes.length + " </strong> are displayed. ";
      if (singletons > 0) {
          s += "<strong>" +singletons + "</strong> singleton nodes are not shown. ";
      }*/

      var s =
        "<span class = 'badge'>" +
        self.clusters.length +
        "</span> clusters <span class = 'label label-primary'>" +
        clusters_shown +
        " expanded / " +
        clusters_selected +
        " match </span> <span class = 'badge'> " +
        self.nodes.length +
        "</span> nodes <span class = 'label label-primary'>" +
        node_count +
        " shown / " +
        nodes_selected +
        " match </span> <span class = 'badge'> " +
        self.edges.length +
        "</span> " +
        (self._is_CDC_ ? "links" : "edges") +
        " <span class = 'label label-primary'>" +
        edge_count +
        " shown</span>";

      d3.select(network_status_string).html(s);
    }
  }

  function draw_a_node(container, node) {
    if (node) {
      container = d3.select(container);
      //console.log (container.selectAll ("path"));
      //var path_component = containter.selectAll ("path");

      var symbol_type =
        node.hxb2_linked && !node.is_lanl
          ? "cross"
          : node.is_lanl
            ? "triangle-down"
            : self.node_shaper["shaper"](node);

      node.rendered_size = Math.sqrt(node_size(node)) / 2 + 2;

      container
        .selectAll("path")
        .attr("d", misc.symbol(symbol_type).size(node_size(node)))
        .style("fill", function (d) {
          return node_color(d);
        });

      if (node.show_label) {
        if (container.selectAll("text").empty()) {
          node.label_x = 0;
          node.label_y = 0;
          container
            .append("text")
            .classed("node-label", true)
            .text(node.id)
            .attr(
              "transform",
              "translate(" +
              node.rendered_size * 1.25 +
              "," +
              node.rendered_size * 0.5 +
              ")"
            )
            .datum(node)
            .call(self.node_label_drag);
        }
      } else {
        container.selectAll("text").remove();
      }

      container
        //.attr("d", misc.symbol(symbol_type).size(node_size(node)))
        .attr("class", "node")
        .classed("selected_object", function (d) {
          return d.match_filter && !self.hide_unselected;
        })
        .classed("injected_object", function (d) {
          return d.node_class == "injected";
        })
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .style("opacity", function (d) {
          return node_opacity(d);
        })
        .style("display", function (d) {
          if (d.is_hidden) return "none";
          return null;
        })
        .call(
          network_layout.drag().on("dragstart", function (d) {
            d3.event.sourceEvent.stopPropagation();
            node_pop_off();
          })
        )
        .on("dragend", function (d) {
          d3.event.sourceEvent.stopPropagation();
        })
        .on("click", handle_node_click)
        .on("mouseover", node_pop_on)
        .on("mouseout", node_pop_off);
    }
  }

  function draw_a_cluster(container, the_cluster) {
    var container_group = d3.select(container);

    var draw_from = the_cluster["binned_attributes"]
      ? the_cluster["binned_attributes"].map(function (d) {
        return d.concat([0]);
      })
      : [[null, 1, 0]];

    if (the_cluster.match_filter) {
      draw_from = draw_from.concat([
        ["selected", the_cluster.match_filter, 1],
        [
          "not selected",
          the_cluster.children.length - the_cluster.match_filter,
          1,
        ],
      ]);
    }

    var sums = [
      d3.sum(
        draw_from.filter(function (d) {
          return d[2] == 0;
        }),
        function (d) {
          return d[1];
        }
      ),
      d3.sum(
        draw_from.filter(function (d) {
          return d[2] != 0;
        }),
        function (d) {
          return d[1];
        }
      ),
    ];

    var running_totals = [0, 0];

    draw_from = draw_from.map(function (d) {
      var index = d[2];
      var v = {
        container: container,
        cluster: the_cluster,
        startAngle: (running_totals[index] / sums[index]) * 2 * Math.PI,
        endAngle: ((running_totals[index] + d[1]) / sums[index]) * 2 * Math.PI,
        name: d[0],
        rim: index > 0,
      };
      running_totals[index] += d[1];
      return v;
    });

    var arc_radius = cluster_box_size(the_cluster) * 0.5;
    the_cluster.rendered_size = arc_radius + 2;
    var paths = container_group.selectAll("path").data(draw_from);
    paths.enter().append("path");
    paths.exit().remove();

    paths
      .classed("cluster", true)
      .classed("hiv-trace-problematic", function (d) {
        return the_cluster.hxb2_linked && !d.rim;
      })
      .classed("hiv-trace-selected", function (d) {
        return d.rim;
      })
      .attr("d", function (d) {
        return (
          d.rim
            ? d3.svg
              .arc()
              .innerRadius(arc_radius + 2)
              .outerRadius(arc_radius + 5)
            : d3.svg.arc().innerRadius(0).outerRadius(arc_radius)
        )(d);
      })
      .style("fill", function (d, i) {
        return d.rim
          ? self.colorizer["selected"](d.name)
          : the_cluster["gradient"]
            ? "url(#" + the_cluster["gradient"] + ")"
            : cluster_color(the_cluster, d.name);
      })
      .style("stroke-linejoin", function (d, i) {
        return draw_from.length > 1 ? "round" : "";
      })
      .style("display", function (d) {
        if (the_cluster.is_hidden) return "none";
        return null;
      });
  }

  function check_for_predefined_shapes(cat_id) {
    //console.log (cat_id);

    if (cat_id in _networkPresetShapeSchemes) {
      var domain = _.range(
        0,
        graph_data[_networkGraphAttrbuteID][cat_id]["value_range"].length
      );

      return {
        domain: domain,
        range: _.map(domain, function (v) {
          return _networkPresetShapeSchemes[
            cat_id
          ][graph_data[_networkGraphAttrbuteID][cat_id]["value_range"][v]];
        }),
      };
    } else {
      return {
        domain: _.range(
          0,
          graph_data[_networkGraphAttrbuteID][cat_id].dimension
        ),
        range: _networkShapeOrdering,
      };
    }
  }

  self.handle_shape_categorical = function (cat_id) {
    var set_attr = "None";

    ["shapes"].forEach(function (lbl) {
      d3.select(utils.get_ui_element_selector_by_role(lbl))
        .selectAll("li")
        .selectAll("a")
        .attr("style", function (d, i) {
          if (d[1] == cat_id) {
            set_attr = d[0];
            return " font-weight: bold;";
          }
          return null;
        });
      d3.select(utils.get_ui_element_selector_by_role(lbl + "_label")).html(
        __("network_tab")["shape"] +
        ": " +
        set_attr +
        ' <span class="caret"></span>'
      );
    });

    if (cat_id) {
      var domain_range = check_for_predefined_shapes(cat_id);

      var shape_mapper = d3.scale
        .ordinal()
        .domain(domain_range["domain"])
        .range(domain_range["range"]);
      self.node_shaper["id"] = cat_id;
      self.node_shaper["shaper"] = function (d) {
        return shape_mapper(
          graph_data[_networkGraphAttrbuteID][cat_id]["value_map"](
            self.attribute_node_value_by_id(d, cat_id)
          )
        );
      };
      self.node_shaper["category_map"] =
        graph_data[_networkGraphAttrbuteID][cat_id]["value_map"];
    } else {
      self.node_shaper.id = null;
      self.node_shaper.shaper = function () {
        return "circle";
      };
      self.node_shaper["category_map"] = null;
    }
    //console.log (graph_data [_networkGraphAttrbuteID][cat_id]['value_map'], self.node_shaper.domain(), self.node_shaper.range());
    self.draw_attribute_labels();
    self.update(true);
    d3.event.preventDefault();
  };

  self.renderColorPicker = function (cat_id, type) {
    let renderColorPickerCategorical = function (cat_id) {
      // For each unique value, render item.
      let colorizer = self.colorizer;
      let items = _.map(_.filter(self.uniqValues[cat_id]), (d) =>
        colorPicker.colorPickerInput(d, colorizer)
      );

      $("#colorPickerRow").html(items.join(""));

      // Set onchange event for items
      $(".hivtrace-color-picker").change((e) => {
        let color = e.target.value;
        let name = e.target.name;

        // Set color in user-defined colorizer
        if (
          _.isUndefined(
            graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]
          )
        ) {
          graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"] = {};
        }

        graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"][name] =
          color;
        self.handle_attribute_categorical(cat_id);
      });
    };

    let renderColorPickerContinuous = function (cat_id, color_stops) {
      // For each unique value, render item.
      // Min and max range for continuous values
      let items = [
        colorPicker.colorStops("Color Stops", color_stops),
        colorPicker.colorPickerInputContinuous(
          "Min",
          self.uniqValues[cat_id]["min"]
        ),
        colorPicker.colorPickerInputContinuous(
          "Max",
          self.uniqValues[cat_id]["max"]
        ),
      ];

      $("#colorPickerRow").html(items.join(""));

      // Set onchange event for items
      $(".hivtrace-color-picker").change((e) => {
        let color = e.target.value;
        let name = e.target.name;

        // Set color in user-defined colorizer
        if (
          _.isUndefined(
            graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]
          )
        ) {
          graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"] = {};
        }

        // get both for user-defined
        graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"][name] =
          color;
        self.handle_attribute_continuous(cat_id);
      });

      // Set onchange event for items
      $(".hivtrace-color-stops").change((e) => {
        let num = parseInt(e.target.value);
        graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]][
          "color_stops"
        ] = num;

        self._aux_populate_category_menus();
        self.handle_attribute_continuous(cat_id);
        self.update();
      });
    };

    if (type == "categorical") {
      renderColorPickerCategorical(cat_id);
    } else if (type == "continuous") {
      renderColorPickerContinuous(
        cat_id,
        graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]][
        "color_stops"
        ]
      );
    } else {
      console.log("Error: type not recognized");
    }

    if (cat_id != null) {
      $("#colorPickerOption").show();
    } else {
      $("#colorPickerOption").hide();
    }
  };

  self.draw_attribute_labels = function () {
    // draw color legend in the network SVG

    var determine_label_format_cont = function (field_data) {
      if ("label_format" in field_data) {
        return field_data["label_format"];
      }
      if (field_data["type"] == "Date") {
        return _defaultDateViewFormatShort;
      }
      return d3.format(",.4r");
    };

    self.legend_svg.selectAll("g.hiv-trace-legend").remove();

    var offset = 10;

    if (self.legend_caption) {
      self.legend_svg
        .append("g")
        .attr("transform", "translate(0," + offset + ")")
        .classed("hiv-trace-legend", true)
        .append("text")
        .text(self.legend_caption)
        .style("font-weight", "bold");
      offset += 18;
    }

    if (self.edge_legend) {
      self.legend_svg
        .append("g")
        .attr("transform", "translate(0," + offset + ")")
        .classed("hiv-trace-legend", true)
        .append("text")
        .text(self.edge_legend["caption"])
        .style("font-weight", "bold");
      offset += 18;

      _.each(self.edge_legend["types"], function (value, key) {
        self.legend_svg
          .append("g")
          .classed("hiv-trace-legend", true)
          .attr("transform", "translate(20," + offset + ")")
          .append("text")
          .text(key);

        value.call(
          self.legend_svg
            .append("g")
            .classed("hiv-trace-legend", true)
            .attr("transform", "translate(0," + offset + ")")
            .append("line")
            .attr("x1", "0")
            .attr("y1", "-4")
            .attr("x2", "12")
            .attr("y2", "-4")
            .classed("legend", true)
        );

        offset += 18;
      });
    }

    if (self.colorizer["category_id"]) {
      //_.each (self.colorizer["category_map"](null, "map"), function (v){ console.log (v); });

      self.legend_svg
        .append("g")
        .attr("transform", "translate(0," + offset + ")")
        .classed("hiv-trace-legend", true)
        .append("text")
        .text(
          "Color: " +
          self.json[_networkGraphAttrbuteID][self.colorizer["category_id"]]
            .label
        )
        .style("font-weight", "bold");
      offset += 18;

      if (self.colorizer["continuous"]) {
        var anchor_format = determine_label_format_cont(
          graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]]
        );

        var color_stops =
          graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]][
          "color_stops"
          ] || _networkContinuousColorStops;

        var scale =
          graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]][
          "scale"
          ];

        _.each(_.range(color_stops), function (value) {
          var x = scale.invert(value);
          self.legend_svg
            .append("g")
            .classed("hiv-trace-legend", true)
            .attr("transform", "translate(20," + offset + ")")
            .append("text")
            .text(anchor_format(x));
          self.legend_svg
            .append("g")
            .classed("hiv-trace-legend", true)
            .attr("transform", "translate(0," + offset + ")")
            .append("circle")
            .attr("cx", "8")
            .attr("cy", "-4")
            .attr("r", "8")
            .classed("legend", true)
            .style("fill", self.colorizer["category"](x));
          offset += 18;
        });

        if (
          "category_values" in
          graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]]
        ) {
          _.each(
            graph_data[_networkGraphAttrbuteID][self.colorizer["category_id"]][
            "category_values"
            ],
            function (value) {
              self.legend_svg
                .append("g")
                .classed("hiv-trace-legend", true)
                .attr("transform", "translate(20," + offset + ")")
                .append("text")
                .text(value);
              self.legend_svg
                .append("g")
                .classed("hiv-trace-legend", true)
                .attr("transform", "translate(0," + offset + ")")
                .append("circle")
                .attr("cx", "8")
                .attr("cy", "-4")
                .attr("r", "8")
                .classed("legend", true)
                .style("fill", self.colorizer["category"](value));

              offset += 18;
            }
          );
        }

        self.legend_svg
          .append("g")
          .classed("hiv-trace-legend", true)
          .attr("transform", "translate(20," + offset + ")")
          .append("text")
          .text("missing");
        self.legend_svg
          .append("g")
          .classed("hiv-trace-legend", true)
          .attr("transform", "translate(0," + offset + ")")
          .append("circle")
          .attr("cx", "8")
          .attr("cy", "-4")
          .attr("r", "8")
          .classed("legend", true)
          .style("fill", _networkMissingColor);

        offset += 18;
      } else {
        _.each(
          self.colorizer["category_map"](null, "map"),
          function (value, key) {
            self.legend_svg
              .append("g")
              .classed("hiv-trace-legend", true)
              .attr("transform", "translate(20," + offset + ")")
              .append("text")
              .text(key);
            self.legend_svg
              .append("g")
              .classed("hiv-trace-legend", true)
              .attr("transform", "translate(0," + offset + ")")
              .append("circle")
              .attr("cx", "8")
              .attr("cy", "-4")
              .attr("r", "8")
              .classed("legend", true)
              .style("fill", self.colorizer["category"](key));

            offset += 18;
          }
        );
      }
    }

    if (self.node_shaper["id"]) {
      self.legend_svg
        .append("g")
        .attr("transform", "translate(0," + offset + ")")
        .classed("hiv-trace-legend", true)
        .append("text")
        .text(
          "Shape: " +
          self.json[_networkGraphAttrbuteID][self.node_shaper["id"]].label
        )
        .style("font-weight", "bold");
      offset += 18;

      var domain_range = check_for_predefined_shapes(self.node_shaper["id"]);
      var shape_mapper = d3.scale
        .ordinal()
        .domain(domain_range["domain"])
        .range(domain_range["range"]);

      _.each(
        self.node_shaper["category_map"](null, "map"),
        function (value, key) {
          self.legend_svg
            .append("g")
            .classed("hiv-trace-legend", true)
            .attr("transform", "translate(20," + offset + ")")
            .append("text")
            .text(key);

          self.legend_svg
            .append("g")
            .classed("hiv-trace-legend", true)
            .attr("transform", "translate(0," + offset + ")")
            .append("path")
            .attr("transform", "translate(5,-5)")
            .attr("d", misc.symbol(shape_mapper(value)).size(128))
            .classed("legend", true)
            .style("fill", "none");

          offset += 18;
        }
      );
    }

    if (self.colorizer["opacity_id"]) {
      self.legend_svg
        .append("g")
        .attr("transform", "translate(0," + offset + ")")
        .classed("hiv-trace-legend", true)
        .append("text")
        .text(
          __("network_tab")["opacity"] +
          ": " +
          self.json[_networkGraphAttrbuteID][self.colorizer["opacity_id"]]
            .label
        )
        .style("font-weight", "bold");
      offset += 18;

      var anchor_format = determine_label_format_cont(
        graph_data[_networkGraphAttrbuteID][self.colorizer["opacity_id"]]
      );

      var scale =
        graph_data[_networkGraphAttrbuteID][self.colorizer["opacity_id"]][
        "scale"
        ];

      _.each(_.range(_networkContinuousColorStops), function (value) {
        var x = scale.invert(value);
        self.legend_svg
          .append("g")
          .classed("hiv-trace-legend", true)
          .attr("transform", "translate(20," + offset + ")")
          .append("text")
          .text(anchor_format(x));
        self.legend_svg
          .append("g")
          .classed("hiv-trace-legend", true)
          .attr("transform", "translate(0," + offset + ")")
          .append("circle")
          .attr("cx", "8")
          .attr("cy", "-4")
          .attr("r", "8")
          .classed("legend", true)
          .style("fill", "black")
          .style("opacity", self.colorizer["opacity"](x));

        offset += 18;
      });

      self.legend_svg
        .append("g")
        .classed("hiv-trace-legend", true)
        .attr("transform", "translate(20," + offset + ")")
        .append("text")
        .text("missing");
      self.legend_svg
        .append("g")
        .classed("hiv-trace-legend", true)
        .attr("transform", "translate(0," + offset + ")")
        .append("circle")
        .attr("cx", "8")
        .attr("cy", "-4")
        .attr("r", "8")
        .classed("legend", true)
        .style("fill", "black")
        .style("opacity", _networkMissingOpacity);

      offset += 18;
    }
  };

  function compute_cluster_gradient(cluster, cat_id) {
    if (cat_id) {
      var id = self.dom_prefix + "-cluster-gradient-" + self.gradient_id++;
      var gradient = self.network_svg
        .selectAll("defs")
        .append("radialGradient")
        .attr("id", id);
      var values = _.map(cluster.children, function (node) {
        var value = self.attribute_node_value_by_id(node, cat_id);
        return value == _networkMissing ? Infinity : value;
      }).sort(function (a, b) {
        return 0 + a - (0 + b);
      });
      var finite = _.filter(values, function (d) {
        return d < Infinity;
      });
      var infinite = values.length - finite.length;

      if (infinite) {
        gradient
          .append("stop")
          .attr("offset", "0%")
          .attr("stop-color", _networkMissingColor);
        gradient
          .append("stop")
          .attr("offset", "" + (infinite / values.length) * 100 + "%")
          .attr("stop-color", _networkMissingColor);
      }

      _.each(finite, function (value, index) {
        gradient
          .append("stop")
          .attr(
            "offset",
            "" + ((1 + index + infinite) * 100) / values.length + "%"
          )
          .attr("stop-color", self.colorizer["category"](value));
      });
      //gradient.append ("stop").attr ("offset", "100%").attr ("stop-color", self.colorizer['category'] (dom[1]));

      return id;
    }
    return null;
  }

  self.handle_attribute_opacity = function (cat_id) {
    var set_attr = "None";

    ["opacity"].forEach(function (lbl) {
      d3.select(utils.get_ui_element_selector_by_role(lbl))
        .selectAll("li")
        .selectAll("a")
        .attr("style", function (d, i) {
          if (d[1] == cat_id) {
            set_attr = d[0];
            return " font-weight: bold;";
          }
          return null;
        });
      d3.select(utils.get_ui_element_selector_by_role(lbl + "_label")).html(
        __("network_tab")["opacity"] +
        ": " +
        set_attr +
        ' <span class="caret"></span>'
      );
    });

    d3.select(utils.get_ui_element_selector_by_role("opacity_invert"))
      .style("display", set_attr == "None" ? "none" : "inline")
      .classed("btn-active", false)
      .classed("btn-default", true);

    self.colorizer["opacity_id"] = cat_id;
    if (cat_id) {
      var scale = graph_data[_networkGraphAttrbuteID][cat_id]["scale"];
      self.colorizer["opacity_scale"] = d3.scale
        .linear()
        .domain([0, _networkContinuousColorStops - 1])
        .range([0.25, 1]);
      self.colorizer["opacity"] = function (v) {
        if (v == _networkMissing) {
          return _networkMissingOpacity;
        }
        return self.colorizer["opacity_scale"](scale(v));
      };
    } else {
      self.colorizer["opacity"] = null;
      self.colorizer["opacity_scale"] = null;
    }

    self.draw_attribute_labels();
    self.update(true);
    d3.event.preventDefault();
  };

  self.handle_attribute_continuous = function (cat_id) {
    var set_attr = "None";

    render_chord_diagram("aux_svg_holder", null, null);
    render_binned_table("attribute_table", null, null);

    self.network_svg.selectAll("radialGradient").remove();

    self.clusters.forEach(function (the_cluster) {
      delete the_cluster["binned_attributes"];
      delete the_cluster["gradient"];
    });

    [
      ["attributes", false],
      ["attributes_cat", true],
    ].forEach(function (lbl) {
      d3.select(utils.get_ui_element_selector_by_role(lbl[0], lbl[1]))
        .selectAll("li")
        .selectAll("a")
        .attr("style", function (d, i) {
          if (d[1] == cat_id) {
            set_attr = d[0];
            return " font-weight: bold;";
          }
          return null;
        });
      d3.select(
        utils.get_ui_element_selector_by_role(lbl[0] + "_label", lbl[1])
      ).html("Color: " + set_attr + ' <span class="caret"></span>');
    });

    d3.select(utils.get_ui_element_selector_by_role("attributes_invert"))
      .style("display", set_attr == "None" ? "none" : "inline")
      .classed("btn-active", false)
      .classed("btn-default", true);

    if (cat_id) {
      // map values to inverted scale
      let color_stops =
        graph_data[_networkGraphAttrbuteID][cat_id]["color_stops"] ||
        _networkContinuousColorStops;

      if (graph_data[_networkGraphAttrbuteID][cat_id]["color_scale"]) {
        self.colorizer["category"] = graph_data[_networkGraphAttrbuteID][
          cat_id
        ]["color_scale"](graph_data[_networkGraphAttrbuteID][cat_id], self);

        self.uniqValues[cat_id]["min"] =
          self.colorizer["category"](color_stops);
        self.uniqValues[cat_id]["max"] =
          self.colorizer["category"](color_stops);
      } else {
        self.colorizer["category"] = _.wrap(
          d3.scale
            .linear()
            .domain(_.range(_networkContinuousColorStops))
            .range(["#fff7ec", "#7f0000"])
            .interpolate(d3.interpolateRgb),
          function (func, arg) {
            self.uniqValues[cat_id]["min"] = "#fff7ec";
            self.uniqValues[cat_id]["max"] = "#7f0000";

            return func(
              graph_data[_networkGraphAttrbuteID][cat_id]["scale"](arg) *
              (1 / _networkContinuousColorStops)
            );
          }
        );
      }

      if (graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]) {
        // get min and max
        let min =
          graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]["min"] ||
          self.uniqValues[cat_id]["min"];
        let max =
          graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]["max"] ||
          self.uniqValues[cat_id]["max"];

        self.uniqValues[cat_id]["min"] =
          graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]["min"] ||
          self.uniqValues[cat_id]["min"];
        self.uniqValues[cat_id]["max"] =
          graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]["max"] ||
          self.uniqValues[cat_id]["max"];

        self.colorizer["category"] = _.wrap(
          d3.scale
            .linear()
            .domain(_.range(color_stops))
            .range([min, max])
            .interpolate(d3.interpolateRgb),
          function (func, arg) {
            return func(
              graph_data[_networkGraphAttrbuteID][cat_id]["scale"](arg) *
              (1 / color_stops)
            );
          }
        );
      }

      self.colorizer["category_id"] = cat_id;
      self.colorizer["continuous"] = true;
      self.clusters.forEach(function (the_cluster) {
        the_cluster["gradient"] = compute_cluster_gradient(the_cluster, cat_id);
      });

      var points = [];

      _.each(self.edges, function (e) {
        var src = self.attribute_node_value_by_id(
          self.nodes[e.source],
          cat_id,
          true
        ),
          tgt = self.attribute_node_value_by_id(
            self.nodes[e.target],
            cat_id,
            true
          );

        if (src != _networkMissing && tgt != _networkMissing) {
          points.push({
            x: src,
            y: tgt,
            title:
              self.nodes[e.source].id +
              " (" +
              src +
              ") -- " +
              self.nodes[e.target].id +
              " (" +
              tgt +
              ")",
          });
        }
      });
      d3.select(
        utils.get_ui_element_selector_by_role("aux_svg_holder_enclosed", true)
      ).style("display", null);

      scatterPlot.scatterPlot(
        points,
        400,
        400,
        utils.get_ui_element_selector_by_role("aux_svg_holder", true),
        {
          x: "Source",
          y: "Target",
        },
        graph_data[_networkGraphAttrbuteID][cat_id]["type"] == "Date"
      );
    } else {
      self.colorizer["category"] = null;
      self.colorizer["category_id"] = null;
      self.colorizer["continuous"] = false;
      self.colorizer["category_pairwise"] = null;
      self.colorizer["category_map"] = null;
    }

    // Draw color picker for manual override
    self.renderColorPicker(cat_id, "continuous");

    self.draw_attribute_labels();
    self.update(true);

    if (d3.event) {
      d3.event.preventDefault();
    }
  };

  self.handle_attribute_categorical = function (cat_id, skip_update) {
    var set_attr = "None";

    d3.select(utils.get_ui_element_selector_by_role("attributes_invert")).style(
      "display",
      "none"
    );

    self.network_svg.selectAll("radialGradient").remove();

    [
      ["attributes", false],
      ["attributes_cat", true],
    ].forEach(function (lbl) {
      d3.select(utils.get_ui_element_selector_by_role(lbl[0], lbl[1]))
        .selectAll("li")
        .selectAll("a")
        .attr("style", function (d, i) {
          if (d[1] == cat_id) {
            set_attr = d[0];
            return " font-weight: bold;";
          }
          return null;
        });
      d3.select(
        utils.get_ui_element_selector_by_role(lbl[0] + "_label", lbl[1])
      ).html("Color: " + set_attr + ' <span class="caret"></span>');
    });

    self.clusters.forEach(function (the_cluster) {
      delete the_cluster["gradient"];
      the_cluster["binned_attributes"] = stratify(
        attribute_cluster_distribution(the_cluster, cat_id)
      );
    });

    self.colorizer["continuous"] = false;

    //TODO -- if preset color scheme does not exist, create one and always use the logic here.

    if (cat_id) {
      if (cat_id in self.networkColorScheme) {
        let cat_data = graph_data[_networkGraphAttrbuteID][cat_id]["enum"];
        if (cat_data) {
          cat_data = new Set(_.map(cat_data, (d) => d.toLowerCase()));
        }
        var domain = [],
          range = [];
        _.each(self.networkColorScheme[cat_id], function (value, key) {
          if (cat_data) {
            if (!cat_data.has(key.toLowerCase())) {
              return;
            }
          }
          domain.push(key);
          range.push(value);
        });
        self.colorizer["category"] = d3.scale
          .ordinal()
          .domain(domain)
          .range(range);
      } else {
        if (graph_data[_networkGraphAttrbuteID][cat_id]["color_scale"]) {
          self.colorizer["category"] = graph_data[_networkGraphAttrbuteID][
            cat_id
          ]["color_scale"](graph_data[_networkGraphAttrbuteID][cat_id], self);
        } else {
          self.colorizer["category"] = d3.scale
            .ordinal()
            .range(_networkCategorical);

          var extended_range = _.clone(self.colorizer["category"].range());
          extended_range.push(_networkMissingColor);

          self.colorizer["category"].domain(
            _.range(_maximumValuesInCategories + 1)
          );

          self.colorizer["category"].range(extended_range);

          if (graph_data[_networkGraphAttrbuteID][cat_id]["stable-ish order"]) {
            self.colorizer["category"] = _.wrap(
              self.colorizer["category"],
              function (func, arg) {
                if (arg == _networkMissing) {
                  return func(_maximumValuesInCategories);
                }

                const ci = graph_data[_networkGraphAttrbuteID][cat_id];

                if (ci["reduced_value_range"]) {
                  if (!(arg in ci["reduced_value_range"])) {
                    arg = _networkReducedValue;
                  }
                }

                return func(ci["stable-ish order"][arg]);
              }
            );
            //console.log (graph_data[_networkGraphAttrbuteID][cat_id]['stable-ish order']);
          }
        }
      }

      if (graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]) {
        self.colorizer["category"] = _.wrap(
          self.colorizer["category"],
          function (func, arg) {
            if (
              arg in graph_data[_networkGraphAttrbuteID][cat_id]["user-defined"]
            ) {
              return graph_data[_networkGraphAttrbuteID][cat_id][
                "user-defined"
              ][arg];
            } else {
              return func(arg);
            }
          }
        );
      }

      self.colorizer["category_id"] = cat_id;
      self.colorizer["category_map"] =
        graph_data[_networkGraphAttrbuteID][cat_id]["value_map"];

      //console.log (cat_id, self.json[_networkGraphAttrbuteID][cat_id], graph_data[_networkGraphAttrbuteID][cat_id]["value_map"] (null, "lookup"));
      //self.colorizer['category_map'][null] =  graph_data [_networkGraphAttrbuteID][cat_id]['range'];

      //try {
      //console.log (self.colorizer["category_map"]);
      self.colorizer["category_pairwise"] = attribute_pairwise_distribution(
        cat_id,
        self._aux_get_attribute_dimension(cat_id),
        self.colorizer["category_map"]
      );
      //} catch (err) {
      // TODO: there are still lingering issues with this "category_map"
      //}

      render_chord_diagram(
        "aux_svg_holder",
        self.colorizer["category_map"],
        self.colorizer["category_pairwise"]
      );
      render_binned_table(
        "attribute_table",
        self.colorizer["category_map"],
        self.colorizer["category_pairwise"]
      );
    } else {
      self.colorizer["category"] = null;
      self.colorizer["category_id"] = null;
      self.colorizer["category_pairwise"] = null;
      self.colorizer["category_map"] = null;
      render_chord_diagram("aux_svg_holder", null, null);
      render_binned_table("attribute_table", null, null);
    }
    if (self.handle_inline_charts) {
      self.handle_inline_charts();
    }

    self.draw_attribute_labels();
    self.update(true);
    if (d3.event) {
      d3.event.preventDefault();
    }

    // Draw color picker for manual override
    self.renderColorPicker(cat_id, "categorical");
  };

  self.filter_visibility = function () {
    self.clusters.forEach(function (c) {
      c.is_hidden = self.hide_unselected && !c.match_filter;
    });
    self.nodes.forEach(function (n) {
      n.is_hidden = self.hide_unselected && !n.match_filter;
    });
  };

  self.filter = function (conditions, skip_update) {
    var anything_changed = false;

    conditions = _.map(["re", "distance", "date"], function (cnd) {
      return _.map(
        _.filter(conditions, function (v) {
          return v.type == cnd;
        }),
        function (v) {
          return cnd == "distance" ? v : v.value;
        }
      );
    });

    if (conditions[1].length) {
      self.nodes.forEach(function (n) {
        n.length_filter = false;
      });

      _.each(self.edges, function (e) {
        var did_match = _.some(conditions[1], function (d) {
          return d.greater_than ? e.length >= d.value : e.length < d.value;
        });

        if (did_match) {
          self.nodes[e.source].length_filter = true;
          self.nodes[e.target].length_filter = true;
        }
        e.length_filter = did_match;
      });
    } else {
      self.nodes.forEach(function (n) {
        n.length_filter = false;
      });
      self.edges.forEach(function (e) {
        e.length_filter = false;
      });
    }

    if (conditions[2].length) {
      self.nodes.forEach(function (n) {
        var node_T = self.attribute_node_value_by_id(
          n,
          timeDateUtil.getClusterTimeScale()
        );
        n.date_filter = _.some(conditions[2], function (d) {
          return node_T >= d[0] && node_T <= d[1];
        });
      });
    } else {
      self.nodes.forEach(function (n) {
        n.date_filter = false;
      });
    }

    self.clusters.forEach(function (c) {
      c.match_filter = 0;
    });

    self.edges.forEach(function (e) {
      if (e.length_filter) {
        anything_changed = true;
      }
    });

    self.nodes.forEach(function (n) {
      var did_match = _.some(conditions[0], function (regexp) {
        return (
          regexp.test(n.id) ||
          _.some(n[_networkNodeAttributeID], function (attr) {
            return regexp.test(attr);
          })
        );
      });

      did_match = did_match || n.length_filter || n.date_filter;

      if (did_match != n.match_filter) {
        n.match_filter = did_match;
        anything_changed = true;
      }

      if (n.match_filter) {
        n.parent.match_filter += 1;
      }
    });

    if (anything_changed && self.handle_inline_charts) {
      self.handle_inline_charts(function (n) {
        return n.match_filter;
      });
    }

    if (anything_changed && !skip_update) {
      if (self.hide_unselected) {
        self.filter_visibility();
      }

      self.update(true);
    }
  };

  self.is_empty = function () {
    return self.cluster_sizes.length == 0;
  };

  self.display_warning = function (warning_string, is_html) {
    if (network_warning_tag) {
      if (warning_string.length) {
        var warning_box = d3.select(network_warning_tag);
        warning_box.selectAll("div").remove();
        if (is_html) {
          warning_box.append("div").html(warning_string);
        } else {
          warning_box.append("div").text(warning_string);
        }
        warning_box.style("display", "block");
        warning_string = "";
      } else {
        d3.select(network_warning_tag).style("display", "none");
      }
    }
  };

  self.link_generator_function = function (d) {
    var pull = d.pull || 0.0;
    var path;

    if (pull != 0.0) {
      var dist_x = d.target.x - d.source.x;
      var dist_y = d.target.y - d.source.y;
      var pull = pull * Math.sqrt(dist_x * dist_x + dist_y * dist_y);

      var theta = Math.PI / 6; // 18deg additive angle

      var alpha = dist_x ? Math.atan(-dist_y / dist_x) : Math.PI / 2; // angle with the X axis

      if (pull < 0) {
        theta = -theta;
        pull = -pull;
      }

      var dx = Math.cos(theta + alpha) * pull,
        dx2 = Math.cos(theta - alpha) * pull;

      var dy = Math.sin(theta + alpha) * pull,
        dy2 = Math.sin(theta - alpha) * pull;

      var s1, s2;
      if (d.target.x >= d.source.x) {
        s1 = [dx, -dy];
        s2 = [-dx2, -dy2];
      } else {
        s1 = [-dx2, -dy2];
        s2 = [dx, -dy];
      }

      path =
        "M" +
        d.source.x +
        " " +
        d.source.y +
        " C " +
        (d.source.x + s1[0]) +
        " " +
        (d.source.y + s1[1]) +
        ", " +
        (d.target.x + s2[0]) +
        " " +
        (d.target.y + s2[1]) +
        ", " +
        d.target.x +
        " " +
        d.target.y;
    } else {
      path =
        "M" +
        d.source.x +
        " " +
        d.source.y +
        " L " +
        d.target.x +
        " " +
        d.target.y;
    }

    d3.select(this).attr("d", path);
  };

  self.update = function (soft, friction) {
    self.needs_an_update = false;

    if (options && options["extra-graphics"]) {
      options["extra-graphics"].call(null, self, options);
    }

    if (friction) {
      network_layout.friction(friction);
    }
    self.display_warning(self.warning_string, true);

    var rendered_nodes, rendered_clusters, link;

    if (!soft) {
      var draw_me = prepare_data_to_graph();

      network_layout.nodes(draw_me.all).links(draw_me.edges);
      update_network_string(draw_me.nodes.length, draw_me.edges.length);

      var edge_set = {};

      _.each(draw_me.edges, function (d) {
        d.pull = 0.0;
        var tag = "";

        if (d.source < d.target) {
          tag = "" + d.source + "|" + d.target;
        } else {
          tag = "" + d.target + "|" + d.source;
        }
        if (tag in edge_set) {
          edge_set[tag].push(d);
        } else {
          edge_set[tag] = [d];
        }
      });

      _.each(edge_set, function (v) {
        if (v.length > 1) {
          var step = 1 / (v.length - 1);
          _.each(v, function (edge, index) {
            edge.pull = -0.5 + index * step;
          });
        }
      });

      link = self.network_svg
        .selectAll(".link")
        .data(draw_me.edges, function (d) {
          return d.id;
        });

      //link.enter().append("line").classed("link", true);
      link.enter().append("path").classed("link", true);
      link.exit().remove();

      link
        .classed("removed", function (d) {
          return self.highlight_unsuppored_edges && d.removed;
        })
        .classed("unsupported", function (d) {
          return (
            self.highlight_unsuppored_edges &&
            "support" in d &&
            d["support"] > 0.05
          );
        })
        .classed("core-link", function (d) {
          //console.log (d["length"] <= self.core_link_length);
          return d["length"] <= self.core_link_length;
          //return false;
        });

      link
        .on("mouseover", edge_pop_on)
        .on("mouseout", edge_pop_off)
        .filter(function (d) {
          return d.directed;
        })
        .attr("marker-end", "url(#" + self.dom_prefix + "_arrowhead)");

      rendered_nodes = self.network_svg
        .selectAll(".node")
        .data(draw_me.nodes, function (d) {
          return d.id;
        });

      rendered_nodes.exit().remove();

      /*rendered_nodes.enter().each (function (d) {
        this.append ("path");
      });*/

      rendered_nodes.enter().append("g").append("path");

      rendered_clusters = self.network_svg.selectAll(".cluster-group").data(
        draw_me.clusters.map(function (d) {
          return d;
        }),
        function (d) {
          return d.cluster_id;
        }
      );

      rendered_clusters.exit().remove();
      rendered_clusters
        .enter()
        .append("g")
        .attr("class", "cluster-group")
        .attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        })
        .on("click", handle_cluster_click)
        .on("mouseover", cluster_pop_on)
        .on("mouseout", cluster_pop_off)
        .call(network_layout.drag().on("dragstart", cluster_pop_off));

      self.draw_cluster_table(
        self.extra_cluster_table_columns,
        self.cluster_table
      );

      if (
        self._is_CDC_ &&
        !(
          options &&
          options["no-subclusters"] &&
          options["no-subcluster-compute"]
        )
      ) {
        // compute priority clusters
        self.annotate_priority_clusters(timeDateUtil._networkCDCDateField, 36, 12);

        try {
          if (self.isPrimaryGraph) {
            self.priority_groups_compute_node_membership();
          }
        } catch (err) {
          console.log(err);
        }
      }

      if (
        self._is_CDC_ &&
        !(options && options["no-subclusters"]) &&
        options &&
        options["no-subcluster-compute"]
      ) {
        // use precomputed subclusters

        _.each(self.clusters, function (cluster_nodes, cluster_index) {
          /** extract subclusters; all nodes at given threshold */
          /** Sub-Cluster: all nodes connected at 0.005 subs/site; there can be multiple sub-clusters per cluster */
          let subclusters = _.groupBy(
            cluster_nodes.children,
            (n) => n.subcluster_id
          );
          subclusters = _.values(
            _.reject(subclusters, (v, k) => {
              return k == "undefined";
            })
          );

          /** sort subclusters by oldest node */
          _.each(subclusters, function (c, i) {
            c.sort(oldest_nodes_first);
          });

          subclusters.sort(function (c1, c2) {
            return oldest_nodes_first(c1[0], c2[0]);
          });

          subclusters = _.map(subclusters, function (c, i) {
            let parent_cluster_id = c[0].parent_cluster_id;
            let subcluster_id = c[0].subcluster_id;
            let label = c[0].subcluster_label;

            var edges = [];

            var meta_data = _.filter(
              hivtrace_cluster_depthwise_traversal(
                cluster_nodes.Nodes,
                cluster_nodes.Edges,
                null,
                edges
              ),
              function (cc) {
                return cc.length > 1;
              }
            );

            edges = _.filter(edges, function (es) {
              return es.length > 1;
            });

            var stats =
              self.json.subcluster_summary_stats[parent_cluster_id][
              subcluster_id
              ];

            return {
              children: _.clone(c),
              parent_cluster: cluster_nodes,
              cluster_id: label,
              subcluster_label: subcluster_id,
              recent_nodes: stats.recent_nodes,
              priority_score: stats.priority_score,
              distances: helpers.describe_vector(
                _.map(edges[i], function (e) {
                  return e.length;
                })
              ),
            };
          });

          _.each(subclusters, function (c) {
            _compute_cluster_degrees(c);
          });

          cluster_nodes.subclusters = subclusters || [];

          // add additional information
          let stats =
            self.json.subcluster_summary_stats[cluster_nodes.cluster_id];
          cluster_nodes.recent_nodes = _.map(
            _.values(stats),
            (d) => d.recent_nodes[0] || 0
          );
          cluster_nodes.priority_score = _.map(
            _.values(stats),
            (d) => d.priority_score[0] || 0
          );
        });
      }

      if (self.subcluster_table) {
        /*
            SLKP 20200727 scan subclusters and identify which, if any
            will need to be automatically created as priority sets
        */

        // draw subcluster tables

        self.draw_cluster_table(
          self.extra_subcluster_table_columns,
          self.subcluster_table,
          {
            "no-clusters": true,
            subclusters: true,
            headers: function (headers) {
              headers[0][0].value = "Subcluster ID";
              headers[0][0].help = "Unique subcluster ID";
              headers[0][2].help = "Number of total cases in the subcluster";
            },
          }
        );
      }
      if (self._is_CDC_) {
        self.draw_extended_node_table();
      } else {
        self.draw_node_table(self.extra_node_table_columns);
      }
    } else {
      rendered_nodes = self.network_svg.selectAll(".node");
      rendered_clusters = self.network_svg.selectAll(".cluster-group");
      link = self.network_svg.selectAll(".link");
      update_network_string(rendered_nodes.size(), link.size());
    }

    rendered_nodes.each(function (d) {
      draw_a_node(this, d);
    });

    rendered_clusters.each(function (d) {
      draw_a_cluster(this, d);
    });

    link.style("opacity", function (d) {
      return Math.max(node_opacity(d.target), node_opacity(d.source));
    });

    if (self.additional_edge_styler) {
      link.each(function (d) {
        self.additional_edge_styler(this, d, self);
      });
    }

    link
      .style("display", function (d) {
        if (d.target.is_hidden || d.source.is_hidden || d.is_hidden) {
          return "none";
        }
        return null;
      })
      .classed("selected_object", function (d) {
        return d.ref.length_filter && !self.hide_unselected;
      });

    if (!soft) {
      currently_displayed_objects =
        rendered_clusters[0].length + rendered_nodes[0].length;

      network_layout.on("tick", function () {
        var sizes = network_layout.size();

        rendered_nodes.attr("transform", function (d) {
          // Defalut values (just to keep nodes in the svg container rectangle).
          var xBoundLower = 10;
          var xBoundUpper = sizes[0] - 10;
          var yBoundLower = 10;
          var yBoundUpper = sizes[1] - 10;

          if (self.showing_on_map) {
            const allowed_offset_from_center_of_country = 15;
            // If the country is in the list that we have, override the default values for the bounds.
            var country_code = self._get_node_country(d);

            if (country_code in self.countryCentersObject) {
              let center = self.countryCentersObject[country_code].countryXY;

              xBoundLower = center[0] - allowed_offset_from_center_of_country;
              xBoundUpper = center[0] + allowed_offset_from_center_of_country;
              yBoundLower = center[1] - allowed_offset_from_center_of_country;
              yBoundUpper = center[1] + allowed_offset_from_center_of_country;
            }
          }

          return (
            "translate(" +
            (d.x = Math.max(xBoundLower, Math.min(xBoundUpper, d.x))) +
            "," +
            (d.y = Math.max(yBoundLower, Math.min(yBoundUpper, d.y))) +
            ")"
          );
        });
        rendered_clusters.attr("transform", function (d) {
          return (
            "translate(" +
            (d.x = Math.max(
              d.rendered_size,
              Math.min(sizes[0] - d.rendered_size, d.x)
            )) +
            "," +
            (d.y = Math.max(
              d.rendered_size,
              Math.min(sizes[1] - d.rendered_size, d.y)
            )) +
            ")"
          );
        });

        link.each(self.link_generator_function);
      });

      network_layout.start();
    } else {
      link.each(self.link_generator_function);
    }
  };

  function tick() {
    var sizes = network_layout.size();

    node
      .attr("cx", function (d) {
        return (d.x = Math.max(10, Math.min(sizes[0] - 10, d.x)));
      })
      .attr("cy", function (d) {
        return (d.y = Math.max(10, Math.min(sizes[1] - 10, d.y)));
      });

    link
      .attr("x1", function (d) {
        return d.source.x;
      })
      .attr("y1", function (d) {
        return d.source.y;
      })
      .attr("x2", function (d) {
        return d.target.x;
      })
      .attr("y2", function (d) {
        return d.target.y;
      });
  }

  /*------------ Node Methods ---------------*/
  function compute_node_degrees(nodes, edges) {
    for (var n in nodes) {
      nodes[n].degree = 0;
    }

    for (var e in edges) {
      nodes[edges[e].source].degree++;
      nodes[edges[e].target].degree++;
    }
  }

  self.attribute_node_value_by_id = function (d, id, number) {
    try {
      if (_networkNodeAttributeID in d && id) {
        if (id in d[_networkNodeAttributeID]) {
          var v;

          if (self.json[_networkGraphAttrbuteID][id].volatile) {
            v = self.json[_networkGraphAttrbuteID][id].map(d, self);
          } else {
            v = d[_networkNodeAttributeID][id];
          }

          if (_.isString(v)) {
            if (v.length == 0) {
              return _networkMissing;
            } else {
              if (number) {
                v = +v;
                return _.isNaN(v) ? _networkMissing : v;
              }
            }
          }
          return v;
        }
      }
    } catch (e) {
      console.log("self.attribute_node_value_by_id", e, d, id, number);
    }
    return _networkMissing;
  };

  function inject_attribute_node_value_by_id(d, id, value) {
    if (_networkNodeAttributeID in d && id) {
      d[_networkNodeAttributeID][id] = value;
    }
  }

  self.has_network_attribute = function (key) {
    if (_networkGraphAttrbuteID in self.json) {
      return key in self.json[_networkGraphAttrbuteID];
    }
    return false;
  };

  self.inject_attribute_description = function (key, d) {
    if (_networkGraphAttrbuteID in self.json) {
      var new_attr = {};
      new_attr[key] = d;
      _.extend(self.json[_networkGraphAttrbuteID], new_attr);
      //self.json[_networkGraphAttrbuteID][key] = _.clone (d);
    }
  };

  function node_size(d) {
    if (self.showing_on_map) {
      return 50;
    }
    var r = 5 + Math.sqrt(d.degree); //return (d.match_filter ? 10 : 4)*r*r;
    return 4 * r * r;
  }

  function node_color(d) {
    /*if (d.match_filter) {
        return "white";
    }*/

    if (self.colorizer["category_id"]) {
      var v = self.attribute_node_value_by_id(d, self.colorizer["category_id"]);
      if (self.colorizer["continuous"]) {
        if (v == _networkMissing) {
          return _networkMissingColor;
        }
        //console.log (v, self.colorizer['category'](v));
      }
      return self.colorizer["category"](v);
    }
    return d.hxb2_linked ? "black" : d.is_lanl ? "red" : "gray";
  }

  function node_opacity(d) {
    if (self.colorizer["opacity"]) {
      return self.colorizer["opacity"](
        self.attribute_node_value_by_id(d, self.colorizer["opacity_id"], true)
      );
    }
    return 1;
  }

  function cluster_color(d, type) {
    if (d["binned_attributes"]) {
      return self.colorizer["category"](type);
    }
    return "#bdbdbd";
  }

  function hxb2_node_color(d) {
    return "black";
  }

  function node_info_string(n) {
    var str;

    if (!self._is_CDC_) {
      str =
        "Degree <em>" +
        n.degree +
        "</em><br>Clustering coefficient <em> " +
        misc.format_value(n.lcc, _defaultFloatFormat) +
        "</em>";
    } else {
      str = "# links <em>" + n.degree + "</em>";
    }

    _.each(
      _.union(self._additional_node_pop_fields, [
        self.colorizer["category_id"],
        self.node_shaper["id"],
        self.colorizer["opacity_id"],
      ]),
      function (key) {
        if (key) {
          if (key in graph_data[_networkGraphAttrbuteID]) {
            var attribute = self.attribute_node_value_by_id(n, key);

            if (graph_data[_networkGraphAttrbuteID][key]["type"] == "Date") {
              try {
                attribute = _defaultDateViewFormat(attribute);
              } catch (err) { }
            }
            if (attribute) {
              str +=
                "<br>" +
                graph_data[_networkGraphAttrbuteID][key].label +
                " <em>" +
                attribute +
                "</em>";
            }
          }
        }
      }
    );

    return str;
  }

  function edge_info_string(n) {
    var str = "Length <em>" + _defaultFloatFormat(n.length) + "</em>";
    if ("support" in n) {
      str +=
        "<br>Worst triangle-based support (p): <em>" +
        _defaultFloatFormat(n.support) +
        "</em>";
    }

    var attribute = self.attribute_node_value_by_id(
      n,
      self.colorizer["category_id"]
    );

    return str;
  }

  function node_pop_on(d) {
    if (d3.event.defaultPrevented) return;

    toggle_tooltip(
      this,
      true,
      (self._is_CDC_ ? "Individual " : "Node ") + d.id,
      node_info_string(d),
      self.container
    );
  }

  function node_pop_off(d) {
    if (d3.event.defaultPrevented) return;

    toggle_tooltip(this, false);
  }

  function edge_pop_on(e) {
    toggle_tooltip(
      this,
      true,
      e.source.id + " - " + e.target.id,
      edge_info_string(e),
      self.container
    );
  }

  function edge_pop_off(d) {
    toggle_tooltip(this, false);
  }

  /*------------ Cluster Methods ---------------*/

  /* Creates a new object that groups nodes by cluster
   * @param nodes
   * @returns clusters
   */
  function get_all_clusters(nodes) {
    var by_cluster = _.groupBy(nodes, "cluster");
    return by_cluster;
  }

  function compute_cluster_centroids(clusters) {
    for (var c in clusters) {
      var cls = clusters[c];
      cls.x = 0;
      cls.y = 0;
      if (_.has(cls, "children")) {
        cls.children.forEach(function (x) {
          cls.x += x.x;
          cls.y += x.y;
        });
        cls.x /= cls.children.length;
        cls.y /= cls.children.length;
      }
    }
  }

  function collapse_cluster(x, keep_in_q) {
    self.needs_an_update = true;
    x.collapsed = true;
    currently_displayed_objects -= self.cluster_sizes[x.cluster_id - 1] - 1;
    if (!keep_in_q) {
      var idx = open_cluster_queue.indexOf(x.cluster_id);
      if (idx >= 0) {
        open_cluster_queue.splice(idx, 1);
      }
    }
    compute_cluster_centroids([x]);
    return x.children.length;
  }

  function expand_cluster(x, copy_coord) {
    self.needs_an_update = true;
    x.collapsed = false;
    currently_displayed_objects += self.cluster_sizes[x.cluster_id - 1] - 1;
    open_cluster_queue.push(x.cluster_id);

    if (copy_coord) {
      x.children.forEach(function (n) {
        n.x = x.x + (Math.random() - 0.5) * x.children.length;
        n.y = x.y + (Math.random() - 0.5) * x.children.length;
      });
    } else {
      x.children.forEach(function (n) {
        n.x = self.width * 0.25 + (Math.random() - 0.5) * x.children.length;
        n.y = 0.25 * self.height + (Math.random() - 0.5) * x.children.length;
      });
    }
  }

  function render_binned_table(id, the_map, matrix) {
    var the_table = d3.select(utils.get_ui_element_selector_by_role(id, true));
    if (the_table.empty()) {
      return;
    }

    the_table.selectAll("thead").remove();
    the_table.selectAll("tbody").remove();

    d3.select(
      utils.get_ui_element_selector_by_role(id + "_enclosed", true)
    ).style("display", matrix ? null : "none");

    if (matrix) {
      var fill = self.colorizer["category"];
      var lookup = the_map(null, "lookup");

      var headers = the_table
        .append("thead")
        .append("tr")
        .selectAll("th")
        .data(
          [""].concat(
            matrix[0].map(function (d, i) {
              return lookup[i];
            })
          )
        );

      headers.enter().append("th");
      headers
        .html(function (d) {
          return "<span>&nbsp;" + d + "</span>";
        })
        .each(function (d, i) {
          if (i) {
            d3.select(this)
              .insert("i", ":first-child")
              .classed("fa fa-circle", true)
              .style("color", function () {
                return fill(d);
              });
          }
        });

      if (self.show_percent_in_pairwise_table) {
        var sum = _.map(matrix, function (row) {
          return _.reduce(
            row,
            function (p, c) {
              return p + c;
            },
            0
          );
        });

        matrix = _.map(matrix, function (row, row_index) {
          return _.map(row, function (c) {
            return c / sum[row_index];
          });
        });
      }

      var rows = the_table
        .append("tbody")
        .selectAll("tr")
        .data(
          matrix.map(function (d, i) {
            return [lookup[i]].concat(d);
          })
        );

      rows.enter().append("tr");
      rows
        .selectAll("td")
        .data(function (d) {
          return d;
        })
        .enter()
        .append("td")
        .html(function (d, i) {
          return i == 0
            ? "<span>&nbsp;" + d + "</span>"
            : self.show_percent_in_pairwise_table
              ? _defaultPercentFormat(d)
              : d;
        })
        .each(function (d, i) {
          if (i == 0) {
            d3.select(this)
              .insert("i", ":first-child")
              .classed("fa fa-circle", true)
              .style("color", function () {
                return fill(d);
              });
          }
        });
    }
  }

  function render_chord_diagram(id, the_map, matrix) {
    var container = d3.select(utils.get_ui_element_selector_by_role(id, true));

    if (container.empty()) {
      return;
    }

    container.selectAll("svg").remove();

    d3.select(
      utils.get_ui_element_selector_by_role(id + "_enclosed", true)
    ).style("display", matrix ? null : "none");

    if (matrix) {
      var lookup = the_map(null, "lookup");

      var svg = container.append("svg");

      var chord = d3.layout
        .chord()
        .padding(0.05)
        .sortSubgroups(d3.descending)
        .matrix(matrix);

      var text_offset = 20,
        width = 450,
        height = 450,
        innerRadius = Math.min(width, height - text_offset) * 0.41,
        outerRadius = innerRadius * 1.1;

      var fill = self.colorizer["category"],
        font_size = 12;

      var text_label = svg
        .append("g")
        .attr(
          "transform",
          "translate(" + width / 2 + "," + (height - text_offset) + ")"
        )
        .append("text")
        .attr("text-anchor", "middle")
        .attr("font-size", font_size)
        .text("");

      svg = svg
        .attr("width", width)
        .attr("height", height - text_offset)
        .append("g")
        .attr(
          "transform",
          "translate(" + width / 2 + "," + (height - text_offset) / 2 + ")"
        );

      svg
        .append("g")
        .selectAll("path")
        .data(chord.groups)
        .enter()
        .append("path")
        .style("fill", function (d) {
          return fill(lookup[d.index]);
        })
        .style("stroke", function (d) {
          return fill(lookup[d.index]);
        })
        .attr(
          "d",
          d3.svg.arc().innerRadius(innerRadius).outerRadius(outerRadius)
        )
        .on("mouseover", fade(0.1, true))
        .on("mouseout", fade(1, false));

      svg
        .append("g")
        .attr("class", "chord")
        .selectAll("path")
        .data(chord.chords)
        .enter()
        .append("path")
        .attr("d", d3.svg.chord().radius(innerRadius))
        .style("fill", function (d) {
          return fill(d.target.index);
        })
        .style("opacity", 1);

      // Returns an event handler for fading a given chord group.
      function fade(opacity, t) {
        return function (g, i) {
          text_label.text(t ? lookup[i] : "");
          svg
            .selectAll(".chord path")
            .filter(function (d) {
              return d.source.index != i && d.target.index != i;
            })
            .transition()
            .style("opacity", opacity);
        };
      }
    }
  }

  function attribute_pairwise_distribution(id, dim, the_map, only_expanded) {
    var scan_from = only_expanded ? draw_me.edges : self.edges;
    var the_matrix = [];
    for (var i = 0; i < dim; i += 1) {
      the_matrix.push([]);
      for (var j = 0; j < dim; j += 1) {
        the_matrix[i].push(0);
      }
    }

    _.each(scan_from, function (edge) {
      //console.log (self.attribute_node_value_by_id(self.nodes[edge.source], id), self.attribute_node_value_by_id(self.nodes[edge.target], id));
      the_matrix[
        the_map(self.attribute_node_value_by_id(self.nodes[edge.source], id))
      ][
        the_map(self.attribute_node_value_by_id(self.nodes[edge.target], id))
      ] += 1;
    });
    // check if there are null values

    var haz_null = the_matrix.some(function (d, i) {
      if (i == dim - 1) {
        return d.some(function (d2) {
          return d2 > 0;
        });
      }
      return d[dim - 1] > 0;
    });
    if (!haz_null) {
      the_matrix.pop();
      for (i = 0; i < dim - 1; i += 1) {
        the_matrix[i].pop();
      }
    }

    // symmetrize the matrix

    dim = the_matrix.length;

    for (i = 0; i < dim; i += 1) {
      for (j = i; j < dim; j += 1) {
        the_matrix[i][j] += the_matrix[j][i];
        the_matrix[j][i] = the_matrix[i][j];
      }
    }

    return the_matrix;
  }

  self._aux_populate_category_fields = function (d, k) {
    d["raw_attribute_key"] = k;
    if (!("label" in d)) {
      d["label"] = k;
    }
    d.discrete = false;
    if (d["type"] == "String") {
      d.discrete = true;
      d["value_range"] = _.keys(
        _.countBy(graph_data.Nodes, function (nd) {
          return self.attribute_node_value_by_id(nd, k);
        })
      );
      d["dimension"] = d["value_range"].length;
    } else {
      if ("enum" in d) {
        d.discrete = true;
        d["value_range"] = _.clone(d["enum"]);
        if (!(_networkMissing in d["value_range"])) {
          d["value_range"].push(_networkMissing);
        }
        d["dimension"] = d["value_range"].length;
        d["no-sort"] = true;
      }
    }
    return d;
  };

  self._aux_get_attribute_dimension = function (cat_id) {
    if (cat_id in graph_data[_networkGraphAttrbuteID]) {
      const cinfo = graph_data[_networkGraphAttrbuteID][cat_id];
      if ("reduced_value_range" in cinfo) {
        return _.size(cinfo["reduced_value_range"]);
      }
      return cinfo.dimension;
    }
    return 0;
  };

  self._aux_process_category_values = function (d) {
    var values,
      reduced_range = null;

    delete d["reduced_value_range"];
    if (d["no-sort"]) {
      values = d["value_range"];
    } else {
      if (d["type"] == "String") {
        values = d["value_range"].sort();

        if (d.dimension > _maximumValuesInCategories) {
          let compressed_values = _.chain(self.nodes)
            .countBy((node) => {
              return self.attribute_node_value_by_id(
                node,
                d["raw_attribute_key"]
              );
            })
            .pairs()
            .sortBy((d) => -d[1])
            .value();

          reduced_range = [];
          let i = 0;
          while (
            reduced_range.length < _maximumValuesInCategories - 1 &&
            i < compressed_values.length
          ) {
            if (compressed_values[i][0] != _networkMissing) {
              reduced_range.push(compressed_values[i][0]);
            }
            i++;
          }
          reduced_range = reduced_range.sort();
          reduced_range.push(_networkReducedValue);
        }

        var string_hash = function (str) {
          var hash = 5801;
          for (var ci = 0; ci < str.length; ci++) {
            var charCode = str.charCodeAt(ci);
            hash = (hash << (5 + hash)) + charCode;
          }
          return hash;
        };

        let use_these_values = reduced_range || values;

        var hashed = _.map(use_these_values, string_hash);
        var available_keys = {};
        var reindexed = {};

        for (var i = 0; i < _maximumValuesInCategories; i++) {
          available_keys[i] = true;
        }

        _.each(hashed, function (value, index) {
          if (value < 0) {
            value = -value;
          }

          var first_try = value % _maximumValuesInCategories;
          if (first_try in available_keys) {
            reindexed[use_these_values[index]] = first_try;
            delete available_keys[first_try];
            return;
          }

          var second_try =
            Math.floor(value / _maximumValuesInCategories) %
            _maximumValuesInCategories;
          if (second_try in available_keys) {
            reindexed[use_these_values[index]] = second_try;
            delete available_keys[second_try];
            return;
          }

          var last_resort = parseInt(_.keys(available_keys).sort()[0]);
          reindexed[use_these_values[index]] = last_resort;
          delete available_keys[last_resort];
        });

        d["stable-ish order"] = reindexed;
      }
    }

    var map = new Object();

    if (reduced_range) {
      let rrl = _.object(_.map(_.pairs(reduced_range), (d) => [d[1], d[0]]));

      _.each(values, function (d2, i) {
        if (d2 in rrl) {
          map[d2] = rrl[d2];
        } else {
          map[d2] = rrl[_networkReducedValue];
        }
      });

      d["reduced_value_range"] = rrl;
      //console.log (rrl, map);
      d["value_map"] = function (v, key) {
        if (key) {
          //console.log (key, map);
          return key == "lookup" ? _.invert(rrl) : rrl;
        }
        return map[v];
      };
    } else {
      _.each(values, function (d2, i) {
        map[d2] = i;
      });
      d["value_map"] = function (v, key) {
        if (key) {
          //console.log (key, map);
          return key == "lookup" ? _.invert(map) : map;
        }
        return map[v];
      };
    }

    return d;
  };

  function attribute_cluster_distribution(the_cluster, attribute_id) {
    if (attribute_id && the_cluster) {
      return the_cluster.children.map(function (d) {
        return self.attribute_node_value_by_id(d, attribute_id);
      });
    }
    return null;
  }

  function cluster_info_string(id) {
    var the_cluster = self.clusters[self.cluster_mapping[id]],
      attr_info = the_cluster["binned_attributes"];

    var str;

    if (self._is_CDC_) {
      str =
        "<strong>" +
        self.cluster_sizes[id - 1] +
        "</strong> individuals." +
        "<br>Mean links/individual <em> = " +
        _defaultFloatFormat(the_cluster.degrees["mean"]) +
        "</em>" +
        "<br>Max links/individual <em> = " +
        the_cluster.degrees["max"] +
        "</em>";
    } else {
      str =
        "<strong>" +
        self.cluster_sizes[id - 1] +
        "</strong> nodes." +
        "<br>Mean degree <em>" +
        _defaultFloatFormat(the_cluster.degrees["mean"]) +
        "</em>" +
        "<br>Max degree <em>" +
        the_cluster.degrees["max"] +
        "</em>" +
        "<br>Clustering coefficient <em> " +
        misc.format_value(the_cluster.cc, _defaultFloatFormat) +
        "</em>";
    }

    if (attr_info) {
      attr_info.forEach(function (d) {
        str += "<br>" + d[0] + " <em>" + d[1] + "</em>";
      });
    }

    return str;
  }

  function cluster_pop_on(d) {
    toggle_tooltip(
      this,
      true,
      "Cluster " + d.cluster_id,
      cluster_info_string(d.cluster_id),
      self.container
    );
  }

  function cluster_pop_off(d) {
    toggle_tooltip(this, false);
  }

  self.expand_cluster_handler = function (d, do_update, move_out) {
    if (d.collapsed) {
      var new_nodes = self.cluster_sizes[d.cluster_id - 1] - 1;

      if (new_nodes > max_points_to_render) {
        self.warning_string = "This cluster is too large to be displayed";
      } else {
        var leftover =
          new_nodes + currently_displayed_objects - max_points_to_render;
        if (leftover > 0) {
          var k = 0;
          for (; k < open_cluster_queue.length && leftover > 0; k++) {
            var cluster =
              self.clusters[self.cluster_mapping[open_cluster_queue[k]]];
            leftover -= cluster.children.length - 1;
            collapse_cluster(cluster, true);
          }
          if (k || open_cluster_queue.length) {
            open_cluster_queue.splice(0, k);
          }
        }

        if (leftover <= 0) {
          expand_cluster(d, !move_out);
        }
      }

      if (do_update) {
        self.update(false, 0.6);
      }
    }
    return "";
  };

  function show_sequences_in_cluster(d) {
    var sequences = new Object();
    _.each(
      _extract_single_cluster(
        self.clusters[self.cluster_mapping[d.cluster]].children,
        null,
        true
      ).Edges,
      function (e) {
        _.each(e.sequences, function (s) {
          if (!(s in sequences)) {
            sequences[s] = 1;
          }
        });
      }
    );
    //console.log (_.keys(sequences));
  }

  function _compute_cluster_degrees(d) {
    var degrees = d.children.map(function (c) {
      return c.degree;
    });
    degrees.sort(d3.ascending);
    d.degrees = helpers.describe_vector(degrees);
  }

  function handle_node_label(container, node) {
    node.show_label = !node.show_label;
    self.update(true);
  }

  function collapse_cluster_handler(d, do_update) {
    collapse_cluster(self.clusters[self.cluster_mapping[d.cluster]]);
    if (do_update) {
      self.update(false, 0.4);
    }
  }

  function center_cluster_handler(d) {
    d.x = self.width / 2;
    d.y = self.height / 2;
    self.update(false, 0.4);
  }

  function cluster_box_size(c) {
    return 8 * Math.sqrt(c.children.length);
  }

  self.extract_network_time_series = function (
    time_attr,
    other_attributes,
    node_filter
  ) {
    var use_these_nodes = node_filter
      ? _.filter(self.nodes, node_filter)
      : self.nodes;

    var result = _.map(use_these_nodes, function (node) {
      var series = {
        time: self.attribute_node_value_by_id(node, time_attr),
      };
      if (other_attributes) {
        _.each(other_attributes, function (attr, key) {
          series[attr] = self.attribute_node_value_by_id(node, key);
        });
      }
      return series;
    });

    result.sort(function (a, b) {
      if (a.time < b.time) return -1;
      if (a.time == b.time) return 0;
      return 1;
    });

    return result;
  };

  self.expand_some_clusters = function (subset) {
    subset = subset || self.clusters;
    subset.forEach(function (x) {
      if (!x.is_hidden) {
        self.expand_cluster_handler(x, false);
      }
    });
    self.update();
  };

  self.select_some_clusters = function (condition) {
    return self.clusters.filter(function (c, i) {
      return _.some(c.children, function (n) {
        return condition(n);
      });
    });
  };

  self.collapse_some_clusters = function (subset) {
    subset = subset || self.clusters;
    subset.forEach(function (x) {
      if (!x.collapsed) collapse_cluster(x);
    });
    self.update();
  };

  self.toggle_hxb2 = function () {
    self.hide_hxb2 = !self.hide_hxb2;
    self.update();
  };

  self.toggle_diff = function () {
    self.showing_diff = !self.showing_diff;
    if (self.showing_diff) {
      self.cluster_filtering_functions["new"] = self.filter_if_added;
    } else {
      delete self.cluster_filtering_functions["new"];
    }
    self.update();
  };

  self.toggle_highlight_unsupported_edges = function () {
    self.highlight_unsuppored_edges = !self.highlight_unsuppored_edges;
    self.update();
  };

  self.toggle_time_filter = function () {
    if (self.using_time_filter) {
      self.using_time_filter = null;
    } else {
      self.using_time_filter = timeDateUtil.getCurrentDate();
      self.using_time_filter.setFullYear(
        self.using_time_filter.getFullYear() - 1
      );
    }

    if (self.using_time_filter) {
      self.cluster_filtering_functions["recent"] = self.filter_time_period;
    } else {
      delete self.cluster_filtering_functions["recent"];
    }
    self.update();
  };

  function stratify(array) {
    if (array) {
      var dict = {},
        stratified = [];

      array.forEach(function (d) {
        if (d in dict) {
          dict[d] += 1;
        } else {
          dict[d] = 1;
        }
      });
      for (var uv in dict) {
        stratified.push([uv, dict[uv]]);
      }
      return stratified.sort(function (a, b) {
        return a[0] - b[0];
      });
    }
    return array;
  }

  self.is_edge_injected = function (e) {
    //console.log (e, "edge_type" in e);
    return "edge_type" in e;
  };

  self._distance_gate_options = function (threshold) {
    threshold = threshold || 0.005;

    edge_typer = (e, edge_types, T) => {
      return edge_types[e.length <= T ? 0 : 1];
    };

    return {
      "edge-styler": function (element, d, network) {
        var e_type = edge_typer(
          d,
          network.edge_types,
          network.edge_cluster_threshold
        );
        if (e_type != "") {
          d3.select(element).style(
            "stroke",
            network._edge_colorizer(
              edge_typer(d, network.edge_types, network.edge_cluster_threshold)
            )
          ); //.style ("stroke-dasharray", network._edge_dasher (d["edge_type"]));
        }
        d.is_hidden = !network.shown_types[e_type];
        d3.select(element).style("stroke-width", "4px");
      },

      init_code: function (network) {
        function style_edge(type) {
          this.style("stroke-width", "5px");
          if (type.length) {
            this.style("stroke", network._edge_colorizer(type)); //.style ("stroke-dasharray", network._edge_dasher (type));
          } else {
            this.classed("link", true);
            var def_color = this.style("stroke");
            this.classed("link", null);
            this.style("stroke", def_color);
          }
        }

        network.update_cluster_threshold_display = (T) => {
          network.edge_cluster_threshold = T;
          network.edge_types = [
            "≤" + network.edge_cluster_threshold,
            ">" + network.edge_cluster_threshold,
          ];

          network._edge_colorizer = d3.scale
            .ordinal()
            .range(_networkEdgeColorBase)
            .domain(network.edge_types);
          //network._edge_dasher   = _edge_dasher;
          network.shown_types = _.object(
            _.map(network.edge_types, (d) => [d, 1])
          );
          network.edge_legend = {
            caption: "Links by distance",
            types: {},
          };

          _.each(network.shown_types, function (ignore, t) {
            if (t.length) {
              network.edge_legend.types[t] = _.partial(style_edge, t);
            }
          });
        };

        network.update_cluster_threshold_display(threshold);
      },

      extra_menu: {
        title: "Additional options",
        items: [
          [
            function (network, item) {
              //console.log(network.edge_cluster_threshold);
              var enclosure = item.append("div").classed("form-group", true);
              var label = enclosure
                .append("label")
                .text("Genetic distance threshold ")
                .classed("control-label", true);
              var distance = enclosure
                .append("input")
                .classed("form-control", true)
                .attr("value", "" + network.edge_cluster_threshold)
                .on("change", function (e) {
                  //d3.event.preventDefault();
                  if (this.value) {
                    let newT = parseFloat(this.value);
                    if (_.isNumber(newT) && newT > 0.0 && newT < 1) {
                      network.update_cluster_threshold_display(newT);
                      network.draw_attribute_labels();
                      network.update(true);
                      enclosure
                        .classed("has-success", true)
                        .classed("has-error", false);
                      return;
                    }
                  }

                  enclosure
                    .classed("has-success", false)
                    .classed("has-error", true);
                })
                .on("click", function (e) {
                  d3.event.stopPropagation();
                });
            },
            null,
          ],
        ],
      },
    };
  };

  self._social_view_options = function (
    labeled_links,
    shown_types,
    edge_typer
  ) {
    edge_typer =
      edge_typer ||
      function (e) {
        return _.has(e, "edge_type") ? e["edge_type"] : "";
      };

    return {
      "edge-styler": function (element, d, network) {
        var e_type = edge_typer(d);
        if (e_type != "") {
          d3.select(element).style(
            "stroke",
            network._edge_colorizer(edge_typer(d))
          ); //.style ("stroke-dasharray", network._edge_dasher (d["edge_type"]));

          d.is_hidden = !network.shown_types[e_type];
        } else {
          d.is_hidden = !network.shown_types[""];
        }
        d3.select(element).style("stroke-width", "5px");
      },

      init_code: function (network) {
        function style_edge(type) {
          this.style("stroke-width", "5px");
          if (type.length) {
            this.style("stroke", network._edge_colorizer(type)); //.style ("stroke-dasharray", network._edge_dasher (type));
          } else {
            this.classed("link", true);
            var def_color = this.style("stroke");
            this.classed("link", null);
            this.style("stroke", def_color);
          }
        }

        var edge_types = _.keys(shown_types);
        edge_types.sort();

        network._edge_colorizer = d3.scale
          .ordinal()
          .range(_networkCategoricalBase)
          .domain(edge_types);
        //network._edge_dasher   = _edge_dasher;
        network.shown_types = _.clone(shown_types);
        network.edge_legend = {
          caption: "Network links",
          types: {},
        };

        _.each(network.shown_types, function (ignore, t) {
          if (t.length) {
            network.edge_legend.types[t] = _.partial(style_edge, t);
          } else {
            network.edge_legend.types["Molecular links"] = _.partial(
              style_edge,
              t
            );
          }
        });
      },

      extra_menu: {
        title: "Additional options",
        items: _.map(labeled_links, function (edge_class) {
          return [
            function (network, element) {
              function toggle_element() {
                network.shown_types[edge_class] =
                  !network.shown_types[edge_class];
                checkbox.attr(
                  "checked",
                  network.shown_types[edge_class] ? "" : null
                );
                network.update(true);
              }

              var link;

              if (edge_class.length) {
                link = element
                  .append("a")
                  .text(edge_class + " links")
                  .style("color", network._edge_colorizer(edge_class))
                  .on("click", toggle_element);
              } else {
                link = element
                  .append("a")
                  .text("Molecular links")
                  .on("click", toggle_element);
              }
              var checkbox = link
                .append("input")
                .attr("type", "checkbox")
                .attr("checked", "");
            },
          ];
        }),
      },
    };
  };

  /*------------ Node injection (social network) ---------------*/

  self.load_nodes_edges = function (
    nodes_and_attributes,
    index_id,
    edges_and_attributes,
    annotation
  ) {
    annotation = annotation || "Social";
    /**
        1. Scan the list of nodes for
            a. Nodes not present in the existing network
            b. Attribute names
            c. Attribute values

        2. Scan the list of edges for
            a. Edges not present in the existing network
            b. Attribute names
            c. Attribute values
     */

    var new_nodes = [];
    var edge_types_dict = {};
    var existing_nodes = 0;

    try {
      var injected_nodes = {};
      var node_attributes = {};
      var existing_network_nodes = {};
      var node_name_2_id = {};

      _.each(self.json.Nodes, (n, i) => {
        existing_network_nodes[n.id] = n;
        node_name_2_id[n.id] = i;
      });

      const handle_node_attributes = (target, n) => {
        _.each(n, function (attribute_value, attribute_key) {
          if (attribute_key != index_id) {
            inject_attribute_node_value_by_id(
              target,
              attribute_key,
              attribute_value
            );
          }
        });
      };

      const inject_new_node = (node_name, n) => {
        let new_node = {
          node_class: "injected",
          node_annotation: annotation,
          attributes: [],
          degree: 0,
        };
        new_node[_networkNodeAttributeID] = {};
        new_node.id = node_name;
        handle_node_attributes(new_node, n);
        node_name_2_id[node_name] = self.json.Nodes.length;
        self.json.Nodes.push(new_node);
        new_nodes.push(new_node);
      };

      if (nodes_and_attributes && nodes_and_attributes.length) {
        if (!(index_id in nodes_and_attributes[0])) {
          throw (
            index_id +
            " is not one of the attributes in the imported node records"
          );
        }

        _.each(nodes_and_attributes[0], function (r, i) {
          if (i != index_id) {
            var attribute_definition = {
              label: i,
              type: "String",
              annotation: annotation,
            };
            self.inject_attribute_description(i, attribute_definition);
          }
        });

        _.each(nodes_and_attributes, function (n) {
          if (n[index_id] in existing_network_nodes) {
            handle_node_attributes(existing_network_nodes[n[index_id]], n);
            existing_nodes++;
          } else {
            inject_new_node(n[index_id], n);
          }
        });
      }

      if (edges_and_attributes && edges_and_attributes.length) {
        const auto_inject = !(
          nodes_and_attributes && nodes_and_attributes.length
        );

        if (auto_inject) {
          _.map(existing_network_nodes, (e) => false);
        }

        _.each(edges_and_attributes, function (e) {
          try {
            if ("Index" in e && "Partner" in e && "Contact" in e) {
              if (!(e["Index"] in node_name_2_id)) {
                if (auto_inject) {
                  inject_new_node(e["Index"], []);
                } else {
                  throw "Invalid index node";
                }
              } else {
                if (auto_inject) {
                  existing_network_nodes[e["Index"]] = true;
                }
              }

              if (!(e["Partner"] in node_name_2_id)) {
                if (auto_inject) {
                  inject_new_node(e["Partner"], []);
                } else {
                  throw "Invalid partner node";
                }
              } else {
                if (auto_inject) {
                  existing_network_nodes[e["Partner"]] = true;
                }
              }

              edge_types_dict[e["Contact"]] =
                (edge_types_dict[e["Contact"]]
                  ? edge_types_dict[e["Contact"]]
                  : 0) + 1;

              var new_edge = {
                source: node_name_2_id[e["Index"]],
                target: node_name_2_id[e["Partner"]],
                edge_type: e["Contact"],
                length: 0.005,
                directed: true,
              };

              self.json.Edges.push(new_edge);
            } else {
              throw "Missing required attribute";
            }
          } catch (err) {
            throw (
              "Invalid edge specification ( " + err + ") " + JSON.stringify(e)
            );
          }
        });

        if (auto_inject) {
          existing_nodes = _.size(_.filter(existing_network_nodes, (e) => e));
        }

        self._aux_populate_category_menus();

        self.update_clusters_with_injected_nodes(null, null, annotation);
        if (self._is_CDC_) {
          self.draw_extended_node_table(self.json.Nodes);
        } else {
          self.draw_node_table(self.extra_node_table_columns, self.json.Nodes);
        }
        if (!self.extra_cluster_table_columns) {
          self.extra_cluster_table_columns = [];
        }
        if (!self.extra_subcluster_table_columns) {
          self.extra_subcluster_table_columns = [];
        }

        var edge_types_by_cluster = {};
        _.each(self.json.Edges, function (e) {
          try {
            var edge_clusters = _.union(
              _.keys(self.json.Nodes[e.source].extended_cluster),
              _.keys(self.json.Nodes[e.target].extended_cluster)
            );
            _.each(edge_clusters, function (c) {
              if (!(c in edge_types_by_cluster)) {
                edge_types_by_cluster[c] = {};
              }
              if (e.edge_type) {
                edge_types_by_cluster[c][e.edge_type] = 1;
              }
            });
          } catch (err) {
            console.log(err);
          }
        });

        var edge_types_by_cluster_sorted = {};
        _.each(edge_types_by_cluster, function (v, c) {
          var my_keys = _.keys(v);
          my_keys.sort();
          edge_types_by_cluster_sorted[c] = my_keys;
        });

        /*var _edge_dasher = d3.scale
          .ordinal()
          .range(_networkCategoricalDashPatterns)
          .domain(edge_types);
        */

        var _social_view_handler = function (
          id,
          node_filter,
          labeled_links,
          shown_types,
          title,
          e
        ) {
          self.open_exclusive_tab_view(
            id,
            node_filter,
            title,
            self._social_view_options(labeled_links, shown_types),
            true
          );
        };

        var _injected_column_subcluster_button_handler = function (
          payload,
          edge_filter,
          title,
          e
        ) {
          function edge_filter_for_subclusters(edge) {
            return (
              self.is_edge_injected(edge) ||
              edge.length <= self.subcluster_threshold
            );
          }

          var subcluster_edges = [];

          var direct_links_only = hivtrace_cluster_depthwise_traversal(
            self.json.Nodes,
            self.json.Edges,
            edge_filter || edge_filter_for_subclusters,
            //null,
            subcluster_edges,
            payload.children
          );

          var labeled_links = {},
            shown_types = {};
          _.each(subcluster_edges[0], function (e) {
            if (e.edge_type) {
              labeled_links[e.edge_type] = 1;
              shown_types[e.edge_type] = 1;
            }
          });

          labeled_links = _.keys(labeled_links);
          labeled_links.sort();
          labeled_links.push("");
          shown_types[""] = 1;

          title =
            title ||
            function (id) {
              return (
                "Subcluster " + payload.cluster_id + "[+ " + annotation + "]"
              );
            };

          var cv = self.view_subcluster(
            payload,
            direct_links_only[0],
            title(payload.cluster_id),
            self._social_view_options(labeled_links, shown_types),
            edge_filter_for_subclusters,
            true
          );
          //cv.annotate_priority_clusters(timeDateUtil._networkCDCDateField, 36, 12);
          //cv.handle_attribute_categorical("recent_rapid");
          cv._refresh_subcluster_view(self.today || timeDateUtil.getCurrentDate());
        };

        var injected_column_subcluster = [
          {
            description: {
              value: annotation + " network",
              help: "View subclusters with " + annotation + " data",
            },

            generator: function (cluster) {
              return {
                value: cluster,
                callback: function (element, payload) {
                  var this_cell = d3.select(element);
                  this_cell
                    .append("button")
                    .classed("btn btn-primary btn-xs pull-right", true)
                    .style("margin-left", "1em")
                    .text("Complete " + annotation)
                    .on(
                      "click",
                      _.partial(
                        _injected_column_subcluster_button_handler,
                        payload,
                        null,
                        null
                      )
                    );

                  var node_ids = {};

                  _.each(payload.children, function (n) {
                    node_ids[n.id] = 1;
                  });

                  this_cell
                    .append("button")
                    .classed("btn btn-primary btn-xs pull-right", true)
                    .text("Directly linked " + annotation)
                    .on(
                      "click",
                      _.partial(
                        _injected_column_subcluster_button_handler,
                        payload,
                        function (edge) {
                          return (
                            self.json.Nodes[edge.target].id in node_ids ||
                            self.json.Nodes[edge.source].id in node_ids
                          );
                        },
                        function (id) {
                          return (
                            "Subcluster " +
                            payload.cluster_id +
                            "[+ direct  " +
                            annotation +
                            "]"
                          );
                        }
                      )
                    );
                },
              };
            },
          },
        ];

        var injected_column = [
          {
            description: {
              value: annotation + " network",
              sort: function (c) {
                return c.value[0];
              },
              help: "Nodes added and clusters merged through " + annotation,
            },
            generator: function (cluster) {
              return {
                value: [
                  cluster.injected[annotation],
                  cluster.linked_clusters,
                  cluster.cluster_id,
                ],

                callback: function (element, payload) {
                  var this_cell = d3.select(element);
                  this_cell.text(+payload[0] + " " + annotation + " nodes. ");
                  var other_clusters = [];
                  if (payload[1]) {
                    other_clusters = _.without(_.keys(payload[1]), payload[2]);
                    if (other_clusters.length) {
                      other_clusters.sort();
                      this_cell
                        .append("span")
                        .classed("label label-info", true)
                        .text(
                          "Bridges to " + other_clusters.length + " clusters"
                        )
                        .attr("title", other_clusters.join(", "));
                    }
                  }

                  var labeled_links = _.clone(
                    edge_types_by_cluster_sorted[payload[2]]
                  );

                  if (
                    payload[0] > 0 ||
                    other_clusters.length ||
                    (edge_types_by_cluster_sorted[payload[2]] &&
                      labeled_links.length)
                  ) {
                    labeled_links.push("");

                    var shown_types = {};
                    _.each(labeled_links, function (t) {
                      shown_types[t] = 1;
                    });

                    this_cell
                      .append("button")
                      .classed("btn btn-primary btn-xs pull-right", true)
                      .text("Directly linked " + annotation)
                      .style("margin-left", "1em")
                      .on("click", function (e) {
                        var directly_linked_ids = {};
                        var node_ids = {};

                        _.each(cluster.children, function (n) {
                          node_ids[n.id] = 1;
                        });

                        var direct_links_only =
                          hivtrace_cluster_depthwise_traversal(
                            self.json.Nodes,
                            self.json.Edges,
                            function (edge) {
                              return (
                                self.json.Nodes[edge.target].id in node_ids ||
                                self.json.Nodes[edge.source].id in node_ids
                              );
                            },
                            false,
                            cluster.children
                          );

                        _.each(direct_links_only[0], function (n) {
                          directly_linked_ids[n.id] = true;
                        });

                        //console.log (directly_linked_ids);

                        _social_view_handler(
                          payload[2],
                          function (n) {
                            return n.id in directly_linked_ids;
                          },
                          labeled_links,
                          shown_types,
                          function (id) {
                            return (
                              "Cluster " + id + "[+ direct " + annotation + "]"
                            );
                          },
                          e
                        );
                      });

                    this_cell
                      .append("button")
                      .classed("btn btn-primary btn-xs pull-right", true)
                      .text("Complete " + annotation)
                      .on(
                        "click",
                        _.partial(
                          _social_view_handler,
                          payload[2],
                          function (n) {
                            return (
                              n.extended_cluster &&
                              payload[2] in n.extended_cluster
                            );
                          },
                          labeled_links,
                          shown_types,
                          function (id) {
                            return "Cluster " + id + "[+ " + annotation + "]";
                          }
                        )
                      );
                  }
                },
              };
            },
          },
        ];

        if (self.extra_cluster_table_columns) {
          self.extra_cluster_table_columns =
            self.extra_cluster_table_columns.concat(injected_column);
        } else {
          self.extra_cluster_table_columns = injected_column;
        }

        self.draw_cluster_table(
          self.extra_cluster_table_columns,
          self.cluster_table
        );

        if (self.subcluster_table) {
          if (self.extra_subcluster_table_columns) {
            self.extra_subcluster_table_columns =
              self.extra_subcluster_table_columns.concat(
                injected_column_subcluster
              );
          } else {
            self.extra_subcluster_table_columns = injected_column_subcluster;
          }
          self.draw_cluster_table(
            self.extra_subcluster_table_columns,
            self.subcluster_table,
            { subclusters: true, "no-clusters": true }
          );
        }
      }
    } catch (e) {
      throw e;
    }

    return {
      nodes: new_nodes,
      existing_nodes: existing_nodes,
      edges: edge_types_dict,
    };
  };

  self.update_clusters_with_injected_nodes = function (
    node_filter,
    edge_filter,
    annotation
  ) {
    var cluster_report = {};

    try {
      node_filter =
        node_filter ||
        function () {
          return true;
        };
      edge_filter =
        edge_filter ||
        function () {
          return true;
        };

      var split_clusters = {};
      var node_id_to_local_cluster = {};

      var recomputed_clusters = hivtrace_cluster_depthwise_traversal(
        _.filter(self.json.Nodes, node_filter),
        self.json.Edges,
        null,
        false
      );

      _.each(recomputed_clusters, function (c) {
        var cluster_ids = {};
        var injected_count = 0;

        _.each(c, function (n) {
          cluster_ids[n.cluster] = 1;
          injected_count += n.cluster ? 0 : 1;
        });

        //var cluster_ids = _.keys (cluster_ids);

        //console.log (cluster_ids.length);

        // count how many "injected" nodes are there in the new cluster

        if (injected_count) {
          delete cluster_ids[undefined];
        }

        var cluster_count = _.keys(cluster_ids).length;

        _.each(c, function (n) {
          if ("extended_cluster" in n) {
            _.extend(n["extended_cluster"], cluster_ids);
          } else {
            n["extended_cluster"] = cluster_ids;
          }
        });

        _.each(cluster_ids, function (c, k) {
          var existing_cluster = self.clusters[self.cluster_mapping[k]];
          if (!existing_cluster.injected) {
            existing_cluster.injected = {};
          }
          existing_cluster.injected[annotation] = injected_count;
          if ("linked_clusters" in existing_cluster) {
            _.extend(existing_cluster["linked_clusters"], cluster_ids);
          } else {
            existing_cluster["linked_clusters"] = cluster_ids;
          }
        });
      });
    } catch (err) {
      console.log(err);
      throw err;
    }

    return recomputed_clusters;
  };
  /*------------ Event Functions ---------------*/
  function toggle_tooltip(element, turn_on, title, tag, container) {
    //if (d3.event.defaultPrevented) return;
    if (!element) {
      return;
    }

    if (turn_on && !element.tooltip) {
      // check to see if there are any other tooltips shown
      $("[role='tooltip']").each(function (d) {
        $(this).remove();
      });

      var this_box = $(element);
      var this_data = d3.select(element).datum();
      element.tooltip = this_box.tooltip({
        title: title + "<br>" + tag,
        html: true,
        container: container ? container : "body",
      });

      //this_data.fixed = true;

      _.delay(_.bind(element.tooltip.tooltip, element.tooltip), 500, "show");
    } else {
      if (turn_on == false && element.tooltip) {
        element.tooltip.tooltip("destroy");
        element.tooltip = undefined;
      }
    }
  }

  /*------------ Init code ---------------*/

  var l_scale = 5000, // link scale
    graph_data = self.json, // the raw JSON network object
    max_points_to_render = 2048,
    singletons = 0,
    open_cluster_queue = [],
    currently_displayed_objects,
    gravity_scale = d3.scale
      .pow()
      .exponent(0.5)
      .domain([1, 100000])
      .range([0.1, 0.15]),
    link_scale = d3.scale.pow().exponent(1.25).clamp(true).domain([0, 0.1]);

  /*------------ D3 globals and SVG elements ---------------*/

  var network_layout = d3.layout
    .force()
    .on("tick", tick)
    .charge(function (d) {
      if (self.showing_on_map) {
        return -60;
      }
      if (d.cluster_id)
        return (
          self.charge_correction * (-15 - 5 * Math.pow(d.children.length, 0.4))
        );
      return self.charge_correction * (-10 - 5 * Math.sqrt(d.degree));
    })
    .linkDistance(function (d) {
      return link_scale(d.length) * l_scale * 0.2; //Math.max(d.length, 0.005) * l_scale * 10;
    })
    .linkStrength(function (d) {
      if (self.showing_on_map) {
        return 0.01;
      }
      if (d.support !== undefined) {
        return 0.75 - 0.5 * d.support;
      }
      return 1;
    })
    .chargeDistance(l_scale * 0.1)
    .gravity(self.showing_on_map ? 0 : gravity_scale(json.Nodes.length))
    .friction(0.25);

  d3.select(self.container).selectAll(".my_progress").style("display", "none");
  d3.select(self.container).selectAll("svg").remove();
  nodesTab.getNodeTable().selectAll("*").remove();
  self.cluster_table.selectAll("*").remove();

  self.network_svg = d3
    .select(self.container)
    .append("svg:svg")
    //.style ("border", "solid black 1px")
    .attr("id", self.dom_prefix + "-network-svg")
    .attr("width", self.width + self.margin.left + self.margin.right)
    .attr("height", self.height + self.margin.top + self.margin.bottom);

  self.network_cluster_dynamics = null;

  //.append("g")
  // .attr("transform", "translate(" + self.margin.left + "," + self.margin.top + ")");

  var legend_drag = d3.behavior
    .drag()
    .on("dragstart", function () {
      d3.event.sourceEvent.stopPropagation();
    })
    .on("drag", function (d) {
      d3.select(this).attr(
        "transform",
        "translate(" + [d3.event.x, d3.event.y] + ")"
      );
    }),
    legend_vertical_offset;

  self.showing_on_map
    ? (legend_vertical_offset = 100)
    : (legend_vertical_offset = 5);
  self.legend_svg = self.network_svg
    .append("g")
    .attr("transform", "translate(5," + legend_vertical_offset + ")")
    .call(legend_drag);

  /*
    self.network_svg
    .append("defs")
    .append("marker")
    .attr("id", self.dom_prefix + "_arrowhead")
    .attr("refX", 9)
    .attr("refY", 2)
    .attr("markerWidth", 6)
    .attr("markerHeight", 4)
    .attr("orient", "auto")
    .attr("stroke", "#666666")
    //.attr("markerUnits", "userSpaceOnUse")
    .attr("fill", "#AAAAAA")
    .append("path")
    .attr("d", "M 0,0 V 4 L6,2 Z"); //this is actual shape for arrowhead

*/
  self.network_svg
    .append("defs")
    .append("marker")
    .attr("id", self.dom_prefix + "_arrowhead")
    .attr("refX", 18)
    .attr("refY", 6)
    .attr("markerWidth", 20)
    .attr("markerHeight", 16)
    .attr("orient", "auto")
    .attr("stroke", "#666666")
    .attr("markerUnits", "userSpaceOnUse")
    .attr("fill", "#AAAAAA")
    .append("path")
    .attr("d", "M 0,0 L 2,6 L 0,12 L14,6 Z"); //this is actual shape for arrowhead

  change_window_size();

  initial_json_load();

  if (options) {
    if (_.isNumber(options["charge"])) {
      self.charge_correction = options["charge"];
    }

    if ("colorizer" in options) {
      self.colorizer = options["colorizer"];
    }

    if ("node_shaper" in options) {
      self.node_shaper = options["node_shaper"];
    }

    if ("callbacks" in options) {
      options["callbacks"](self);
    }

    if (_.isArray(options["expand"])) {
      self.expand_some_clusters(
        _.filter(self.clusters, function (c) {
          return options["expand"].indexOf(c.cluster_id) >= 0;
        })
      );
    }

    if (options["priority-sets-url"]) {
      let is_writeable = options["is-writeable"];
      self.load_priority_sets(options["priority-sets-url"], is_writeable);
    }

    if (self.showing_diff) {
      self.handle_attribute_categorical("_newly_added");
    }
  }

  self.draw_attribute_labels();
  d3.select(self.container).selectAll(".my_progress").style("display", "none");
  network_layout.start();

  return self;
};

export { hivtrace_cluster_network_graph as clusterNetwork, hivtrace_cluster_depthwise_traversal as computeCluster };
