const Queue = require('./Queue');

describe('Queue tests', () => {
  it('Queue.create() should return new instance', () => {
    const queue = Queue.create();
    expect(queue).toBeInstanceOf(Queue);
  });
  it('size getter test', () => {
    const queue1 = Queue.create();
    const queue2 = Queue.create([1, 2]);
    const queue3 = Queue.create(new Set([1, 2]).values());
    expect(queue1.size).toBe(0);
    expect(queue2.size).toBe(2);
    expect(queue3.size).toBe(2);
  });
  it('nextVal getter test', () => {
    const queue1 = Queue.create();
    const queue2 = Queue.create([1, 2]);
    expect(queue1.nextVal).toBeUndefined();
    expect(queue2.nextVal).toBe(1);
  });
  it('enqueue() should put value and return queue instance', () => {
    const queue = Queue.create().enqueue(1);
    expect(queue.size).toBe(1);
    expect(queue.enqueue(2)).toBe(queue);
  });
  it('dequeue() should dequeue value', () => {
    const queue = Queue.create()
      .enqueue(1)
      .enqueue(2);
    expect(queue.dequeue()).toBe(1);
    expect(queue.size).toBe(1);
  });
});
