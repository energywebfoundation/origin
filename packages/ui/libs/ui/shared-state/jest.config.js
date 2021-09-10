module.exports = {
  displayName: 'ui-shared-state',
  preset: '../../../jest.preset.js',
  transform: {
    '^.+\\.[tj]sx?$': 'babel-jest',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  coverageDirectory: '../../../coverage/libs/ui/shared-state',
  resetMocks: false,
  automock: false,
  setupFiles: ['./setupJest.js', 'jest-localstorage-mock'],
};
