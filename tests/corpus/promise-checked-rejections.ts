Promise.reject("bad").catch((reason: unknown) => console.log(reason));
Promise.reject(42).catch((reason: unknown) => console.log(reason));
Promise.reject(null).catch((reason: unknown) => console.log(reason));
