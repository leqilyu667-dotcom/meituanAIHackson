export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fbf7f4',
          100: '#F3E6DD',
          200: '#ead7ca',
          300: '#dfc5b4',
          400: '#D9B8A0',
          500: '#D9B8A0',
          600: '#B98D72',
          700: '#9c725a'
        },
        ink: '#2F2A26',
        cream: '#F8F6F4',
        blush: '#F3E6DD',
        cocoa: '#8E827A',
        champagne: '#D9B8A0',
        divider: '#ECE7E2',
        placeholder: '#C6BBB3',
        success: '#8FAE8B',
        warning: '#D9A15B',
        error: '#D27C7C'
      },
      boxShadow: {
        soft: '0 4px 20px rgba(0, 0, 0, 0.04)',
        card: '0 8px 24px rgba(0, 0, 0, 0.06)',
        glow: '0 8px 24px rgba(185, 141, 114, 0.18)'
      },
      borderRadius: {
        '4xl': '2rem'
      }
    }
  },
  plugins: []
}
