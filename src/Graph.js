const concatDistinct = require('./utils/concatDistinct');

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

class Graph {
  static create() {
    return new Graph();
  }

  constructor() {
    privateData.set(this, {
      V: new Set(),
      E: new Map(),
      createEdge: $createEdge.bind(this),
      vertexExists: $vertexExists.bind(this),
      getVertexEdges: $getVertexEdges.bind(this),
      concatEdgeInfos: $concatEdgeInfos.bind(this),
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
}

module.exports = Graph;
