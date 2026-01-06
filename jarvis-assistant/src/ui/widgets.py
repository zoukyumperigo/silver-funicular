"""Custom widgets for JARVIS Assistant"""

from PyQt6.QtWidgets import (QPushButton, QLabel, QWidget, QVBoxLayout,
                              QHBoxLayout, QFrame)
from PyQt6.QtCore import Qt, pyqtSignal, QSize
from PyQt6.QtGui import QFont, QCursor
from .styles import COLORS


class GlowButton(QPushButton):
    """Button with glowing effect"""

    def __init__(self, text: str, primary: bool = False):
        super().__init__(text)
        self.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))
        if primary:
            self.setProperty("primary", "true")
        self.setMinimumHeight(45)


class ModeButton(QWidget):
    """Project mode button with icon and description"""

    clicked = pyqtSignal(str)  # Emits mode ID

    def __init__(self, mode_id: str, icon: str, name: str, description: str):
        super().__init__()
        self.mode_id = mode_id

        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(8)

        # Icon and name
        header = QHBoxLayout()
        icon_label = QLabel(icon)
        icon_label.setStyleSheet(f"font-size: 32px;")
        header.addWidget(icon_label)

        name_label = QLabel(name)
        name_label.setStyleSheet(f"font-size: 16px; font-weight: bold; color: {COLORS['accent_cyan']};")
        header.addWidget(name_label)
        header.addStretch()

        layout.addLayout(header)

        # Description
        desc_label = QLabel(description)
        desc_label.setStyleSheet(f"font-size: 12px; color: {COLORS['text_secondary']};")
        desc_label.setWordWrap(True)
        layout.addWidget(desc_label)

        # Button
        self.btn = GlowButton("Launch Mode", primary=True)
        self.btn.clicked.connect(lambda: self.clicked.emit(self.mode_id))
        layout.addWidget(self.btn)

        self.setLayout(layout)

        # Style
        self.setStyleSheet(f"""
            QWidget {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['border']};
                border-radius: 10px;
            }}
            QWidget:hover {{
                border-color: {COLORS['accent_cyan']};
            }}
        """)
        self.setMaximumWidth(300)
        self.setMinimumHeight(150)


class StatCard(QFrame):
    """Card for displaying statistics"""

    def __init__(self, title: str, value: str, icon: str = ""):
        super().__init__()

        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(10)

        # Title
        title_layout = QHBoxLayout()
        if icon:
            icon_label = QLabel(icon)
            icon_label.setStyleSheet("font-size: 24px;")
            title_layout.addWidget(icon_label)

        title_label = QLabel(title)
        title_label.setStyleSheet(f"font-size: 12px; color: {COLORS['text_secondary']}; font-weight: bold;")
        title_layout.addWidget(title_label)
        title_layout.addStretch()

        layout.addLayout(title_layout)

        # Value
        self.value_label = QLabel(value)
        self.value_label.setStyleSheet(f"font-size: 32px; color: {COLORS['accent_cyan']}; font-weight: bold;")
        layout.addWidget(self.value_label)

        self.setLayout(layout)

        # Style
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['border']};
                border-radius: 10px;
            }}
            QFrame:hover {{
                border-color: {COLORS['accent_cyan']};
            }}
        """)
        self.setMinimumWidth(180)
        self.setMinimumHeight(120)

    def update_value(self, value: str):
        """Update the displayed value"""
        self.value_label.setText(value)


class ToolCard(QFrame):
    """Card for AI tool"""

    clicked = pyqtSignal(str)  # Emits tool URL

    def __init__(self, name: str, description: str, url: str, category: str = "text"):
        super().__init__()
        self.url = url

        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(10)

        # Category icon
        category_icons = {
            "text": "💬",
            "image": "🎨",
            "video": "🎬",
            "code": "⌨️"
        }
        icon = category_icons.get(category, "🤖")

        # Header
        header = QHBoxLayout()
        icon_label = QLabel(icon)
        icon_label.setStyleSheet("font-size: 28px;")
        header.addWidget(icon_label)

        name_label = QLabel(name)
        name_label.setStyleSheet(f"font-size: 16px; font-weight: bold; color: {COLORS['text_primary']};")
        header.addWidget(name_label)
        header.addStretch()

        layout.addLayout(header)

        # Description
        desc_label = QLabel(description)
        desc_label.setStyleSheet(f"font-size: 11px; color: {COLORS['text_secondary']};")
        desc_label.setWordWrap(True)
        layout.addWidget(desc_label)

        layout.addStretch()

        # Button
        btn = GlowButton("Open Tool")
        btn.clicked.connect(lambda: self.clicked.emit(self.url))
        layout.addWidget(btn)

        self.setLayout(layout)

        # Style
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['border']};
                border-radius: 10px;
            }}
            QFrame:hover {{
                border-color: {COLORS['accent_cyan']};
            }}
        """)
        self.setMinimumWidth(250)
        self.setMinimumHeight(180)
        self.setCursor(QCursor(Qt.CursorShape.PointingHandCursor))


