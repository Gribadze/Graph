const DefaultEdgeOptions = {
  direction: 0,
  weight: 1,
};

const privateData = new WeakMap();

function createEdge(v1, v2, weight) {
  const { E } = privateData.get(this);
  const edges = E.get(v1) || new Map();
  E.set(v1, edges.set(v2, weight));
}

function vertexExists(...vertexes) {
  const { V } = privateData.get(this);
  return vertexes.every((v) => V.has(v));
}

class Graph {
  static create() {
    return new Graph();
  }

  constructor() {
    privateData.set(this, {
      V: new Set(),
      E: new Map(),
    });
  }

  get edges() {
    const { E } = privateData.get(this);
    return Array.from(E.entries()).reduce(
      (all, [v1, m]) => all.concat(
        Array.from(m.entries()).reduce((vertexEdges, [v2, weight]) => {
          if (
            all.find(
              (edgeInfo) => edgeInfo.vertexes.has(v1) && edgeInfo.vertexes.has(v2),
            )
          ) {
            return vertexEdges;
          }
          const v2Edges = E.get(v2);
          return vertexEdges.concat({
            directed: !v2Edges || !v2Edges.has(v1),
            weight,
            vertexes: new Set([v1, v2]),
          });
        }, []),
      ),
      [],
    );
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
    const { direction, weight } = options;
    if (!vertexExists.call(this, v1, v2)) {
      throw new Error('vertex does not exists');
    }
    if (direction >= 0) {
      createEdge.call(this, v1, v2, weight);
    }
    if (direction <= 0) {
      createEdge.call(this, v2, v1, weight);
    }
    return this;
  }
}

module.exports = Graph;
