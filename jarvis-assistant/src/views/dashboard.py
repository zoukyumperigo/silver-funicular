"""Dashboard view - Main home screen"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QGridLayout, QScrollArea, QFrame)
from PyQt6.QtCore import Qt, pyqtSignal
from ..ui.widgets import StatCard, ModeButton, QuoteDisplay
from ..ui.styles import COLORS
from ..core.project_modes import ProjectModes


class DashboardView(QWidget):
    """Main dashboard view"""

    mode_selected = pyqtSignal(str)
    navigate_ai_tools = pyqtSignal()
    navigate_pomodoro = pyqtSignal()

    def __init__(self, data_manager, session_tracker, wisdom_engine):
        super().__init__()
        self.data_manager = data_manager
        self.session_tracker = session_tracker
        self.wisdom_engine = wisdom_engine
        self.setup_ui()
        self.load_data()

    def setup_ui(self):
        """Setup dashboard UI"""
        # Main scroll area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        # Content widget
        content = QWidget()
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(25)

        # Welcome header
        header = QLabel("WELCOME BACK, OPERATOR")
        header.setStyleSheet(f"""
            font-size: 32px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            padding-bottom: 10px;
        """)
        layout.addWidget(header)

        # Today's stats
        stats_layout = QHBoxLayout()
        stats_layout.setSpacing(20)

        self.stat_sessions = StatCard("Sessions Today", "0", "⏱️")
        self.stat_focus_time = StatCard("Focus Time", "0h", "🎯")
        self.stat_completion = StatCard("Completion Rate", "0%", "✓")

        stats_layout.addWidget(self.stat_sessions)
        stats_layout.addWidget(self.stat_focus_time)
        stats_layout.addWidget(self.stat_completion)
        stats_layout.addStretch()

        layout.addLayout(stats_layout)

        # Quick actions
        quick_section = QLabel("QUICK START")
        quick_section.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            padding-top: 10px;
        """)
        layout.addWidget(quick_section)

        quick_layout = QHBoxLayout()
        quick_layout.setSpacing(15)

        # AI Tools button
        from ..ui.widgets import GlowButton
        btn_ai = GlowButton("🤖 Launch AI Tools")
        btn_ai.setMinimumWidth(200)
        btn_ai.clicked.connect(self.navigate_ai_tools.emit)
        quick_layout.addWidget(btn_ai)

        # Focus session button
        btn_focus = GlowButton("⏱️ Start Focus Session", primary=True)
        btn_focus.setMinimumWidth(200)
        btn_focus.clicked.connect(self.navigate_pomodoro.emit)
        quick_layout.addWidget(btn_focus)

        quick_layout.addStretch()
        layout.addLayout(quick_layout)

        # Project modes
        modes_section = QLabel("PROJECT QUICK MODES")
        modes_section.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            padding-top: 10px;
        """)
        layout.addWidget(modes_section)

        # Mode grid
        modes_grid = QGridLayout()
        modes_grid.setSpacing(15)

        modes = [
            ("saas", "💻", "Create SaaS", "Build and launch a SaaS product"),
            ("video", "🎬", "Create Video", "Produce video content"),
            ("ebook", "📚", "Create Ebook", "Write and publish an ebook"),
            ("social", "📱", "Social Media", "Create social media content"),
        ]

        for i, (mode_id, icon, name, desc) in enumerate(modes):
            mode_btn = ModeButton(mode_id, icon, name, desc)
            mode_btn.clicked.connect(self.mode_selected.emit)
            modes_grid.addWidget(mode_btn, i // 2, i % 2)

        layout.addLayout(modes_grid)

        # Daily wisdom quote
        wisdom_section = QLabel("DAILY WISDOM")
        wisdom_section.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            padding-top: 10px;
        """)
        layout.addWidget(wisdom_section)

        self.quote_display = QuoteDisplay()
        layout.addWidget(self.quote_display)

        layout.addStretch()

        content.setLayout(layout)
        scroll.setWidget(content)

        # Main layout
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.addWidget(scroll)
        self.setLayout(main_layout)

    def load_data(self):
        """Load and display dashboard data"""
        # Load today's stats
        stats = self.session_tracker.get_today_stats()

        self.stat_sessions.update_value(str(stats['total_sessions']))
        self.stat_focus_time.update_value(f"{stats['total_time_hours']:.1f}h")
        self.stat_completion.update_value(f"{stats['completion_rate']:.0f}%")

        # Load daily quote
        quote = self.wisdom_engine.get_daily_quote()
        if quote:
            self.quote_display.display_quote(quote)

    def refresh(self):
        """Refresh dashboard data"""
        self.load_data()