class QuoteDisplay(QFrame):
    """Display for wisdom quotes"""

    def __init__(self):
        super().__init__()

        self.layout = QVBoxLayout()
        self.layout.setContentsMargins(20, 20, 20, 20)
        self.setLayout(self.layout)

        # Style
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border-left: 4px solid {COLORS['accent_cyan']};
                border-radius: 8px;
            }}
        """)

    def display_quote(self, quote: dict):
        """Display a wisdom quote"""
        # Clear previous content
        while self.layout.count():
            child = self.layout.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        source = quote.get("source", "").upper()
        color_map = {
            "islam": COLORS['accent_green'],
            "greece": COLORS['accent_cyan'],
            "rome": COLORS['accent_red']
        }
        color = color_map.get(quote.get("source", ""), COLORS['accent_cyan'])

        # Update border color
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border-left: 4px solid {color};
                border-radius: 8px;
            }}
        """)

        # Source header
        source_label = QLabel(f"═══ {source} ═══")
        source_label.setStyleSheet(f"font-size: 14px; font-weight: bold; color: {color};")
        self.layout.addWidget(source_label)

        # Original text
        if "arabic" in quote:
            arabic_label = QLabel(quote["arabic"])
            arabic_label.setStyleSheet(f"font-size: 22px; color: {COLORS['text_primary']}; padding: 10px 0;")
            arabic_label.setAlignment(Qt.AlignmentFlag.AlignRight)
            self.layout.addWidget(arabic_label)

            if "transliteration" in quote:
                trans_label = QLabel(f"({quote['transliteration']})")
                trans_label.setStyleSheet(f"font-size: 11px; color: {COLORS['text_tertiary']}; font-style: italic;")
                self.layout.addWidget(trans_label)

        elif "greek" in quote:
            greek_label = QLabel(quote["greek"])
            greek_label.setStyleSheet(f"font-size: 18px; color: {COLORS['text_primary']}; padding: 10px 0;")
            self.layout.addWidget(greek_label)

        elif "latin" in quote:
            latin_label = QLabel(quote["latin"])
            latin_label.setStyleSheet(f"font-size: 18px; color: {COLORS['text_primary']}; font-style: italic; padding: 10px 0;")
            self.layout.addWidget(latin_label)

        elif "original" in quote:
            orig_label = QLabel(f'"{quote["original"]}"')
            orig_label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']}; font-style: italic; padding: 10px 0;")
            orig_label.setWordWrap(True)
            self.layout.addWidget(orig_label)

        # Portuguese translation
        if "portuguese" in quote:
            port_label = QLabel(f"💭 {quote['portuguese']}")
            port_label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_secondary']}; padding: 10px 0;")
            port_label.setWordWrap(True)
            self.layout.addWidget(port_label)

        # Reference
        if "reference" in quote:
            ref_label = QLabel(f"— {quote['reference']}")
            ref_label.setStyleSheet(f"font-size: 11px; color: {COLORS['text_tertiary']}; font-style: italic;")
            ref_label.setAlignment(Qt.AlignmentFlag.AlignRight)
            self.layout.addWidget(ref_label)
