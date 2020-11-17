export function plot_graph(graph_filename) {
    "use strict";

    var consts = {
        selectedClass: "selected",
        connectClass: "connect-node",
        variableClass: "variable-node",
        operationClass : "operation-node",
        graphClass: "graph",
        activeEditId: "active-editing",
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ENTER_KEY: 13
    };

    ////////////////////////////////////////////////
    // Graph object
    var Graph = function (svg, nodes, edges) {
        this.node_ctr = nodes.length + 1;
        this.nodes = nodes;
        this.edges = edges;

        this.svg = svg;

        // define arrow markers for graph links
        var defs = svg.append('svg:defs');
        defs.append('svg:marker')
            .attr('id', 'end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', "32")
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        // define arrow markers for leading arrow
        defs.append('svg:marker')
            .attr('id', 'mark-end-arrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 7)
            .attr('markerWidth', 3.5)
            .attr('markerHeight', 3.5)
            .attr('orient', 'auto')
            .append('svg:path')
            .attr('d', 'M0,-5L10,0L0,5');

        this.svgG = svg.append("g")
            .classed(consts.graphClass, true);

        this.paths = this.svgG.append("g").selectAll("g");
        this.variables = this.svgG.append("g").selectAll("g");
        this.operations = this.svgG.append("g").selectAll("g");
        this.updateGraph();
    };

    Graph.prototype.updateGraph = function(){

        alert(this.nodes[0].type);

    };


    ////////////////////////////////////////////////
    // Graph creator from a JSON string description
    var GraphParser = function (svg, graphstr) {
        var graph;
        try {
            var jsonObj = JSON.parse(graphstr);

            var nodes = jsonObj.nodes.filter(function (n) { return n.type == "variable"; });
            var nodes = jsonObj.nodes.filter(function (n) { return n.type == "variable"; });

            var edges = jsonObj.edges;
            edges.forEach(function (e, i) {
                edges[i] = {
                    source: nodes.filter(function (n) { return n.id == e.source; })[0],
                    target: nodes.filter(function (n) { return n.id == e.target; })[0]
                };
            });
            graph = new Graph(svg, nodes, edges);
            //graph.updateGraph();
        } catch (err) {
            window.alert("Error parsing uploaded file\nerror message: " + err.message);
            return;
        }
        return graph;
    };

    function readTextFile(filename) {
        var rawFile = new XMLHttpRequest();
        var allText;
        rawFile.open("GET", filename, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    allText = rawFile.responseText;
                    alert(allText);
                }
            }
        }
        rawFile.send(null);
        return allText;
    }


    var docEl = document.documentElement,
        bodyEl = document.getElementsByTagName('body')[0];

    var width = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth,
        height = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;


    /** MAIN SVG **/
    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height);
    var graphstr = readTextFile(graph_filename);
    var graph = GraphParser(svg, graphstr);



}
