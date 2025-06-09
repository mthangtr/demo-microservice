export default {
  displayName: 'cart-e2e',
  preset: '../../jest.preset.js',
  globalSetup: '<rootDir>/shared/support/global-setup.ts',
  globalTeardown: '<rootDir>/shared/support/global-teardown.ts',
  setupFiles: ['<rootDir>/shared/support/test-setup.ts'],
  testEnvironment: 'node',
  transform: {
    '^.+\\.[tj]s$': [
      'ts-jest',
      {
        tsconfig: '<rootDir>/tsconfig.spec.json',
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'html'],
  coverageDirectory: '../../coverage/cart-e2e',
};
