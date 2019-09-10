// eslint-disable-next-line max-classes-per-file
const concatDistinct = require('./utils/concatDistinct');
const GraphNode = require('./GraphNode');
const ObjectSet = require('./ObjectSet');
const Queue = require('./Queue');
const Stack = require('./Stack');

const DefaultEdgeOptions = {
  directed: false,
  weight: 1,
};

const SearchAlgorithm = {
  BFS: {
    Container: {
      type: Queue,
      prototype: {
        add: Queue.prototype.enqueue,
        remove: Queue.prototype.dequeue,
      },
    },
    toString() {
      return 'BFS';
    },
  },
  DFS: {
    Container: Object.assign(() => {}, {
      create: Stack.create,
      prototype: Object.create({
        add: Stack.prototype.push,
        remove: Stack.prototype.pop,
        isEmpty() {
          return this.size === 0;
        },
      }),
    }),
    toString() {
      return 'DFS';
    },
  },
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
  const { getVertexEdges } = privateData.get(this);
  return concatDistinct(all, getVertexEdges(node), (val1, val2) =>
    all.some(({ vertexes }) => Array.from(val2.vertexes.values()).every((v2) => vertexes.has(v2))),
  );
}

function $getAlgorithmContainer(searchAlgorithmName) {
  const { Container } = SearchAlgorithm[searchAlgorithmName];
  if (!Container) {
    throw new Error(`${searchAlgorithmName} have no Container description`);
  }
  return class ContainerType extends Container.type {
    static create(...args) {
      return new ContainerType(...args);
    }

    // eslint-disable-next-line no-useless-constructor
    constructor(...args) {
      super(...args);
    }

    add(...args) {
      return Container.prototype.add.apply(this, args);
    }

    remove(...args) {
      return Container.prototype.remove.apply(this, args);
    }

    isEmpty() {
      return this.size === 0;
    }
  };
}

// eslint-disable-next-line no-unused-vars
function $genericSearch(searchAlgorithmName) {
  return function genericSearch(value, callback) {
    const { V, getVertexEdges } = privateData.get(this);
    const node = V.get(GraphNode.create(value));
    const marked = new ObjectSet([node]);
    const Container = $getAlgorithmContainer(searchAlgorithmName);
    const nodeContainer = Container.create(marked);
    while (!nodeContainer.isEmpty()) {
      const currentNode = nodeContainer.remove();
      getVertexEdges(currentNode).forEach((edgeInfo) => {
        const [neighbour] = Array.from(edgeInfo.vertexes.values()).filter(
          (v) => v !== currentNode.value,
        );
        const neighbourNode = V.get(GraphNode.create(neighbour));
        if (!marked.has(neighbourNode)) {
          marked.add(neighbourNode);
          nodeContainer.add(neighbourNode);
        }
      });
      if (callback(currentNode.value)) {
        break;
      }
    }
  };
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

function $DFS(value, callback) {
  const { V, getVertexEdges } = privateData.get(this);
  const node = V.get(GraphNode.create(value));
  const marked = new ObjectSet([node]);
  const nodeStack = Stack.create(marked);
  while (nodeStack.size > 0) {
    const currentNode = nodeStack.pop();
    getVertexEdges(currentNode).forEach(({ vertexes }) => {
      const [neighbour] = Array.from(vertexes.values()).filter((v) => v !== currentNode.value);
      const neighbourNode = V.get(GraphNode.create(neighbour));
      if (!marked.has(neighbourNode)) {
        marked.add(neighbourNode);
        nodeStack.push(neighbourNode);
      }
    });
    if (callback(currentNode.value)) {
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
      BFS: $BFS.bind(this),
      DFS: $DFS.bind(this),
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
    const { BFS } = privateData.get(this);
    const vertexes = [];
    BFS(vertex, (reachableVertex) => {
      vertexes.push(reachableVertex);
    });
    return vertexes;
  }

  BFS(value, callback) {
    const { BFS } = privateData.get(this);
    BFS(value, callback);
  }

  DFS(value, callback) {
    const { DFS } = privateData.get(this);
    DFS(value, callback);
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
