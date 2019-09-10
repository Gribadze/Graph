const GraphNode = require('../GraphNode');

describe('GraphNode test', () => {
  it('should create new instance', () => {
    expect(GraphNode.create()).toBeInstanceOf(GraphNode);
  });
  it('should get value', () => {
    const testVal = {};
    const graphNode = GraphNode.create(testVal);
    expect(graphNode.value).toBe(testVal);
  });
  it('should set value without throw', () => {
    const testVal = {};
    const graphNode = GraphNode.create();
    const fn = () => {
      graphNode.value = testVal;
    };
    expect(fn).not.toThrow();
    expect(graphNode.value).toBe(testVal);
  });
});
