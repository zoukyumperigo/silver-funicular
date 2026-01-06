"""Command bar - JARVIS-style command interface"""

from PyQt6.QtWidgets import QWidget, QHBoxLayout, QLineEdit, QPushButton, QLabel
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont
from .styles import COLORS


class CommandBar(QWidget):
    """JARVIS-style command input bar"""

    command_submitted = pyqtSignal(str)  # Emits command text

    COMMANDS = {
        "start focus": "Start a focus session",
        "start pomodoro": "Start a pomodoro timer",
        "open ai": "Open AI tools",
        "open prompts": "Open prompt library",
        "show stats": "Show productivity statistics",
        "show reports": "Show productivity reports",
        "settings": "Open settings",
        "help": "Show available commands",
        "mode saas": "Launch SaaS mode",
        "mode video": "Launch Video mode",
        "mode ebook": "Launch Ebook mode",
        "mode social": "Launch Social Media mode",
        "mode code": "Launch Code mode",
    }

    def __init__(self):
        super().__init__()
        self.setup_ui()

    def setup_ui(self):
        """Setup the command bar UI"""
        layout = QHBoxLayout()
        layout.setContentsMargins(15, 10, 15, 10)
        layout.setSpacing(10)

        # Command prompt symbol
        prompt_label = QLabel("▶")
        prompt_label.setStyleSheet(f"""
            font-size: 18px;
            color: {COLORS['accent_cyan']};
            font-weight: bold;
        """)
        layout.addWidget(prompt_label)

        # Command input
        self.input = QLineEdit()
        self.input.setPlaceholderText("Enter command... (type 'help' for available commands)")
        self.input.setStyleSheet(f"""
            QLineEdit {{
                background-color: {COLORS['bg_secondary']};
                color: {COLORS['text_primary']};
                border: 2px solid {COLORS['border']};
                border-radius: 6px;
                padding: 10px 15px;
                font-size: 14px;
                font-family: 'Consolas', 'Courier New', monospace;
            }}
            QLineEdit:focus {{
                border-color: {COLORS['accent_cyan']};
                background-color: {COLORS['bg_tertiary']};
            }}
        """)
        self.input.returnPressed.connect(self._on_submit)
        layout.addWidget(self.input)

        # Voice button (placeholder for future)
        voice_btn = QPushButton("🎤")
        voice_btn.setFixedSize(45, 45)
        voice_btn.setToolTip("Voice input (coming soon)")
        voice_btn.setEnabled(False)
        voice_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['border']};
                border-radius: 6px;
                font-size: 18px;
            }}
            QPushButton:hover {{
                background-color: {COLORS['hover']};
            }}
            QPushButton:disabled {{
                opacity: 0.5;
            }}
        """)
        layout.addWidget(voice_btn)

        self.setLayout(layout)

        # Bar style
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {COLORS['bg_primary']};
                border-bottom: 2px solid {COLORS['border']};
            }}
        """)
        self.setMinimumHeight(65)

    def _on_submit(self):
        """Handle command submission"""
        command = self.input.text().strip().lower()
        if command:
            self.command_submitted.emit(command)
            self.input.clear()

    def process_command(self, command: str) -> dict:
        """
        Process a command and return action information
        Returns dict with 'action' and optional 'params'
        """
        command = command.lower().strip()

        # Direct mappings
        mappings = {
            "start focus": {"action": "navigate", "view": "pomodoro"},
            "start pomodoro": {"action": "navigate", "view": "pomodoro"},
            "open ai": {"action": "navigate", "view": "ai_tools"},
            "open ai tools": {"action": "navigate", "view": "ai_tools"},
            "open prompts": {"action": "navigate", "view": "prompts"},
            "show stats": {"action": "navigate", "view": "reports"},
            "show reports": {"action": "navigate", "view": "reports"},
            "settings": {"action": "navigate", "view": "settings"},
            "home": {"action": "navigate", "view": "home"},
            "help": {"action": "show_help"},
        }

        # Check direct mappings
        if command in mappings:
            return mappings[command]

        # Check mode commands
        if command.startswith("mode "):
            mode = command.replace("mode ", "").strip()
            return {"action": "mode", "mode_id": mode}

        # Check if it's a partial command
        matches = [cmd for cmd in self.COMMANDS if cmd.startswith(command)]
        if len(matches) == 1:
            # Auto-complete to single match
            return self.process_command(matches[0])

        # Unknown command
        return {"action": "unknown", "suggestions": matches if matches else []}

    def get_help_text(self) -> str:
        """Get help text with all available commands"""
        help_text = "═══ AVAILABLE COMMANDS ═══\n\n"
        for cmd, desc in self.COMMANDS.items():
            help_text += f"  ▶ {cmd:<20} - {desc}\n"
        return help_text

    def set_placeholder(self, text: str):
        """Set placeholder text"""
        self.input.setPlaceholderText(text)

    def focus_input(self):
        """Focus the command input"""
        self.input.setFocus()
