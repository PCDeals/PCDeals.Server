export function objExec(obj){
  for (let o in obj) {
    if (typeof obj[o] === 'function') {
      obj[o] = obj[o]();
    }
  }

  return obj;
}