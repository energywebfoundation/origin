module.exports = {
    preset: 'ts-jest',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'node', 'json'],
    testMatch: ['**/__tests__/*.test.(ts|tsx|js)'],
    roots: ['<rootDir>/src'],
    moduleNameMapper: {
        '\\.(css|less|sass|scss)$': '<rootDir>/src/__tests__/config/mocks/styleMock.js',
        '\\.(gif|ttf|eot|svg)$': '<rootDir>/src/__tests__/config/mocks/fileMock.js'
    },
    setupFilesAfterEnv: ['jest-enzyme'],
    testEnvironment: 'enzyme',
    globals: {
        'ts-jest': {
            tsConfig: 'tsconfig.build.json'
        }
    }
};
