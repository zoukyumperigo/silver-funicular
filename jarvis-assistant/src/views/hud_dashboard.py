"""HUD Dashboard - Iron Man JARVIS-style interface with real-time data"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QGridLayout,
                              QLabel, QFrame, QScrollArea)
from PyQt6.QtCore import Qt
from ..ui.hud_widgets import (SystemMonitor, FinancialTicker, DigitalClock,
                               WeatherWidget, StockTicker)
from ..ui.widgets import StatCard, QuoteDisplay, GlowButton
from ..ui.styles import COLORS


class HUDDashboard(QWidget):
    """JARVIS HUD-style dashboard with real-time monitoring"""

    def __init__(self, data_manager, session_tracker, wisdom_engine):
        super().__init__()
        self.data_manager = data_manager
        self.session_tracker = session_tracker
        self.wisdom_engine = wisdom_engine
        self.setup_ui()
        self.load_data()

    def setup_ui(self):
        """Setup HUD dashboard UI"""
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Stock ticker at top
        self.stock_ticker = StockTicker()
        main_layout.addWidget(self.stock_ticker)

        # Scroll area for main content
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        content = QWidget()
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(20)

        # Header with title
        header = self._create_header()
        layout.addWidget(header)

        # Top row: Clock + System Monitor
        top_row = QHBoxLayout()
        top_row.setSpacing(15)

        self.clock = DigitalClock()
        self.clock.setMinimumWidth(350)
        top_row.addWidget(self.clock)

        self.system_monitor = SystemMonitor()
        self.system_monitor.setMinimumWidth(500)
        top_row.addWidget(self.system_monitor)

        top_row.addStretch()
        layout.addLayout(top_row)

        # Middle row: Financial + Weather + Stats
        middle_row = QHBoxLayout()
        middle_row.setSpacing(15)

        # Financial ticker
        self.financial_ticker = FinancialTicker()
        self.financial_ticker.setMinimumWidth(300)
        middle_row.addWidget(self.financial_ticker)

        # Weather
        self.weather = WeatherWidget()
        self.weather.setMinimumWidth(250)
        middle_row.addWidget(self.weather)

        # Session stats
        stats_layout = QVBoxLayout()
        stats_layout.setSpacing(10)

        self.stat_sessions = StatCard("Sessions Today", "0", "⏱️")
        self.stat_focus_time = StatCard("Focus Time", "0h", "🎯")

        stats_layout.addWidget(self.stat_sessions)
        stats_layout.addWidget(self.stat_focus_time)

        middle_row.addLayout(stats_layout)
        middle_row.addStretch()

        layout.addLayout(middle_row)

        # AI Tools quick access
        tools_section = self._create_tools_section()
        layout.addWidget(tools_section)

        # Wisdom quote
        quote_section = self._create_quote_section()
        layout.addWidget(quote_section)

        layout.addStretch()

        content.setLayout(layout)
        scroll.setWidget(content)

        main_layout.addWidget(scroll)

        self.setLayout(main_layout)

    def _create_header(self):
        """Create header section"""
        header = QFrame()
        header_layout = QVBoxLayout()
        header_layout.setContentsMargins(0, 0, 0, 0)

        # Main title
        title = QLabel("⚡ JARVIS COMMAND CENTER")
        title.setStyleSheet(f"""
            font-size: 42px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
            padding: 10px;
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        header_layout.addWidget(title)

        # Subtitle
        subtitle = QLabel("AI Production Assistant • Real-Time Monitoring • Deep Focus System")
        subtitle.setStyleSheet(f"""
            font-size: 12px;
            color: {COLORS['text_secondary']};
            font-family: 'Consolas';
        """)
        subtitle.setAlignment(Qt.AlignmentFlag.AlignCenter)
        header_layout.addWidget(subtitle)

        header.setLayout(header_layout)
        header.setStyleSheet(f"""
            QFrame {{
                border-bottom: 2px solid {COLORS['accent_cyan']};
                padding-bottom: 15px;
                margin-bottom: 15px;
            }}
        """)

        return header

    def _create_tools_section(self):
        """Create AI tools quick access section"""
        section = QFrame()
        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(15)

        # Title
        title = QLabel("🤖 QUICK ACCESS: AI TOOLS")
        title.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
        """)
        layout.addWidget(title)

        # Tool buttons grid
        tools_grid = QGridLayout()
        tools_grid.setSpacing(10)

        favorite_tools = self.data_manager.get_ai_tools()
        favorites = [t for t in favorite_tools if t.get('favorite', False)][:12]

        for i, tool in enumerate(favorites):
            btn = GlowButton(f"{self._get_category_icon(tool.get('category', 'code'))} {tool['name']}")
            btn.setMinimumHeight(40)
            btn.clicked.connect(lambda checked, url=tool['url']: self._open_tool(url))
            tools_grid.addWidget(btn, i // 4, i % 4)

        layout.addLayout(tools_grid)

        section.setLayout(layout)
        section.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['accent_cyan']};
                border-radius: 10px;
            }}
        """)

        return section

    def _create_quote_section(self):
        """Create wisdom quote section"""
        section = QFrame()
        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(10)

        # Title
        title = QLabel("💭 ANCIENT WISDOM")
        title.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
        """)
        layout.addWidget(title)

        # Quote display
        self.quote_display = QuoteDisplay()
        layout.addWidget(self.quote_display)

        section.setLayout(layout)
        section.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['accent_green']};
                border-radius: 10px;
            }}
        """)

        return section

    def _get_category_icon(self, category: str) -> str:
        """Get icon for tool category"""
        icons = {
            "code": "⌨️",
            "text": "💬",
            "image": "🎨",
            "video": "🎬"
        }
        return icons.get(category, "🤖")

    def _open_tool(self, url: str):
        """Open AI tool in browser"""
        from ..utils.system import WindowsIntegration
        WindowsIntegration.open_url(url)

    def load_data(self):
        """Load and display dashboard data"""
        # Load today's stats
        stats = self.session_tracker.get_today_stats()

        self.stat_sessions.update_value(str(stats['total_sessions']))
        self.stat_focus_time.update_value(f"{stats['total_time_hours']:.1f}h")

        # Load daily quote
        quote = self.wisdom_engine.get_daily_quote()
        if quote:
            self.quote_display.display_quote(quote)

    def refresh(self):
        """Refresh dashboard data"""
        self.load_data()
