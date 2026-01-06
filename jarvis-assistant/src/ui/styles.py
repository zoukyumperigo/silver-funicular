"""JARVIS Dark Theme - Styles and Colors"""

# JARVIS Color Palette
COLORS = {
    # Background
    "bg_primary": "#0a0e1a",      # Deep dark blue
    "bg_secondary": "#1a2332",    # Dark slate
    "bg_tertiary": "#252d3d",     # Lighter slate

    # Accents
    "accent_cyan": "#00d9ff",     # Neon cyan (primary)
    "accent_green": "#00ff88",    # Neon green (success)
    "accent_red": "#ff6b6b",      # Neon red (danger)
    "accent_yellow": "#ffd93d",   # Neon yellow (warning)

    # Text
    "text_primary": "#e0e6ed",    # Light gray
    "text_secondary": "#c0c6cd",  # Medium gray
    "text_tertiary": "#8892a0",   # Dark gray

    # UI Elements
    "border": "#2a3442",
    "hover": "#2d3847",
    "active": "#354152",
}


# Main Application Style
APP_STYLE = f"""
    QMainWindow {{
        background-color: {COLORS['bg_primary']};
    }}

    QWidget {{
        background-color: {COLORS['bg_primary']};
        color: {COLORS['text_primary']};
        font-family: 'Segoe UI', Arial, sans-serif;
        font-size: 13px;
    }}

    QLabel {{
        color: {COLORS['text_primary']};
        background-color: transparent;
    }}

    /* Scrollbar */
    QScrollBar:vertical {{
        background: {COLORS['bg_secondary']};
        width: 12px;
        border-radius: 6px;
    }}

    QScrollBar::handle:vertical {{
        background: {COLORS['accent_cyan']};
        border-radius: 6px;
        min-height: 20px;
    }}

    QScrollBar::handle:vertical:hover {{
        background: {COLORS['accent_green']};
    }}

    QScrollBar::add-line:vertical, QScrollBar::sub-line:vertical {{
        height: 0px;
    }}

    /* Buttons */
    QPushButton {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_primary']};
        border: 2px solid {COLORS['border']};
        border-radius: 6px;
        padding: 10px 20px;
        font-weight: bold;
        font-size: 13px;
    }}

    QPushButton:hover {{
        background-color: {COLORS['hover']};
        border-color: {COLORS['accent_cyan']};
    }}

    QPushButton:pressed {{
        background-color: {COLORS['active']};
    }}

    QPushButton:disabled {{
        background-color: {COLORS['bg_tertiary']};
        color: {COLORS['text_tertiary']};
        border-color: {COLORS['border']};
    }}

    /* Primary Button */
    QPushButton[primary="true"] {{
        background-color: {COLORS['accent_cyan']};
        color: {COLORS['bg_primary']};
        border: none;
    }}

    QPushButton[primary="true"]:hover {{
        background-color: {COLORS['accent_green']};
    }}

    /* Input Fields */
    QLineEdit, QTextEdit, QPlainTextEdit {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_primary']};
        border: 2px solid {COLORS['border']};
        border-radius: 6px;
        padding: 8px 12px;
        selection-background-color: {COLORS['accent_cyan']};
    }}

    QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus {{
        border-color: {COLORS['accent_cyan']};
    }}

    /* ComboBox */
    QComboBox {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_primary']};
        border: 2px solid {COLORS['border']};
        border-radius: 6px;
        padding: 8px 12px;
    }}

    QComboBox:hover {{
        border-color: {COLORS['accent_cyan']};
    }}

    QComboBox::drop-down {{
        border: none;
        padding-right: 10px;
    }}

    QComboBox QAbstractItemView {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_primary']};
        border: 2px solid {COLORS['accent_cyan']};
        selection-background-color: {COLORS['accent_cyan']};
        selection-color: {COLORS['bg_primary']};
    }}

    /* List Widget */
    QListWidget {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_primary']};
        border: 2px solid {COLORS['border']};
        border-radius: 6px;
        padding: 5px;
    }}

    QListWidget::item {{
        padding: 10px;
        border-radius: 4px;
    }}

    QListWidget::item:hover {{
        background-color: {COLORS['hover']};
    }}

    QListWidget::item:selected {{
        background-color: {COLORS['accent_cyan']};
        color: {COLORS['bg_primary']};
    }}

    /* Group Box */
    QGroupBox {{
        background-color: {COLORS['bg_secondary']};
        border: 2px solid {COLORS['border']};
        border-radius: 8px;
        margin-top: 10px;
        padding: 15px;
        font-weight: bold;
    }}

    QGroupBox::title {{
        color: {COLORS['accent_cyan']};
        subcontrol-origin: margin;
        left: 15px;
        padding: 0 5px;
    }}

    /* Progress Bar */
    QProgressBar {{
        background-color: {COLORS['bg_secondary']};
        border: 2px solid {COLORS['border']};
        border-radius: 6px;
        text-align: center;
        color: {COLORS['text_primary']};
        font-weight: bold;
    }}

    QProgressBar::chunk {{
        background-color: qlineargradient(
            x1:0, y1:0, x2:1, y2:0,
            stop:0 {COLORS['accent_cyan']},
            stop:1 {COLORS['accent_green']}
        );
        border-radius: 4px;
    }}

    /* Tabs */
    QTabWidget::pane {{
        border: 2px solid {COLORS['border']};
        border-radius: 6px;
        background-color: {COLORS['bg_secondary']};
    }}

    QTabBar::tab {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_secondary']};
        border: 2px solid {COLORS['border']};
        padding: 10px 20px;
        margin: 2px;
        border-radius: 4px;
    }}

    QTabBar::tab:selected {{
        background-color: {COLORS['accent_cyan']};
        color: {COLORS['bg_primary']};
        font-weight: bold;
    }}

    QTabBar::tab:hover {{
        background-color: {COLORS['hover']};
        color: {COLORS['text_primary']};
    }}

    /* Checkbox */
    QCheckBox {{
        color: {COLORS['text_primary']};
        spacing: 8px;
    }}

    QCheckBox::indicator {{
        width: 18px;
        height: 18px;
        border: 2px solid {COLORS['border']};
        border-radius: 4px;
        background-color: {COLORS['bg_secondary']};
    }}

    QCheckBox::indicator:hover {{
        border-color: {COLORS['accent_cyan']};
    }}

    QCheckBox::indicator:checked {{
        background-color: {COLORS['accent_cyan']};
        border-color: {COLORS['accent_cyan']};
    }}

    /* Radio Button */
    QRadioButton {{
        color: {COLORS['text_primary']};
        spacing: 8px;
    }}

    QRadioButton::indicator {{
        width: 18px;
        height: 18px;
        border: 2px solid {COLORS['border']};
        border-radius: 9px;
        background-color: {COLORS['bg_secondary']};
    }}

    QRadioButton::indicator:hover {{
        border-color: {COLORS['accent_cyan']};
    }}

    QRadioButton::indicator:checked {{
        background-color: {COLORS['accent_cyan']};
        border-color: {COLORS['accent_cyan']};
    }}

    /* Menu Bar */
    QMenuBar {{
        background-color: {COLORS['bg_primary']};
        color: {COLORS['text_primary']};
        border-bottom: 1px solid {COLORS['border']};
    }}

    QMenuBar::item:selected {{
        background-color: {COLORS['accent_cyan']};
        color: {COLORS['bg_primary']};
    }}

    QMenu {{
        background-color: {COLORS['bg_secondary']};
        color: {COLORS['text_primary']};
        border: 2px solid {COLORS['accent_cyan']};
    }}

    QMenu::item:selected {{
        background-color: {COLORS['accent_cyan']};
        color: {COLORS['bg_primary']};
    }}
"""


def get_style() -> str:
    """Get the complete application stylesheet"""
    return APP_STYLE


def get_color(name: str) -> str:
    """Get a specific color from the palette"""
    return COLORS.get(name, "#ffffff")
