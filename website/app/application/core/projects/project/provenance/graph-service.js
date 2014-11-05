Application.Services.factory("Graph", [graphService]);
function graphService() {
    var graph = {
        nodes: [],
        edges: [],
        network_data: {},
        network_options: {},
        count: 1,
        item_count: '',
        times_linked_item_to_process: '',

        constructGraph: function (process) {
            graph.nodes = [];
            graph.edges = [];
            graph.count = 1;
            graph.item_count = '';
            graph.times_linked_item_to_process = '';
            //Set up initial node (your main process)
            graph.nodes.push({
                id: 0,
                label: String(process.name),
                shape: 'dot',
                color: {
                    background: '#FF7F6E',
                    border: "#666"
                }
            });
            graph.nodes[0].level = 2;
            //build left side graph
            angular.forEach(process.inputs, function (values, key) {
                if (key === 'files') {
                    if (values.length !== 0) {
                        graph.buildFiles(values, process.output_processes, 'upstream');
                    }
                } else if (key === 'sample') {
                    graph.buildSamples(values, process.input_processes, 'upstream');
                } else {
                    graph.buildSettings(key);
                }
            });

            angular.forEach(process.outputs, function (values, key) {
                if (key === 'files') {
                    if (values.length !== 0) {
                        graph.buildFiles(values, process.input_processes, 'downstream');
                    }
                } else if (key === 'sample') {
                    graph.buildSamples(values, process.output_processes, 'downstream');
                } else {
                    graph.buildSettings(key);
                }
            });
            graph.network_data = {
                nodes: graph.nodes,
                edges: graph.edges
            };
            graph.network_options = {
                hierarchicalLayout: {
                    direction: "LR"
                },
                edges: {style: "arrow"},
                smoothCurves: false
            };
            return graph;
        },

        constructEdge: function (from, to) {
            graph.edges.push({
                from: from,
                to: to
            });
        },
        constructNode: function (name, type) {
            if (type === 'process') {
                graph.nodes.push({
                    id: graph.count,
                    label: String(name),
                    title: name,
                    shape: 'dot',
                    color: {
                        background: '#FF7F6E',
                        border: "#666"
                    }
                });
            } else {
                graph.nodes.push({
                    id: graph.count,
                    label: String(name),
                    title: name,
                    shape: 'triangle',
                    color: {
                        background: '#109618',
                        border: "#666"
                    }
                });
            }

        },

        buildFiles: function (files, available_processes, stream) {
            files.forEach(function (file) {
                graph.constructNode(file.other.name, 'file');
                if (stream === 'upstream') {
                    graph.constructEdge(graph.count, 0);
                    graph.nodes[graph.count].level = 1;
                } else {
                    graph.constructEdge(0, graph.count);
                    graph.nodes[graph.count].level = 3;
                }

                graph.count++;
                graph.connectProcesses(available_processes, file.other.name, stream);
                //check for adjacent processes of this file

            });
        },
        buildSamples: function (samples, available_processes, stream) {
            samples.forEach(function (sample) {
                graph.constructNode(sample.other.name, 'sample');
                if (stream === 'upstream') {
                    graph.constructEdge(graph.count, 0);
                    graph.nodes[graph.count].level = 1;
                } else {
                    graph.constructEdge(0, graph.count);
                    graph.nodes[graph.count].level = 3;
                }
                graph.count++;
                graph.connectProcesses(available_processes, sample.other.name, stream);
                //check for adjacent processes of this file

            });
        },
        buildSettings: function (key) {
            graph.constructNode(key, 'setting');
            graph.constructEdge(graph.count, 0);
            graph.nodes[graph.count].level = 1;
            graph.count++;
        },

        connectProcesses: function (available_processes, item_name, stream) {
            graph.item_count = graph.count - 1;
            graph.times_linked_item_to_process = 0;
            angular.forEach(available_processes, function (process, key) {
                if (process.related_files.indexOf(item_name) > -1) {
                    graph.times_linked_item_to_process++;
                    graph.nodes.push({
                        id: graph.count,
                        label: String(process.process_name),
                        title: process.process_name,
                        shape: 'dot',
                        color: {
                            background: '#FF7F6E',
                            border: "#666"
                        }

                    });
                    if (graph.times_linked_item_to_process > 0) {
                        if (stream === 'upstream') {
                            graph.constructEdge(graph.count, graph.item_count);
                            graph.nodes[graph.count].level = 0;

                        } else {
                            graph.constructEdge(graph.item_count, graph.count);
                            graph.nodes[graph.count].level = 4;

                        }
                    } else {
                        if (stream === 'upstream') {
                            graph.constructEdge(graph.count, graph.count - 1);
                            graph.nodes[graph.count].level = 0;

                        } else {
                            graph.constructEdge(graph.count - 1, graph.count);
                            graph.nodes[graph.count].level = 4;

                        }
                    }
                    graph.count++;
                }
            });
        }
    };
    return graph;
}