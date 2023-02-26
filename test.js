import produce from 'immer';

const init = {
  c: 1,
};

const a = {
  b: init,
};

const aUpdate = produce(a, (draft) => {
  draft[0].b = draft[1].b;
});

// console.log(a[0].b === aUpdate[0].b);

function shallowEqual(objA, objB) {
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  for (let i = 0; i < keysA.length; i++) {
    const currentKey = keysA[i];
    if (
      !Object.hasOwnProperty.call(objB, currentKey) ||
      !Object.is(objA[currentKey], objB[currentKey])
    ) {
      return false;
    }
  }

  return true;
}

console.log(Object.hasOwnProperty.call(aUpdate, '1'));
