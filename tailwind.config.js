/** @type {import('tailwindcss').Config} */
import {isolateInsideOfContainer, scopedPreflightStyles} from 'tailwindcss-scoped-preflight';

module.exports = {
	content: ["./src/**/*.{html,js,ts,tsx,jsx}", "main.ts"],
	theme: {
		extend: {},
	},
	plugins: [
		scopedPreflightStyles({
			isolationStrategy: isolateInsideOfContainer('.twp', {
				except: '.no-twp', // optional, to exclude some elements under .twp from being preflighted, like external markup
			}),
		}),

	],
	corePlugins: {
		preflight: false,
	},
	important: true
}

