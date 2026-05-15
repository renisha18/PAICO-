export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg:         '#09131f',
        'bg-sec':   '#111c2d',
        card:       '#132238',
        'card-lt':  '#1b2d47',
        gold:       '#d4af37',
        'gold-soft':'#f0d36b',
        navy:       '#1e3a5f',
        'navy-lt':  '#2b4f7d',
        cyan:       '#5fd1ff',
        muted:      '#8fa3bf',
        success:    '#32d583',
        danger:     '#ff5c7a',
      },
      fontFamily: {
        display: ['Orbitron', 'monospace'],
        body:    ['Inter', 'sans-serif'],
        mono:    ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    }
  }
}
