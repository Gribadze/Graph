const privateData = new WeakMap();

class Stack {
  static create(from) {
    return new Stack(from);
  }

  get size() {
    const { data } = privateData.get(this);
    return data.length;
  }

  get top() {
    const { data } = privateData.get(this);
    return data[data.length - 1];
  }

  constructor(from = []) {
    const data = Array.isArray(from) ? from : Array.from(from);
    privateData.set(this, {
      data,
    });
  }

  pop() {
    const { data } = privateData.get(this);
    return data.pop();
  }

  push(value) {
    const { data } = privateData.get(this);
    data.push(value);
    return this;
  }
}

module.exports = Stack;
