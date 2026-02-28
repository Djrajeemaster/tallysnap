// stub for expo-text-recognition when native module is unavailable
// exports a recognizeText function that returns an empty result
module.exports = {
  recognizeText: async (uri) => {
    // return a structure similar to the native module
    return { lines: [] };
  },
};
