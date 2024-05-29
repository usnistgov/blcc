/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
    theme: {
        extend: {
            colors: {
                "off-white": "#FAFAFA",
                "base-lightest": "#F0F0F0",
                "base-lighter": "#DFE1E2",
                "base-light": "#A9AEB1",
                base: "#71767A",
                "base-dark": "#565C65",
                "base-darker": "#3D4551",
                ink: "#1B1B1B",
                primary: "#005EA2",
                "primary-light": "#73B3E7",
                "primary-dark": "#1A4480",
                "success-lighter": "#ECF3EC",
                "success-light": "#70E17B",
                success: "#00A91C",
                "success-dark": "#4D8055",
                "success-darker": "#446443",
                "error-lighter": "#F4E3DB",
                "error-light": "#F39268",
                error: "#D54309",
                "error-dark": "#B50909",
                "error-darker": "#6F3331",
                visited: "#551A8B"
            }
        }
    },
    plugins: []
};
