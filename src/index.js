const Graph = require('./Graph');

const graph = Graph.configure({ directed: true })
  .build(
    Array(11)
      .fill(null)
      .map((_, i) => 11 - i),
  )
  .addEdge(1, 3)
  .addEdge(3, 5)
  .addEdge(5, 1)
  .addEdge(8, 6)
  .addEdge(6, 10)
  .addEdge(10, 8)
  .addEdge(9, 4)
  .addEdge(9, 2)
  .addEdge(2, 4)
  .addEdge(4, 7)
  .addEdge(7, 9)
  .addEdge(3, 11)
  .addEdge(5, 9)
  .addEdge(5, 7)
  .addEdge(7, 9)
  .addEdge(11, 6)
  .addEdge(11, 8)
  .addEdge(9, 8)
  .addEdge(2, 10);

console.log(graph.TopoSort());
