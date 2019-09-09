const concatDistinct = require('./utils/concatDistinct');
const Queue = require('./Queue');

const DefaultEdgeOptions = {
  directed: false,
  weight: 1,
};

const privateData = new WeakMap();

function $createEdge(v1, v2, weight) {
  const { E } = privateData.get(this);
  const edges = E.get(v1) || new Map();
  E.set(v1, edges.set(v2, weight));
}

function $vertexExists(...vertexes) {
  const { V } = privateData.get(this);
  return vertexes.every((v) => V.has(v));
}

function $getVertexEdges(vertex) {
  const { E } = privateData.get(this);
  const vertexEdges = E.get(vertex);
  if (!vertexEdges) {
    return [];
  }
  return Array.from(vertexEdges.entries()).reduce((edgesInfo, [neighbour, weight]) => {
    const neighbourEdges = E.get(neighbour);
    return edgesInfo.concat({
      directed: !neighbourEdges || !neighbourEdges.has(vertex),
      weight,
      vertexes: new Set([vertex, neighbour]),
    });
  }, []);
}

function $concatEdgeInfos(all, vertex) {
  const { getVertexEdges } = privateData.get(this);
  return concatDistinct(all, getVertexEdges(vertex), (val1, val2) =>
    all.some((v) => Array.from(val2.vertexes.values()).every((v2) => v.vertexes.has(v2))),
  );
}

function $genericSearch(vertex, callback, marked = []) {
  const { getVertexEdges } = privateData.get(this);
  getVertexEdges(vertex).forEach((edgeInfo) => {
    const [neighbour] = Array.from(edgeInfo.vertexes.values()).filter((v) => !marked.includes(v));
    if (neighbour) {
      marked.push(neighbour);
      callback(neighbour);
      $genericSearch.call(this, neighbour, callback, marked);
    }
  });
}

function $BFS(vertex, callback) {
  const { getVertexEdges } = privateData.get(this);
  const marked = [vertex];
  const dist = new Map([[vertex, 0]]);
  const vertexQueue = Queue.create([vertex]);
  while (vertexQueue.size > 0) {
    const currentVertex = vertexQueue.dequeue();
    getVertexEdges(currentVertex).forEach(({ vertexes }) => {
      const [neighbour] = Array.from(vertexes.values()).filter((v) => v !== currentVertex);
      if (!marked.includes(neighbour)) {
        marked.push(neighbour);
        dist.set(neighbour, dist.get(currentVertex) + 1);
        vertexQueue.enqueue(neighbour);
      }
    });
    if (callback(currentVertex, dist.get(currentVertex))) {
      break;
    }
  }
}

class Graph {
  static create(from) {
    return new Graph(from);
  }

  constructor(from) {
    privateData.set(this, {
      V: new Set(from),
      E: new Map(),
      createEdge: $createEdge.bind(this),
      vertexExists: $vertexExists.bind(this),
      getVertexEdges: $getVertexEdges.bind(this),
      concatEdgeInfos: $concatEdgeInfos.bind(this),
      genericSearch: $genericSearch.bind(this),
      BFS: $BFS.bind(this),
    });
  }

  get edges() {
    const { concatEdgeInfos } = privateData.get(this);
    return this.vertexes.reduce(concatEdgeInfos, []);
  }

  get vertexes() {
    const { V } = privateData.get(this);
    return Array.from(V.values());
  }

  addVertex(value) {
    const { V } = privateData.get(this);
    V.add(value);
    return this;
  }

  removeVertex(value) {
    const { V, E, getVertexEdges } = privateData.get(this);
    getVertexEdges(value).forEach(({ vertexes }) => {
      vertexes.forEach((v) => {
        if (v !== value) {
          E.get(v).delete(value);
        }
      });
    });
    V.delete(value);
    E.delete(value);
    return this;
  }

  addEdge(v1, v2, options = DefaultEdgeOptions) {
    const { vertexExists, createEdge } = privateData.get(this);
    const { directed, weight } = options;
    if (!vertexExists(v1, v2)) {
      throw new Error('vertex does not exists');
    }
    createEdge(v1, v2, weight);
    if (!directed) {
      createEdge(v2, v1, weight);
    }
    return this;
  }

  removeEdge(v1, v2) {
    const { E } = privateData.get(this);
    const v1Edges = E.get(v1);
    const v2Edges = E.get(v2);
    if (v1Edges && v1Edges.has(v2)) {
      v1Edges.delete(v2);
      if (v2Edges && v2Edges.has(v1)) {
        v2Edges.delete(v1);
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

  BFS(vertex, callback) {
    const { BFS } = privateData.get(this);
    BFS(vertex, callback);
  }
}

module.exports = Graph;
