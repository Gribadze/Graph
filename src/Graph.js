const concatDistinct = require('./utils/concatDistinct');
const GraphNode = require('./GraphNode');
const ObjectSet = require('./ObjectSet');
const Queue = require('./Queue');

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
    // noinspection JSCheckFunctionSignatures
    return edgesInfo.concat({
      directed: !neighbourEdges || !neighbourEdges.has(node),
      weight,
      vertexes: new Set([node.value, neighbourNode.value]),
    });
  }, []);
}

function $concatEdgeInfos(all, node) {
  const { getVertexEdges } = privateData.get(this);
  return concatDistinct(all, getVertexEdges(node), (val1, val2) =>
    all.some(({ vertexes }) => Array.from(val2.vertexes.values()).every((v2) => vertexes.has(v2))),
  );
}

function $genericSearch(value, callback, marked = []) {
  const { V, getVertexEdges } = privateData.get(this);
  const node = V.get(GraphNode.create(value));
  getVertexEdges(node).forEach((edgeInfo) => {
    const [neighbour] = Array.from(edgeInfo.vertexes.values()).filter((v) => !marked.includes(v));
    if (neighbour) {
      marked.push(neighbour);
      callback(neighbour);
      $genericSearch.call(this, neighbour, callback, marked);
    }
  });
}

function $BFS(value, callback) {
  const { V, getVertexEdges } = privateData.get(this);
  const node = V.get(GraphNode.create(value));
  const marked = new ObjectSet([node]);
  const dist = new Map([[node, 0]]);
  const nodeQueue = Queue.create([node]);
  while (nodeQueue.size > 0) {
    const currentNode = nodeQueue.dequeue();
    getVertexEdges(currentNode).forEach(({ vertexes }) => {
      const [neighbour] = Array.from(vertexes.values()).filter((v) => v !== currentNode.value);
      const neighbourNode = V.get(GraphNode.create(neighbour));
      if (!marked.has(neighbourNode)) {
        marked.add(neighbourNode);
        dist.set(neighbourNode, dist.get(currentNode) + 1);
        nodeQueue.enqueue(neighbourNode);
      }
    });
    if (callback(currentNode.value, dist.get(currentNode))) {
      break;
    }
  }
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
    // noinspection JSCheckFunctionSignatures
    privateData.set(this, {
      V: new ObjectSet(initialNodes.map((value) => GraphNode.create(value))),
      E: new WeakMap(),
      createEdge: $createEdge.bind(this),
      vertexExists: $vertexExists.bind(this),
      getVertexEdges: $getVertexEdges.bind(this),
      concatEdgeInfos: $concatEdgeInfos.bind(this),
      genericSearch: $genericSearch.bind(this),
      BFS: $BFS.bind(this),
    });
  }

  get edges() {
    const { V, concatEdgeInfos } = privateData.get(this);
    return Array.from(V.values()).reduce(concatEdgeInfos, []);
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
    const { V, E, getVertexEdges } = privateData.get(this);
    const node = V.get(GraphNode.create(value));
    getVertexEdges(node).forEach(({ vertexes }) => {
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
    const { V, vertexExists, createEdge } = privateData.get(this);
    const { directed, weight } = options;
    if (!vertexExists(v1, v2)) {
      throw new Error('vertex does not exists');
    }
    const node1 = V.get(GraphNode.create(v1));
    const node2 = V.get(GraphNode.create(v2));
    createEdge(node1, node2, weight);
    if (!directed) {
      createEdge(node2, node1, weight);
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

  getComponent(vertex) {
    const { genericSearch } = privateData.get(this);
    const vertexes = [];
    genericSearch(vertex, (reachableVertex) => vertexes.push(reachableVertex));
    return vertexes;
  }

  BFS(value, callback) {
    const { BFS } = privateData.get(this);
    BFS(value, callback);
  }
}

module.exports = Graph;
