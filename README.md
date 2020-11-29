# Computational graph editor

Interactive tool for navigating within a computational graph. Written in javascript and d3js v3. Using MathJax for math rendering in SVG. This tool is based on the earlier work [https://github.com/cjrd/directed-graph-creator](https://github.com/cjrd/directed-graph-creator)

**Example** 

Follow this [link](https://jeremyfix.github.io/computational-graph-editor/index.html)

![Example](https://github.com/jeremyfix/computational-graph-editor/blob/main/snapshot.png)

**Interaction**

- mouse click then drag to pan/tilt the display
- mouse click on a node then drag to move the node
- mouse wheel to zoom-in/zoom-out
- mouse over a node to highlight it

**Run**

	python -m SimpleHTTPServer 8000

Then run a browser to [http://localhost:8000/test.html](http://localhost:8000/test.html)


**Creating your own graph**

The graph is specified by a JSON file. See `mygraph.json` for an example. It contains nodes and edges.

A node has :

- a title : the label placed in `$...$` for Latex/Mathjax rendering
- a type : either `variable` or `operation`
- a unique id 
- a `(x, y)` position 
- a `(width, height)` shape attributes

An edge has :

- a source node id
- a target node id
- a label to be display along the edge



**Disclaimer**

I'm not a javascript developer so there are some adaptions that I brought to the original code without fully understanding how it worked (it includes the MathJax remove and reappend, and the d3 behaviors drag and zoom). Therefore, if you notice some incoherent code or if you have suggestions on better ways to handle such or such thing, please raise an issue (or even a pull request !).
