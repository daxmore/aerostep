/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                aero: {
                    bg: '#F2F2F2',
                    surface: '#FFFFFF',
                    text: '#0F1720',
                    primary: '#0057FF',
                    accent: '#FF3131',
                    dark: '#0F1720',
                    'dark-card': '#0F1720'
                }
            }
        },
    },
    plugins: [],
}
