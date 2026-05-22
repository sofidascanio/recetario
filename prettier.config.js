export default {
	overrides: [
		{
			files: ['**/*.{js,jsx,ts,tsx}'],
			options: {
				tabWidth: 4,
				useTabs: true,
				semi: true,
				singleQuote: true,
				bracketSpacing: true,
				bracketSameLine: true,
			},
		},
		{
			files: ['**/*.css'],
			options: {
				tabWidth: 4,
				useTabs: true,
			},
		},
	],
};