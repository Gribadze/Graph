module.exports = function concatDistinct(arr1, arr2, predicate = (val1, val2) => val1 === val2) {
  return arr1.concat(arr2.filter((val2) => !arr1.some((val1) => predicate(val1, val2))));
};
