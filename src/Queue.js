const privateData = new WeakMap();

class Queue {
  static create(from) {
    return new Queue(from);
  }

  get size() {
    const { data } = privateData.get(this);
    return data.length;
  }

  get nextVal() {
    const { data } = privateData.get(this);
    return data[0];
  }

  constructor(from = []) {
    const data = Array.isArray(from) ? from : Array.from(from);
    privateData.set(this, {
      data,
    });
  }

  enqueue(value) {
    const { data } = privateData.get(this);
    data.push(value);
    return this;
  }

  dequeue() {
    const { data } = privateData.get(this);
    return data.shift();
  }
}

module.exports = Queue;
