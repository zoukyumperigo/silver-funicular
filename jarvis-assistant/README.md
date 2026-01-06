# ⚡ JARVIS - AI Production Assistant

> A powerful Windows desktop application for elite creators and builders. Maximize deep work, eliminate context switching, and centralize your AI toolkit.

![Platform](https://img.shields.io/badge/Platform-Windows-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🎯 Overview

**JARVIS** is your personal AI production assistant, inspired by Tony Stark's JARVIS. It combines:
- **AI Tool Hub** - Centralized access to ChatGPT, Claude, Gemini, and more
- **Pomodoro Timer** - Focus sessions with ancient wisdom quotes
- **Prompt Library** - Organize and manage your AI prompts
- **Quick Modes** - One-click workflows for SaaS, Video, Ebook, and more
- **Productivity Analytics** - Track your deep work sessions

---

## ✨ Features

### 🤖 AI Tool Hub
- Quick access to your favorite AI tools
- Categorize by: Text, Image, Video, Code
- Mark favorites for instant access
- Add custom AI tool URLs

### ⏱️ Pomodoro & Deep Work
- Preset timers: 25, 50, 90 minutes
- Visual progress tracking
- Session history and analytics
- Break reminders

### 📿 Wisdom & Discipline Engine
Display motivational quotes at session start/end from:
- **Islam** - Arabic text with transliteration & Portuguese translation
- **Ancient Greece** - Timeless philosophy from Aristotle, Plato
- **Ancient Rome** - Stoic wisdom from Marcus Aurelius, Seneca

### 📝 Prompt Library
- Create, edit, and organize prompts
- Categories: Code, Copywriting, Video, Ebook, Business, Social Media
- Tag-based organization
- Full-text search
- One-click copy to clipboard

### 🚀 Project Quick Modes
Pre-configured workflows:
- **💻 SaaS** - Build software products (90 min focus)
- **🎬 Video** - Create video content (50 min focus)
- **📚 Ebook** - Write and publish (90 min focus)
- **📱 Social Media** - Content creation (25 min focus)
- **⌨️ Code** - Programming projects (90 min focus)

Each mode automatically:
- Opens relevant AI tools
- Loads prompt templates
- Starts appropriate timer

### 📊 Productivity Reports
- Daily/weekly/all-time statistics
- Session completion rates
- Time tracking by project mode
- Export to CSV or TXT

### ⚙️ Settings
- Auto-start with Windows
- Notification preferences
- Default Pomodoro duration
- Theme customization (JARVIS Dark)

---

## 🚀 Installation

### Prerequisites
- **Windows 10/11**
- **Python 3.11+**

### Quick Start

1. **Clone or download this repository:**
   ```bash
   git clone <repository-url>
   cd jarvis-assistant
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run the application:**
   ```bash
   python main.py
   ```

### Optional: Create Executable

To create a standalone `.exe` file:

```bash
pip install pyinstaller
pyinstaller --onefile --windowed --name JARVIS main.py
```

The executable will be in the `dist/` folder.

---

## 📖 Usage Guide

### Command Bar
JARVIS features a command-line style interface. Type commands like:

```
> start focus          - Start a focus session
> open ai              - Open AI Tools hub
> mode saas            - Launch SaaS project mode
> show stats           - View productivity reports
> help                 - Show all commands
```

### Keyboard Shortcuts
- `Ctrl+Enter` - Execute command
- `Tab` - Auto-complete commands (planned)

### Project Modes

**To launch a project mode:**
1. Click the mode button in sidebar or dashboard
2. Or use command: `mode saas`, `mode video`, etc.
3. Relevant AI tools will open in your browser
4. Timer starts automatically
5. Wisdom quote displays for motivation

### Prompt Library

**Create a prompt:**
1. Navigate to Prompts view
2. Click "New Prompt"
3. Fill in title, category, tags, and content
4. Save

**Use a prompt:**
1. Browse or search for your prompt
2. Click to preview
3. Click "Copy" to copy to clipboard
4. Paste into your AI tool

---

## 🎨 JARVIS Dark Theme

The application features a stunning futuristic dark theme:
- **Background:** Deep dark blue (`#0a0e1a`)
- **Primary Accent:** Neon cyan (`#00d9ff`)
- **Success:** Neon green (`#00ff88`)
- **Text:** Light gray on dark background

---

## 📁 Project Structure

```
jarvis-assistant/
│
├── main.py                      # Entry point
├── requirements.txt             # Dependencies
├── README.md                    # This file
│
├── src/
│   ├── app.py                   # Application class
│   ├── main_window.py           # Main window
│   │
│   ├── ui/                      # UI components
│   │   ├── styles.py            # JARVIS theme
│   │   ├── widgets.py           # Custom widgets
│   │   ├── sidebar.py           # Navigation
│   │   └── command_bar.py       # Command interface
│   │
│   ├── views/                   # Application views
│   │   ├── dashboard.py         # Home screen
│   │   ├── ai_tools.py          # AI Tool Hub
│   │   ├── pomodoro.py          # Focus timer
│   │   ├── prompts.py           # Prompt library
│   │   ├── reports.py           # Analytics
│   │   └── settings.py          # Configuration
│   │
│   ├── core/                    # Business logic
│   │   ├── data_manager.py      # JSON storage
│   │   ├── pomodoro_engine.py   # Timer logic
│   │   ├── wisdom_engine.py     # Quote system
│   │   ├── session_tracker.py   # Analytics
│   │   └── project_modes.py     # Mode definitions
│   │
│   └── utils/                   # Utilities
│       ├── system.py            # Windows integration
│       └── exports.py           # Data export
│
└── data/                        # JSON data storage
    ├── ai_tools.json            # AI tool configs
    ├── wisdom_quotes.json       # Quote library
    ├── prompts.json             # User prompts
    ├── sessions.json            # Work sessions
    └── settings.json            # User settings
```

---

## 🔮 Future Enhancements (Phase 2)

### 🔌 API Integrations
- Direct API calls to OpenAI, Anthropic, Google
- Embedded AI chat (no browser needed)
- Secure API key storage

### 🧠 Local LLM Support
- Integration with Ollama
- LM Studio compatibility
- Fully offline AI mode

### 🎙️ Voice Commands
- Wake word activation ("Hey JARVIS")
- Voice control for all features
- Speech-to-text for prompts

### 📊 Advanced Analytics
- Visual charts and graphs
- Productivity trends
- Goal tracking
- Habit formation metrics

### 🌐 Cloud Sync
- Sync prompts across devices
- Backup session data
- Team collaboration features

---

## 🛠️ Customization

### Adding AI Tools
Edit `data/ai_tools.json`:

```json
{
  "id": "custom-tool",
  "name": "My Custom AI",
  "url": "https://example.com",
  "category": "text",
  "favorite": true,
  "description": "My favorite AI tool"
}
```

### Adding Wisdom Quotes
Edit `data/wisdom_quotes.json`:

```json
{
  "id": 100,
  "source": "islam",
  "arabic": "...",
  "transliteration": "...",
  "portuguese": "...",
  "reference": "..."
}
```

### Creating Custom Modes
Edit `src/core/project_modes.py` to add new project modes.

---

## 🤝 Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

## 📄 License

MIT License - Feel free to use this for personal or commercial projects.

---

## 💡 Tips for Maximum Productivity

1. **Start your day with a wisdom quote** - Navigate to Dashboard for daily inspiration
2. **Use Project Modes** - They automatically configure your workspace
3. **Track everything** - Review weekly reports to identify patterns
4. **Build your prompt library** - Save time by reusing proven prompts
5. **Respect the timer** - When it's done, take a real break

---

## 🐛 Troubleshooting

### Application won't start
- Ensure Python 3.11+ is installed
- Check that PyQt6 is installed: `pip install PyQt6`

### Auto-start not working
- Run the application as administrator once
- Check Windows Registry: `HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Run`

### Data not saving
- Ensure the `data/` folder exists
- Check file permissions

---

## 📞 Support

For issues, questions, or feature requests, please open an issue on GitHub.

---

**Built with ❤️ for elite creators and builders.**

*"I am JARVIS. You will want what I can give you."* - Iron Man
