const Stack = require('../Stack');

describe('Stack tests', () => {
  it('Stack.create() should return new instance', () => {
    const stack = Stack.create();
    expect(stack).toBeInstanceOf(Stack);
  });
  it('size getter test', () => {
    const stack1 = Stack.create();
    const stack2 = Stack.create([1, 2]);
    const stack3 = Stack.create(new Set([1, 2]).values());
    expect(stack1.size).toBe(0);
    expect(stack2.size).toBe(2);
    expect(stack3.size).toBe(2);
  });
  it('top getter test', () => {
    const stack1 = Stack.create();
    const stack2 = Stack.create([1, 2]);
    expect(stack1.top).toBeUndefined();
    expect(stack2.top).toBe(2);
  });
  it('push() should put value and return stack instance', () => {
    const stack = Stack.create().push(1);
    expect(stack.size).toBe(1);
    expect(stack.push(2)).toBe(stack);
  });
  it('pop() should pop value', () => {
    const stack = Stack.create().push(1);
    expect(stack.pop()).toBe(1);
    expect(stack.size).toBe(0);
  });
});
