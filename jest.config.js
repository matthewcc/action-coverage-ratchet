module.exports = {
    clearMocks: true,
    moduleFileExtensions: ['js', 'ts'],
    testEnvironment: 'node',
    testMatch: ['**/*.test.ts'],
    testRunner: 'jest-circus/runner',
    transform: {
        '^.+\\.ts$': 'ts-jest'
    },
    moduleDirectories: ['node_modules', '<rootDir>/'],
    coverageReporters: [
        'text',
        'text-summary',
        'lcov',
        'json-summary'
    ],
    verbose: true
};
