const plugin = require('tailwindcss/plugin');

const rotateX = plugin(function ({ addUtilities }) {
    addUtilities({
        '.rotate-y-180': {
            transform: 'rotateY(180deg)',
        }
    });
});

module.exports = {
    content: [
        './blog-ui/views/**/*.ejs',
        './blog-ui/public/src/**/*.{css,js,ts,jsx,tsx}',
        "./node_modules/preline/dist/*.js"
    ],

    darkMode: 'class',
    theme: { },

    plugins: [
        require('@tailwindcss/line-clamp'),
        rotateX,
        require('@tailwindcss/typography')
    ]
};
