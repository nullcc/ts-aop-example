export const compose = async (middlewares) => {
  if (!Array.isArray(middlewares)) {
    throw new TypeError('Middlewares must be a array!');
  }
  for (const fn of middlewares) {
    if (typeof fn !== 'function') {
      throw new TypeError('Middlewares must be composed of functions!');
    }
  }

  
};
