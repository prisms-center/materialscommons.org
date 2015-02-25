Application.Controllers.controller("provWizardController",
                                   ["$scope", "$timeout", provWizardController]);

function provWizardController($scope, $timeout) {
    $scope.detailsActive = true;
    $scope.templatesActive = false;
    $scope.templates = [
        "template-a",
        "template-b",
        "template-c",
        "template-d"
    ];

    $scope.steps = [
        "Process Description",
        "Settings",
        "Input Files",
        "Output Files"
    ];

    var nodes = [
        {id: 1, label: "My Sample", level: 0, group: "sample"},
        {id: 2, label: "Section", level: 1, group: "process"},
        {id: 3, label: "SEM", level: 1, group: "process"},
        {id: 4, label: "My Sample Cut 1", level: 2, group: "sample"},
        {id: 5, label: "My Sample Cut 2", level: 2, group: "sample"},
        {id: 6, label: "SEM Analysis", level: 2, group: "process"}
    ];

    var savedNodes = nodes;

    var lastNodeID = 6;
    var lastEdgeID = 6;

    var edges = [
        {id: 1, from: 1, to: 2},
        {id: 2, from: 1, to: 3},
        {id: 3, from: 2, to: 4},
        {id: 4, from: 2, to: 5},
        {id: 5, from: 3, to: 6},
        {id: 6, from: 2, to: 6}
    ];

    var height = window.innerHeight || document.body.clientHeight;
    var heightToSet = height -180;

    $scope.options = {
        stabilize: true,
        height: heightToSet+"px",
        dragNetwork: false,
        navigation: true,
        zoomable: true,
        edges: {
            width: 3,
            style: "dash-line"
        },
        hierarchicalLayout: {
            enabled: true,
            nodeSpacing: 500
        },
        groups: {
            sample: {
                color: "gray",
                shape: "box"
            },
            process: {
                shape: "box"
            }
        }
    };

    $scope.data = {
        nodes: nodes,
        edges: edges
    };

    $scope.selectedNode = null;
    $scope.selectedEdge = null;

    $scope.onSelect = function(props) {
        if (props.nodes.length !== 0 ) {
            var nodeID = props.nodes[0];
            var index = _.indexOf($scope.data.nodes, function(node) {
                return node.id+"" === nodeID;
            });
            $scope.selectedNode = $scope.data.nodes[index];
            $scope.selectedEdge = null;
        } else {
            $scope.selectedEdge = props.edges[0];
            $scope.selectedNode = null;
        }
    };

    $scope.addNode = function() {
        if (!$scope.selectedNode) {
            return;
        }

        var node = $scope.selectedNode;
        lastNodeID++;
        $timeout(function() {
            $scope.data.nodes.push({
                id: lastNodeID,
                label: "My new process " + lastNodeID,
                level: node.level+1,
                group: "process"
            });
            $scope.data.edges.push({
                from: node.id,
                to: lastNodeID
            });
        });
    };

    $scope.addBetween = function() {
        if (!$scope.selectedEdge) {
            return;
        }
        var index = _.indexOf($scope.data.edges, function(edge) {
            return edge.id+"" == $scope.selectedEdge;
        });
        var edge = $scope.data.edges[index];
        var indexFrom = _.indexOf($scope.data.nodes, function(node) {
            return node.id == edge.from;
        });
        var fromNode = $scope.data.nodes[indexFrom];

        var indexTo = _.indexOf($scope.data.nodes, function(node) {
            return node.id == edge.to;
        });
        var toNode = $scope.data.nodes[indexTo];
        $timeout(function() {
            lastNodeID++;
            $scope.data.nodes.push({
                id: lastNodeID,
                label: "Inbetween process " + lastNodeID,
                level: fromNode.level+1,
                group: "process"
            });
            toNode.level++;
            $scope.data.edges.splice(index, 1);
            lastEdgeID++;
            $scope.data.edges.push({
                id: lastEdgeID,
                from: fromNode.id,
                to: lastNodeID
            });

            lastEdgeID++;
            $scope.data.edges.push({
                id: lastEdgeID,
                from: lastNodeID,
                to: toNode.id
            });
        });
    };

    $scope.focusOnNode = function() {
        if (!$scope.selectedNode) {
            return;
        }

        console.dir($scope.selectedNode);

        var nodeID = $scope.selectedNode.id;
        var nodeLevel = $scope.selectedNode.level;


        //console.log("==========");
        // for (v in al) {
        //     if (al.hasOwnProperty(v) && !visited[v]) {
        //         groups.push(bfs(v, al, visited));
        //     }
        // }

        //var newNodes = [];

        // Get rid of all nodes that are parents this node,
        // or that are at the same level as this node.
        // $scope.data.nodes.forEach(function(node) {
        //     if (node.id == nodeID) {
        //         newNodes.push(node);
        //     } else if (node.level > nodeLevel) {
        //         if (isConnected(node, $scope.selectedNode)) {
        //             newNodes.push(node);
        //         }
        //     }
        // });

        var al = convertToAdjacencyList($scope.data.edges);

        console.dir(al);

        console.dir(dfs($scope.selectedNode.id, al, $scope.selectedNode.level));

        if (true) {
            return;
        }

        $timeout(function() {
            savedNodes = $scope.data.nodes;
            $scope.data.nodes = newNodes;
        });
    };

    function isConnected(nodeToCheck, baseNode) {
        if (nodeToCheck.level == baseNode.level + 1) {
            // if no edge directly connects then return false
            var connected = false;
            $scope.data.edges.forEach(function(edge) {
                if (nodeToCheck.id == edge.to && edge.from == baseNode.id) {
                    connected = true;
                }
            });
            return connected;
        }
        return true;
    }

    $scope.removeFocusOnNode = function() {
        $timeout(function() {
            $scope.data.nodes = savedNodes;
        });
    };

    function convertToAdjacencyList(edgeList) {
        var adjList = {},
            i, len, pari, to, from;
        for (i = 0, len = edgeList.length; i < len; i++) {
            to = edgeList[i].to;
            from = edgeList[i].from;
            if (adjList[to]) {
                adjList[to].push(from);
            } else {
                adjList[to] = [from];
            }
            if (adjList[from]) {
                adjList[from].push(to);
            } else {
                adjList[from] = [to];
            }
        }
        return adjList;
    }

    function bfs(vertex, adjList, visited) {
        var q = [],
            current_group = [],
            i, len, adjV, nextVertex;
        q.push(vertex);
        visited[vertex] = true;
        while (q.length > 0) {
            vertex = q.shift();
            current_group.push(vertex);
            // Go through the adjacency list of vertex and push
            // any unvisited vertex onto the queue.
            adjV = adjList[vertex];
            for (i = 0, len = adjV.length; i < len; i++) {
                nextVertex = adjV[i];
                if (!visited[nextVertex]) {
                    q.push(nextVertex);
                    visited[nextVertex] = true;
                }
            }
        }
        return current_group;
    }

    function dfs(vertex, adjList, level) {
        var stack = [];
        var iterations = 0;
        var current_group = [];
        var visited = {};
        stack.push(vertex);
        while (stack.length > 0) {
            iterations++;
            vertex = stack.shift();
            current_group.push(vertex);
            //console.log("vertex", vertex);
            //console.log("stack %O", stack);
            if (iterations > 10) {
                break;
            }
            if (!visited[vertex]) {
                visited[vertex] = true;
                var adjacent = adjList[vertex];
                adjacent.forEach(function(vertexID) {
                    if (!visited[vertexID]) {
                        if (!isHigher(vertexID, level)) {
                            stack.push(vertexID);
                        }
                    }
                });
            }
        }
        return current_group;
    }

    function isHigher(nodeID, level) {
        var isHigherLevel = false;
        $scope.data.nodes.forEach(function(node) {
            if (node.id == nodeID) {
                if (node.level <= level) {
                    isHigherLevel = true;
                }
            }
        });
        return isHigherLevel;
    }
}
