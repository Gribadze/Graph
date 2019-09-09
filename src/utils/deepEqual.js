module.exports = function deepEqual(o1, o2) {
  if (!(o1 instanceof Object)) {
    return o1 === o2;
  }
  return (
    o1 === o2 ||
    (Object.keys(o1).every((prop) => o1[prop] === o2[prop]) &&
      Object.keys(o1).length === Object.keys(o2).length)
  );
};
