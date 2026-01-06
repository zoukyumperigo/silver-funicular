"""Sidebar navigation for JARVIS Assistant"""

from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QLabel, QFrame
from PyQt6.QtCore import Qt, pyqtSignal
from PyQt6.QtGui import QFont, QCursor
from .styles import COLORS


class NavButton(QPushButton):
    """Navigation button for sidebar"""

    def __init__(self, icon: str, text: str):
        super().__init__(f"{icon}  {text}")
        self.setCheckable(True)
        self.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        self.setMinimumHeight(50)
        self.setStyleSheet(f"""
            QPushButton {{
                text-align: left;
                padding-left: 20px;
                font-size: 14px;
                font-weight: bold;
                background-color: transparent;
                border: none;
                border-left: 4px solid transparent;
                color: {COLORS['text_secondary']};
            }}
            QPushButton:hover {{
                background-color: {COLORS['hover']};
                color: {COLORS['text_primary']};
            }}
            QPushButton:checked {{
                background-color: {COLORS['bg_tertiary']};
                border-left-color: {COLORS['accent_cyan']};
                color: {COLORS['accent_cyan']};
            }}
        """)


class Sidebar(QWidget):
    """Main navigation sidebar"""

    # Signals for navigation
    navigate_home = pyqtSignal()
    navigate_ai_tools = pyqtSignal()
    navigate_pomodoro = pyqtSignal()
    navigate_prompts = pyqtSignal()
    navigate_reports = pyqtSignal()
    navigate_settings = pyqtSignal()

    # Signals for modes
    mode_selected = pyqtSignal(str)

    def __init__(self):
        super().__init__()
        self.setup_ui()

    def setup_ui(self):
        """Setup the sidebar UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(0, 0, 0, 0)
        layout.setSpacing(0)

        # Logo/Title
        logo = QLabel("⚡ JARVIS")
        logo.setStyleSheet(f"""
            font-size: 24px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            padding: 20px;
            background-color: {COLORS['bg_secondary']};
        """)
        logo.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(logo)

        # Separator
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet(f"background-color: {COLORS['border']};")
        separator.setFixedHeight(2)
        layout.addWidget(separator)

        # Navigation buttons
        self.nav_buttons = []

        self.btn_home = NavButton("🏠", "HOME")
        self.btn_ai = NavButton("🤖", "AI TOOLS")
        self.btn_focus = NavButton("⏱️", "FOCUS")
        self.btn_prompts = NavButton("📝", "PROMPTS")
        self.btn_stats = NavButton("📊", "REPORTS")
        self.btn_settings = NavButton("⚙️", "SETTINGS")

        # Connect signals
        self.btn_home.clicked.connect(lambda: self._on_nav_clicked(self.btn_home, self.navigate_home))
        self.btn_ai.clicked.connect(lambda: self._on_nav_clicked(self.btn_ai, self.navigate_ai_tools))
        self.btn_focus.clicked.connect(lambda: self._on_nav_clicked(self.btn_focus, self.navigate_pomodoro))
        self.btn_prompts.clicked.connect(lambda: self._on_nav_clicked(self.btn_prompts, self.navigate_prompts))
        self.btn_stats.clicked.connect(lambda: self._on_nav_clicked(self.btn_stats, self.navigate_reports))
        self.btn_settings.clicked.connect(lambda: self._on_nav_clicked(self.btn_settings, self.navigate_settings))

        self.nav_buttons = [
            self.btn_home,
            self.btn_ai,
            self.btn_focus,
            self.btn_prompts,
            self.btn_stats,
            self.btn_settings
        ]

        for btn in self.nav_buttons:
            layout.addWidget(btn)

        # Separator
        layout.addWidget(self._create_separator())

        # Quick Modes Section
        modes_label = QLabel("QUICK MODES")
        modes_label.setStyleSheet(f"""
            font-size: 11px;
            font-weight: bold;
            color: {COLORS['text_tertiary']};
            padding: 15px 20px 10px 20px;
        """)
        layout.addWidget(modes_label)

        # Mode buttons
        self.btn_mode_saas = self._create_mode_button("💻", "SaaS", "saas")
        self.btn_mode_video = self._create_mode_button("🎬", "Video", "video")
        self.btn_mode_ebook = self._create_mode_button("📚", "Ebook", "ebook")
        self.btn_mode_social = self._create_mode_button("📱", "Social", "social")
        self.btn_mode_code = self._create_mode_button("⌨️", "Code", "code")

        layout.addWidget(self.btn_mode_saas)
        layout.addWidget(self.btn_mode_video)
        layout.addWidget(self.btn_mode_ebook)
        layout.addWidget(self.btn_mode_social)
        layout.addWidget(self.btn_mode_code)

        layout.addStretch()

        # Version info
        version = QLabel("v1.0.0")
        version.setStyleSheet(f"""
            font-size: 10px;
            color: {COLORS['text_tertiary']};
            padding: 10px;
        """)
        version.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(version)

        self.setLayout(layout)

        # Sidebar style
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {COLORS['bg_secondary']};
                border-right: 2px solid {COLORS['border']};
            }}
        """)
        self.setFixedWidth(220)

        # Set home as default
        self.btn_home.setChecked(True)

    def _create_separator(self):
        """Create a separator line"""
        separator = QFrame()
        separator.setFrameShape(QFrame.Shape.HLine)
        separator.setStyleSheet(f"background-color: {COLORS['border']};")
        separator.setFixedHeight(2)
        return separator

    def _create_mode_button(self, icon: str, text: str, mode_id: str):
        """Create a quick mode button"""
        btn = QPushButton(f"{icon} {text}")
        btn.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        btn.setMinimumHeight(40)
        btn.setStyleSheet(f"""
            QPushButton {{
                text-align: left;
                padding-left: 20px;
                font-size: 13px;
                background-color: transparent;
                border: none;
                color: {COLORS['text_secondary']};
            }}
            QPushButton:hover {{
                background-color: {COLORS['hover']};
                color: {COLORS['accent_cyan']};
            }}
        """)
        btn.clicked.connect(lambda: self.mode_selected.emit(mode_id))
        return btn

    def _on_nav_clicked(self, button, signal):
        """Handle navigation button click"""
        # Uncheck all nav buttons except the clicked one
        for btn in self.nav_buttons:
            if btn != button:
                btn.setChecked(False)

        # Emit signal
        signal.emit()

    def set_active(self, index: int):
        """Set active navigation button by index"""
        for i, btn in enumerate(self.nav_buttons):
            btn.setChecked(i == index)
