export default function fixedCharAt(str: string, idx: number) {
  str = String(str);

  const surrogatePairs = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
  while (surrogatePairs.exec(str) !== null) {
    const lastIdx = surrogatePairs.lastIndex;
    if (lastIdx - 2 < idx) {
      idx++;
    } else {
      break;
    }
  }

  if (idx >= str.length || idx < 0) {
    return "";
  }

  let ret = str.charAt(idx);

  if (/[\uD800-\uDBFF]/.test(ret) && /[\uDC00-\uDFFF]/.test(str.charAt(idx + 1))) {
    // Go one further, since one of the "characters" is part of a surrogate pair
    ret += str.charAt(idx + 1);
  }
  return ret;
}
