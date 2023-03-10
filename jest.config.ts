/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	testMatch: ['**/**/*.test.ts'],
	forceExit: true,
	verbose: true,
	coverageThreshold: {
		global: {
			lines: 90,
		},
		'./src/**/*.ts': {
			lines: 80,
		},
	},
};
