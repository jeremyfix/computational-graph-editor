export function plot_graph(graph_filename) {
    "use strict";

    var consts = {
        graphClass: "graph",
        variableClass: "variable-node",
        VARIABLE_NODE_RX: 15,
        VARIABLE_NODE_RY: 15,
        operationClass: "operation-node",
        OPERATION_NODE_RX: 15,
        OPERATION_NODE_RY: 15
    };

    ////////////////////////////////////////////////
    // Graph object
    var Graph = function (svg, nodes, edges, translate_x, translate_y, scale) {

        var thisGraph = this;

        thisGraph.nodes = nodes;
        thisGraph.variable_nodes = nodes.filter(function (n) {
            return n.type == "variable";
        });
        thisGraph.operation_nodes = nodes.filter(function (n) {
            return n.type == "operation";
        });

        thisGraph.edges = edges;
        thisGraph.svg = svg;

        thisGraph.state = {
            mouseDownNode: null,
            mouseDownLink: null,
            justDragged: false,
            justScaleTransGraph: false,
            lastKeyDown: -1,
            shiftNodeDrag: false,
            selectedText: null
        };

        thisGraph.svgG = svg.append("g")
            .classed(consts.graphClass, true)
            .attr("transform", "translate(" + translate_x +  "," + translate_y + ") scale(" + scale + ")");

        thisGraph.paths = thisGraph.svgG.append("g").selectAll("g");
        thisGraph.variables = thisGraph.svgG.append("g").selectAll("g");
        thisGraph.operations = thisGraph.svgG.append("g").selectAll("g");

        thisGraph.drag = d3.behavior.drag()
            .origin(function (d) {
                return { x: d.x, y: d.y };
            })
            .on("drag", function (args) {
                thisGraph.dragmove.call(thisGraph, args);
            })
            .on("dragend", function () {
            });

        // 
        var dragSvg = d3.behavior.zoom()
            .on("zoom", function () {
                thisGraph.zoomed.call(thisGraph);
                return true;
            })
            .on("zoomstart", function () {
                d3.select('body').style("cursor", "move");
            })
            .on("zoomend", function () {
                d3.select('body').style("cursor", "auto");
            });
        svg.call(dragSvg).on("dblclick.zoom", null);

        svg.on("mousedown", function (d) { thisGraph.svgMouseDown.call(thisGraph, d); });

        thisGraph.updateGraph();
    };
    //////////////////////////////////////////////
    // Callbacks
    Graph.prototype.dragmove = function (d) {
        var thisGraph = this;
        // Move the selected node
        d.x += d3.event.dx;
        d.y += d3.event.dy;
        thisGraph.updateGraph();
    }

    Graph.prototype.set_transform = function (translate_x, translate_y, scale) {
        //this.state.justScaleTransGraph = true;
        d3.select("." + consts.graphClass)
            .attr("transform", "translate(" + translate_x +  "," + translate_y + ") scale(" + scale + ")");
		this.updateGraph();
    };

    Graph.prototype.zoomed = function () {
        //this.state.justScaleTransGraph = true;
        d3.select("." + consts.graphClass)
            .attr("transform", "translate(" + d3.event.translate + ") scale(" + d3.event.scale + ")");
    };

    // mousedown on main svg
    Graph.prototype.svgMouseDown = function () {
        this.state.graphMouseDown = true;
    };

    // Mousedown on nodes
    // We move the node
    Graph.prototype.NodesMouseDown = function (d3node, d) {
        // Prevent the signal to be propagated to the parent svg
        d3.event.stopPropagation();
    };


    Graph.prototype.updateGraph = function () {
        var thisGraph = this;

        ///////////// Create the edges
        thisGraph.paths = thisGraph.paths.data(thisGraph.edges, function (d) {
            return String(d.source.id) + "+" + String(d.target.id);
        });
        var paths = thisGraph.paths;
        // update existing paths
        paths.select("path")
            .attr("d", function (e) {
                var sx = e.source.x + e.source.width / 2.;
                var sy = e.source.y + e.source.height / 2.;
                var dx = e.target.x + e.target.width / 2.;
                var dy = e.target.y + e.target.height / 2.;
                var mx = (sx + dx) / 2.;
                var my = (sy + dy) / 2.;
                return "M" + sx + "," + sy + " L" + mx + "," + my + " L" + dx + "," + dy;
            });
        paths.select(".label-holder")
            .attr("transform", function (e) {
                var sx = e.source.x + e.source.width / 2.;
                var sy = e.source.y + e.source.height / 2.;
                var dx = e.target.x + e.target.width / 2.;
                var dy = e.target.y + e.target.height / 2.;
                var mx = (sx + dx) / 2.;
                var my = (sy + dy) / 2.;
                return "translate("
                    + mx + ","
                    + my + ")";
            });

        var newPaths = paths.enter().append("g");
        newPaths.append("path")
            .classed("link", true)
            .attr("d", function (e) {
                var sx = e.source.x + e.source.width / 2.;
                var sy = e.source.y + e.source.height / 2.;
                var dx = e.target.x + e.target.width / 2.;
                var dy = e.target.y + e.target.height / 2.;
                var mx = (sx + dx) / 2.;
                var my = (sy + dy) / 2.;
                return "M" + sx + "," + sy + " L" + mx + "," + my + " L" + dx + "," + dy;
            })

        var edge_label = newPaths.append("g")
            .attr("class", "label-holder")
            .attr("transform", function (e) {
                var sx = e.source.x + e.source.width / 2.;
                var sy = e.source.y + e.source.height / 2.;
                var dx = e.target.x + e.target.width / 2.;
                var dy = e.target.y + e.target.height / 2.;
                var mx = (sx + dx) / 2.;
                var my = (sy + dy) / 2.;
                return "translate("
                    + mx + ","
                    + my + ")";
            });
        edge_label.append("circle")
            .attr("r", function (e) {
                // Little trick to hid the nodes without label
                // I was not sure there was possibility to prevent the creation
                // of the circle under that condition
                if (e.label == "")
                    return "0";
                else
                    return "15";
            });
        edge_label.append("g")
            .attr("class", "title")

            .append("text")
            .attr("text-anchor", "middle")
            .text(function (e) {
                return e.label;
            });

        // remove old links
        paths.exit().remove();

        ///////////// Create the variable nodes
        // Update the existing nodes
        thisGraph.variables = thisGraph.variables.data(thisGraph.variable_nodes, function (n) { return n.id; });
        thisGraph.variables.attr("transform", function (n) { return "translate(" + n.x + "," + n.y + ")"; });

        // Add new nodes
        var newVariables = thisGraph.variables.enter()
            .append("g");

        newVariables.classed(consts.variableClass, true)
            .attr("transform", function (n) { return "translate(" + n.x + "," + n.y + ")"; })
            .on("mousedown", function (d) {
                thisGraph.NodesMouseDown.call(thisGraph, d3.select(this), d);
            })
            .call(thisGraph.drag);

        newVariables.append("rect")
            .attr("width", function (n) { return n.width; })
            .attr("height", function (n) { return n.height; })
            .attr("rx", 15)
            .attr("ry", 15);

        // Add the holder of the title
        newVariables.append("g")
            .attr("class", "title")
            .attr("transform", function (n) {
                return "translate("
                    + n.width / 2. + ","
                    + n.height / 2. + ")";
            })
            .append("text")
            .attr("text-anchor", "middle")
            .text(function (n) {
                return n.title;
            });

        thisGraph.variables.exit().remove();

        ///////////// Create the operation nodes
        // Update the existing nodes
        this.operations = this.operations.data(this.operation_nodes, function (n) { return n.id; });
        this.operations.attr("transform", function (n) { return "translate(" + n.x + "," + n.y + ")"; });

        // Add new nodes
        var newOperations = this.operations.enter()
            .append("g");

        newOperations.classed(consts.operationClass, true)
            .attr("transform",
                function (n) {
                    return "translate(" + n.x + "," + n.y + ")";
                })
            .on("mousedown", function (d) {
                thisGraph.NodesMouseDown.call(thisGraph, d3.select(this), d);
            })
            .call(thisGraph.drag);

        newOperations.append("rect")
            .attr("width", function (n) { return n.width; })
            .attr("height", function (n) { return n.height; })
            .attr("rx", 15)
            .attr("ry", 15);

        // Add the holder of the title
        newOperations.append("g")
            .attr("class", "title")
            .attr("transform", function (n) {
                return "translate("
                    + n.width / 2. + ","
                    + n.height / 2. + ")";
            })
            .append("text")
            .attr("text-anchor", "middle")
            .text(function (n) {
                return n.title;
            });

        this.operations.exit().remove();
    };

    Graph.prototype.updateWindow = function (svg) {
        var docEl = document.documentElement,
            bodyEl = document.getElementsByTagName('body')[0];
        var x = window.innerWidth || docEl.clientWidth || bodyEl.clientWidth;
        var y = window.innerHeight || docEl.clientHeight || bodyEl.clientHeight;
        svg.attr("width", x).attr("height", y);
    };


    ////////////////////////////////////////////////
    // Graph creator from a JSON string description
    var GraphParser = function (svg, graphstr) {
        var graph;
        try {
            var jsonObj = JSON.parse(graphstr);
			var transform = jsonObj.transform;
            var nodes = jsonObj.nodes
            var edges = jsonObj.edges;
            edges.forEach(function (e, i) {
                edges[i] = {
                    source: nodes.filter(function (n) { return n.id == e.source; })[0],
                    target: nodes.filter(function (n) { return n.id == e.target; })[0],
                    label: e.label
                };
            });
            graph = new Graph(svg, nodes, edges, transform.translate_x, transform.translate_y, transform.scale);
        } catch (err) {
            window.alert("Error parsing uploaded file\nerror message: " + err.message);
            return;
        }
        return graph;
    };

    // Function to get the content of a file hosted on a server
    function readTextFile(filename) {
        var rawFile = new XMLHttpRequest();
        var allText;
        rawFile.open("GET", filename, false);
        rawFile.onreadystatechange = function () {
            if (rawFile.readyState === 4) {
                if (rawFile.status === 200 || rawFile.status == 0) {
                    allText = rawFile.responseText;
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

    // listen for resize
    window.onresize = function () {
        graph.updateWindow(svg);
    };

    // Handle the download button click
    d3.select("#download-input").on("click", function () {
        var blob = window.Blob;
        var saveEdges = [];
        graph.edges.forEach(function (val, i) {
            saveEdges.push({
                source: val.source.id,
                target: val.target.id,
                label: val.label
            });
        });
        var blob = new Blob([
            window.JSON.stringify(
                { "nodes": graph.nodes, "edges": saveEdges },
                null,
                ' '
            )],
            { type: "text/plain;charset=utf-8" });
        saveAs(blob, "mygraph.json");
    });




    // Code adapted (almost copied) from 
    // https://thesoftwaresimpleton.com/blog/2016/05/25/sine-wave
    function addMathJax(svg) {
        const continuation = () => {
            MathJax.Hub.Config({
                tex2jax: {
                    inlineMath: [['$', '$'], ["\\(", "\\)"]],
                    processEscapes: true
                }
            });

            MathJax.Hub.Register.StartupHook("End", function () {
                setTimeout(() => {
                    svg.selectAll('.title').each(function () {
                        var self = d3.select(this),
                            g = self.select('text>span>svg');
                        //var svg_title = self.select('svg');
                        if (g[0][0] && g[0][0].tagName === 'svg') {
                            g.remove();
                            // var svg_title = g[0][0];
                            //console.log(window.getComputedStyle(svg_title).getPropertyValue("height"));
                            //console.log(svg_title.node().getBoundingClientRect());

                            self.append("g")
                                .attr("transform", "translate(" + 0 + ", " + 0 + ")")
                                .append(function () {
                                    return g.node();
                                });

                            /*
                            self.append(function(){
                              return g.node();
                            });
                              */
                        }
                    });

                    svg.selectAll('.title').each(function () {
                        var svg_title = d3.select(this).select('svg');
                        //console.log(svg_title.node().getBBox());
                        if (svg_title.node()) {
                            var bbox = svg_title.node().getBoundingClientRect();

                            //console.log(svg_title.node().getBoundingClientRect());
                            d3.select(this).select("g")
                                .attr("transform", "translate(" + -bbox.width / 2. + ", " + -bbox.height / 2. + ")");
                        }
                    });
                }, 500);
            });

            MathJax.Hub.Queue(["Typeset", MathJax.Hub, svg.node()]);
        };

        wait((window.hasOwnProperty('MathJax')), continuation.bind(this));
    }
    addMathJax(svg);

}


export function wait(condition, func, counter = 0) {
    if (condition || counter > 10) {
        return func()
    }

    setTimeout(wait.bind(null, condition, func, counter + 1), 30)
}
