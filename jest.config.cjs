// jest.config.js   (⚠️ CommonJS because Jest reads it before ESM kicks in)
module.exports = {
    testEnvironment: 'jsdom',
    
    transform: {},                    // no Babel needed for plain JS
  };
  