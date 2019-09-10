class GraphNode {
  static create(value) {
    return new GraphNode(value);
  }

  constructor(value) {
    this.value = value;
  }
}

module.exports = GraphNode;
