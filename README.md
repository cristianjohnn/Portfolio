# Portfolio - Cristian John Noroño

A GitHub-style interactive portfolio showcasing your background in Computer Engineering, embedded systems, and the GESTURA project.

## Quick Start

1. Open `index.html` in your browser, or
2. Use a simple local server:
   ```bash
   # Python
   python -m http.server 8000

   # Node (if you have npx)
   npx serve .
   ```
3. Visit `http://localhost:8000`

## Features

- **GitHub-inspired design** — Dark/light themes, repo-style cards, stats bar
- **Responsive** — Works on desktop and mobile
- **Theme toggle** — Persists preference in localStorage
- **Sections** — Profile, Featured Project (GESTURA), Skills, Currently Learning, Contact

## Customization

- **Avatar**: Replace the `.avatar-placeholder` div with an `<img>` if you have a profile photo
- **Content**: Edit `index.html` to update any text, skills, or projects
- **Colors**: Modify CSS variables in `:root` and `[data-theme="light"]` in `styles.css`
