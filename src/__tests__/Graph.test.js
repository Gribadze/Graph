const Graph = require('../Graph');

describe('Graph tests', () => {
  it('Graph.create() should return new instance', () => {
    expect(Graph.create()).toBeInstanceOf(Graph);
  });
  it('Graph.create() should add vertexes from iterable object', () => {
    const graph1 = Graph.create([1]);
    const graph2 = Graph.create(new Set([2]).values());
    const graph3 = Graph.create(new Set([3]));
    expect(graph1.vertexes).toContain(1);
    expect(graph2.vertexes).toContain(2);
    expect(graph3.vertexes).toContain(3);
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
      .addEdge(1, 2, { directed: true, weight: 2 });
    expect(graph.edges[0]).toHaveProperty('weight', 2);
    expect(graph.edges[0]).toHaveProperty('directed', true);
  });
  it('addEdge() should throw Error with absent vertexes', () => {
    const fn = () => Graph.create().addEdge(1, 2);
    expect(fn).toThrow();
  });
  it('removeEdge() test', () => {
    const graph = Graph.create()
      .addVertex(1)
      .addVertex(2)
      .addEdge(1, 2)
      .removeEdge(1, 2);
    expect(graph.edges).toHaveLength(0);
    graph.addEdge(1, 2);
    expect(graph.removeEdge(2, 1)).toBe(graph);
    expect(graph.edges).toHaveLength(0);
  });
  it('removeEdge() directed test', () => {
    const graph = Graph.create()
      .addVertex(1)
      .addVertex(2)
      .addEdge(1, 2, { directed: true })
      .removeEdge(2, 1);
    expect(graph.edges).toHaveLength(1);
    graph.removeEdge(1, 2);
    expect(graph.edges).toHaveLength(0);
  });
  it('removeVertex() test', () => {
    const graph = Graph.create()
      .addVertex(1)
      .addVertex(2)
      .removeVertex(1);
    expect(graph.vertexes).toHaveLength(1);
    expect(graph.vertexes[0]).toBe(2);
  });
  it('removeVertex() should decrease edges', () => {
    const graph = Graph.create([1, 2, 3, 4]).addEdge(1, 2);
    graph.removeVertex(1);
    expect(graph.edges).toHaveLength(0);
  });
  it('getComponent() should return vertexes of graph component', () => {
    const graph = Graph.create([1, 2, 3, 4])
      .addEdge(1, 2)
      .addEdge(1, 3);
    const component = graph.getComponent(3);
    expect(component).toHaveLength(3);
  });
  it('BFS() should iterate reachable vertexes and stop if callback returns true', () => {
    const mockCallback = jest.fn();
    const mockCallbackWithReturn = jest
      .fn()
      .mockReturnValueOnce(undefined)
      .mockReturnValue(true);
    const graph = Graph.create([1, 2, 3, 4])
      .addEdge(1, 2)
      .addEdge(1, 3);
    graph.BFS(1, mockCallback);
    expect(mockCallback).toHaveBeenCalledTimes(3);
    graph.BFS(1, mockCallbackWithReturn);
    expect(mockCallbackWithReturn).toHaveBeenCalledTimes(2);
  });
  it('BFS() callback should been called with node value', () => {
    const mockCallback = jest.fn();
    const graph = Graph.create([1, 2, 3, 4])
      .addEdge(1, 2)
      .addEdge(2, 3)
      .addEdge(1, 4);
    graph.BFS(1, mockCallback);
    expect(mockCallback).toHaveBeenNthCalledWith(1, 1);
    expect(mockCallback).toHaveBeenNthCalledWith(2, 2);
    expect(mockCallback).toHaveBeenNthCalledWith(3, 4);
    expect(mockCallback).toHaveBeenNthCalledWith(4, 3);
  });
  it('augmentedBFS() callback should been called with node value and layer index', () => {
    const mockCallback = jest.fn();
    const graph = Graph.create([1, 2, 3, 4])
      .addEdge(1, 2)
      .addEdge(2, 3)
      .addEdge(1, 4);
    graph.augmentedBFS(1, mockCallback);
    expect(mockCallback).toHaveBeenNthCalledWith(1, 1, 0);
    expect(mockCallback).toHaveBeenNthCalledWith(2, 2, 1);
    expect(mockCallback).toHaveBeenNthCalledWith(3, 4, 1);
    expect(mockCallback).toHaveBeenNthCalledWith(4, 3, 2);
  });
  it('DFS() callback should iterate vertexes', () => {
    const mockCallback = jest.fn();
    const graph = Graph.create([1, 2, 3, 4, 5])
      .addEdge(1, 4)
      .addEdge(2, 3)
      .addEdge(3, 5)
      .addEdge(1, 2);
    graph.DFS(1, mockCallback);
    expect(mockCallback).toHaveBeenNthCalledWith(1, 1);
    expect(mockCallback).toHaveBeenNthCalledWith(2, 2);
    expect(mockCallback).toHaveBeenNthCalledWith(3, 3);
    expect(mockCallback).toHaveBeenNthCalledWith(4, 5);
    expect(mockCallback).toHaveBeenNthCalledWith(5, 4);
  });
  it('UCC() should return array of graph components', () => {
    const graph = Graph.create([1, 2, 3, 4]);
    expect(graph.UCC()).toHaveLength(4);
    graph.addEdge(1, 2);
    const components = graph.UCC();
    expect(components).toHaveLength(3);
    expect(components[0]).toContain(1);
    expect(components[0]).toContain(2);
  });
  it('Graph.configure should return graph builder', () => {
    expect(Graph.configure()).toHaveProperty('build');
    const graph1 = Graph.configure({ directed: true }).build();
    const graph2 = Graph.configure({ directed: true }).build([1]);
    expect(graph1.vertexes).toHaveLength(0);
    expect(graph2.vertexes).toHaveLength(1);
  });
  it('Should configure graph', () => {
    const graph = Graph.configure({ directed: true, weight: 2 })
      .build([1, 2])
      .addEdge(1, 2);
    expect(graph.edges[0]).toHaveProperty('directed', true);
    expect(graph.edges[0]).toHaveProperty('weight', 2);
  });
});
