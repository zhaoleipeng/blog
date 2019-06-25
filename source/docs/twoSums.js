var twoSum = function (nums, target) {
  let map = new Map()
  for (let [index, element] of nums.entries()) {
    if (map.has(element)) {
      map.get(element).add(index)
    } else {
      map.set(element, new Set([index]))
    }
  }
  for (let [index, element] of nums.entries()) {
    let second = target - element
    const indexs = map.get(second)
    if (indexs) {
      for (let indexNum of [...indexs]) {
        if (indexNum !== index) {
          return [index, indexNum]
        }
      }
    }
  }
};

console.log(twoSum([1,2,3,4], 5))