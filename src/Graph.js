const concatDistinct = require('./utils/concatDistinct');
const GraphNode = require('./GraphNode');
const ObjectSet = require('./ObjectSet');
const Queue = require('./Queue');
const Stack = require('./Stack');

const DefaultEdgeOptions = {
  directed: false,
  weight: 1,
};

const privateData = new WeakMap();

function $createEdge(fromNode, toNode, weight) {
  const { E } = privateData.get(this);
  const edges = E.get(fromNode) || new Map();
  E.set(fromNode, edges.set(toNode, weight));
}

function $vertexExists(...values) {
  const { V } = privateData.get(this);
  return values.every((v) => V.has(GraphNode.create(v)));
}

function $getVertexEdges(node) {
  const { E } = privateData.get(this);
  const vertexEdges = E.get(node);
  if (!vertexEdges) {
    return [];
  }
  return Array.from(vertexEdges.entries()).reduce((edgesInfo, [neighbourNode, weight]) => {
    const neighbourEdges = E.get(neighbourNode);
    return edgesInfo.concat({
      directed: !neighbourEdges || !neighbourEdges.has(node),
      weight,
      vertexes: new Set([node.value, neighbourNode.value]),
    });
  }, []);
}

function $concatEdgeInfos(all, node) {
  return concatDistinct(all, $getVertexEdges.call(this, node), (val1, val2) =>
    all.some(({ vertexes }) => Array.from(val2.vertexes.values()).every((v2) => vertexes.has(v2))),
  );
}

function $genericSearch({ nodeContainer, getNextNode, addNode }) {
  return function genericSearch(node, callback) {
    const { V } = privateData.get(this);
    const marked = new ObjectSet([node]);
    addNode(node);
    while (nodeContainer.size > 0) {
      const currentNode = getNextNode();
      $getVertexEdges.call(this, currentNode).forEach((edgeInfo) => {
        const [neighbour] = Array.from(edgeInfo.vertexes.values()).filter(
          (v) => v !== currentNode.value,
        );
        const neighbourNode = V.get(GraphNode.create(neighbour));
        if (!marked.has(neighbourNode)) {
          marked.add(neighbourNode);
          addNode(neighbourNode);
        }
      });
      if (callback(currentNode)) {
        break;
      }
    }
  };
}

class Graph {
  static create(from) {
    return new Graph(from);
  }

  constructor(from) {
    let initialNodes = from || [];
    if (!Array.isArray(initialNodes) && initialNodes[Symbol.iterator]) {
      initialNodes = Array.from(initialNodes);
    }
    privateData.set(this, {
      V: new ObjectSet(initialNodes.map((value) => GraphNode.create(value))),
      E: new WeakMap(),
    });
  }

  get edges() {
    const { V } = privateData.get(this);
    return Array.from(V.values()).reduce($concatEdgeInfos.bind(this), []);
  }

  get vertexes() {
    const { V } = privateData.get(this);
    return Array.from(V.values()).map((v) => v.value);
  }

  addVertex(value) {
    const { V } = privateData.get(this);
    V.add(GraphNode.create(value));
    return this;
  }

  removeVertex(value) {
    const { V, E } = privateData.get(this);
    const node = V.get(GraphNode.create(value));
    $getVertexEdges.call(this, node).forEach(({ vertexes }) => {
      vertexes.forEach((v) => {
        if (v !== value) {
          const neighbourNode = V.get(GraphNode.create(v));
          E.get(neighbourNode).delete(node);
        }
      });
    });
    V.delete(node);
    E.delete(node);
    return this;
  }

  addEdge(v1, v2, options = DefaultEdgeOptions) {
    const { V } = privateData.get(this);
    const { directed, weight } = options;
    if (!$vertexExists.call(this, v1, v2)) {
      throw new Error('vertex does not exists');
    }
    const node1 = V.get(GraphNode.create(v1));
    const node2 = V.get(GraphNode.create(v2));
    $createEdge.call(this, node1, node2, weight);
    if (!directed) {
      $createEdge.call(this, node2, node1, weight);
    }
    return this;
  }

  removeEdge(v1, v2) {
    const { V, E } = privateData.get(this);
    const node1 = V.get(GraphNode.create(v1));
    const node2 = V.get(GraphNode.create(v2));
    const v1Edges = E.get(node1);
    const v2Edges = E.get(node2);
    if (v1Edges && v1Edges.has(node2)) {
      v1Edges.delete(node2);
      if (v2Edges && v2Edges.has(node1)) {
        v2Edges.delete(node1);
      }
    }
    return this;
  }

  getComponent(value) {
    const values = [];
    this.BFS(value, (reachableVertex) => {
      values.push(reachableVertex);
    });
    return values;
  }

  BFS(value, callback) {
    const { V } = privateData.get(this);
    const nodeContainer = Queue.create();
    const node = V.get(GraphNode.create(value));
    $genericSearch({
      nodeContainer,
      getNextNode: () => nodeContainer.dequeue(),
      addNode: (n) => nodeContainer.enqueue(n),
    }).call(this, node, (currentNode) => callback(currentNode.value));
  }

  augmentedBFS(value, callback) {
    const { V } = privateData.get(this);
    const nodeContainer = Queue.create();
    const node = V.get(GraphNode.create(value));
    let layerIndex = -1;
    const dist = new Map();
    $genericSearch({
      nodeContainer,
      getNextNode: () => {
        const n = nodeContainer.dequeue();
        layerIndex = dist.get(n);
        return n;
      },
      addNode: (n) => {
        dist.set(n, layerIndex + 1);
        nodeContainer.enqueue(n);
      },
    }).call(this, node, (currentNode) => callback(currentNode.value, dist.get(currentNode)));
  }

  DFS(value, callback) {
    const { V } = privateData.get(this);
    const nodeContainer = Stack.create();
    const node = V.get(GraphNode.create(value));
    $genericSearch({
      nodeContainer,
      getNextNode: () => nodeContainer.pop(),
      addNode: (n) => nodeContainer.push(n),
    }).call(this, node, (currentNode) => callback(currentNode.value));
  }

  UCC() {
    const marked = new Set();
    return this.vertexes.reduce((components, vertex) => {
      if (marked.has(vertex)) {
        return components;
      }
      const componentVertexes = new Set();
      this.BFS(vertex, (current) => {
        marked.add(current);
        componentVertexes.add(current);
      });
      return components.concat(componentVertexes);
    }, []);
  }
}

module.exports = Graph;
