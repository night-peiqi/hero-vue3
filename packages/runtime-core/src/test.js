const arr = [1, 8, 5, 3, 4, 9, 7, 6, 0];
// const arr = [2, 3, 1, 5, 6, 8, 7, 9, 4];

function getSequence(arr) {
  let len = arr.length;
  // result 用于保存最长递增子序列的索引
  const result = [0];
  let start;
  let end;
  // p 用于保存每个元素在最长递增子序列 result 中的前一个元素的索引
  let p = arr.slice(0);

  for (let i = 0; i < len; i++) {
    // arrI 用于保存当前元素的值
    const arrI = arr[i];

    if (arrI !== 0) {
      // 获取 result 中的最后一个元素的索引
      const resultLastIndex = result[result.length - 1];

      // 如果当前元素大于 result 中的最后一个元素，那么就将当前元素添加到 result 中
      if (arr[resultLastIndex] < arrI) {
        /**
         * 根据当前索引 i，在 p 中设置对应项的值，这个值等于 i 在 result 中的前一个元素的索引
         * p 中索引 i 在 result 中的前一个元素的索引
         */
        p[i] = resultLastIndex;
        // 将当前元素的索引添加到 result 中
        result.push(i);
        continue;
      } else {
        // 否则，使用二分查找在 result 中找到当前元素应该插入的位置
        start = 0;
        end = result.length - 1;

        while (start < end) {
          const mid = start + (((end - start) / 2) | 0);

          if (arr[result[mid]] < arrI) {
            start = mid + 1;
          } else {
            end = mid;
          }
        }

        // 如果当前元素小于 result 中的元素，那么就更新 result 和 p
        if (arrI < arr[result[start]]) {
          if (start > 0) {
            p[i] = result[start - 1];
          }
          result[start] = i;
        }
      }
    }
  }

  // 从后向前遍历 result，使用 p 来找到最长递增子序列的具体序列
  let len1 = result.length;
  let last = result[len1 - 1];
  while (len1-- > 0) {
    result[len1] = last;
    last = p[last];
  }
  return result;
}

const result = getSequence(arr);
console.log('result1', result);
const ret = [];
for (let i = 0; i < result.length; i++) {
  ret.push(arr[result[i]]);
}
console.log(ret);

// result = [0], p = []
