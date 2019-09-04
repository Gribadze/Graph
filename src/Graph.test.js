const Graph = require('./Graph');

describe('Graph tests', () => {
  it('Graph.create() should return new instance', () => {
    expect(Graph.create()).toBeInstanceOf(Graph);
  });
  it('get vertexes() should return array of vertexes', () => {
    const graph = Graph.create();
    expect(graph.vertexes).toHaveLength(0);
    graph.addVertex(1);
    expect(graph.vertexes).toHaveLength(1);
    expect(graph.vertexes[0]).toBe(1);
  });
  it('get edges() should return array of edges', () => {
    const graph = Graph.create()
      .addVertex(1)
      .addVertex(2)
      .addEdge(1, 2);
    expect(graph.edges).toHaveLength(1);
    graph.addEdge(2, 1);
    expect(graph.edges).toHaveLength(1);
    expect(graph.edges[0]).toHaveProperty('directed', false);
    expect(graph.edges[0]).toHaveProperty('weight', 1);
    expect(graph.edges[0]).toHaveProperty('vertexes');
    expect(graph.edges[0].vertexes.has(1)).toBe(true);
    expect(graph.edges[0].vertexes.has(2)).toBe(true);
    graph.addVertex(3).addEdge(3, 1);
    expect(graph.edges).toHaveLength(2);
  });
  it('addVertex() test', () => {
    const graph = Graph.create();
    const fn = () => graph.addVertex(1);
    expect(fn).not.toThrow();
    expect(fn).not.toThrow();
    expect(graph.vertexes).toHaveLength(1);
    expect(graph.addVertex(1)).toBe(graph);
  });
  it('addEdge() test', () => {
    const graph = Graph.create()
      .addVertex(1)
      .addVertex(2);
    const fn = () => graph.addEdge(1, 2);
    expect(fn).not.toThrow();
    expect(fn).not.toThrow();
    expect(graph.addEdge(1, 2)).toBe(graph);
  });
  it('addEdge() with options test', () => {
    const graph = Graph.create()
      .addVertex(1)
      .addVertex(2)
      .addEdge(1, 2, { direction: 1, weight: 2 });
    expect(graph.edges[0]).toHaveProperty('weight', 2);
    expect(graph.edges[0]).toHaveProperty('directed', true);
  });
});
