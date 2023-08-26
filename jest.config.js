module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/lib/__tests__'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
