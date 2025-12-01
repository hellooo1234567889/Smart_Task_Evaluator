/* BROKEN: Inefficient algorithm
function findDuplicates(arr) {
  const duplicates = []
  
  // BUG: O(n²) complexity - very slow for large arrays
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (i !== j && arr[i] === arr[j]) {
        duplicates.push(arr[i])
      }
    }
  }
  
  return duplicates
}*/
