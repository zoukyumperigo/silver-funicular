"""AI Tools Hub - Browse and launch AI tools"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QGridLayout, QScrollArea, QFrame, QComboBox,
                              QLineEdit)
from PyQt6.QtCore import Qt
from ..ui.widgets import ToolCard
from ..ui.styles import COLORS
from ..utils.system import WindowsIntegration


class AIToolsView(QWidget):
    """AI Tools Hub view"""

    def __init__(self, data_manager):
        super().__init__()
        self.data_manager = data_manager
        self.all_tools = []
        self.filtered_tools = []
        self.setup_ui()
        self.load_tools()

    def setup_ui(self):
        """Setup AI tools view"""
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(20)

        # Header
        header = QLabel("AI TOOL HUB")
        header.setStyleSheet(f"""
            font-size: 32px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
        """)
        layout.addWidget(header)

        # Filters
        filter_layout = QHBoxLayout()
        filter_layout.setSpacing(15)

        # Search
        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("🔍 Search tools...")
        self.search_input.textChanged.connect(self.filter_tools)
        self.search_input.setMaximumWidth(300)
        filter_layout.addWidget(self.search_input)

        # Category filter
        self.category_combo = QComboBox()
        self.category_combo.addItems(["All Categories", "Text", "Image", "Video", "Code"])
        self.category_combo.currentTextChanged.connect(self.filter_tools)
        self.category_combo.setMaximumWidth(200)
        filter_layout.addWidget(self.category_combo)

        # Favorites filter
        self.favorites_combo = QComboBox()
        self.favorites_combo.addItems(["All Tools", "Favorites Only"])
        self.favorites_combo.currentTextChanged.connect(self.filter_tools)
        self.favorites_combo.setMaximumWidth(200)
        filter_layout.addWidget(self.favorites_combo)

        filter_layout.addStretch()
        layout.addLayout(filter_layout)

        # Tools grid (scrollable)
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        self.tools_container = QWidget()
        self.tools_grid = QGridLayout()
        self.tools_grid.setSpacing(20)
        self.tools_container.setLayout(self.tools_grid)

        scroll.setWidget(self.tools_container)
        layout.addWidget(scroll)

        self.setLayout(layout)

    def load_tools(self):
        """Load AI tools from database"""
        self.all_tools = self.data_manager.get_ai_tools()
        self.filtered_tools = self.all_tools.copy()
        self.display_tools()

    def filter_tools(self):
        """Filter tools based on search and filters"""
        search_text = self.search_input.text().lower()
        category = self.category_combo.currentText()
        favorites = self.favorites_combo.currentText()

        self.filtered_tools = []

        for tool in self.all_tools:
            # Search filter
            if search_text and search_text not in tool['name'].lower() and search_text not in tool.get('description', '').lower():
                continue

            # Category filter
            if category != "All Categories" and tool.get('category', '').lower() != category.lower():
                continue

            # Favorites filter
            if favorites == "Favorites Only" and not tool.get('favorite', False):
                continue

            self.filtered_tools.append(tool)

        self.display_tools()

    def display_tools(self):
        """Display filtered tools in grid"""
        # Clear existing widgets
        while self.tools_grid.count():
            child = self.tools_grid.takeAt(0)
            if child.widget():
                child.widget().deleteLater()

        # Add filtered tools
        if not self.filtered_tools:
            no_results = QLabel("No tools found")
            no_results.setStyleSheet(f"font-size: 16px; color: {COLORS['text_secondary']};")
            no_results.setAlignment(Qt.AlignmentFlag.AlignCenter)
            self.tools_grid.addWidget(no_results, 0, 0)
            return

        for i, tool in enumerate(self.filtered_tools):
            tool_card = ToolCard(
                name=tool['name'],
                description=tool.get('description', ''),
                url=tool['url'],
                category=tool.get('category', 'text')
            )
            tool_card.clicked.connect(self.open_tool)
            self.tools_grid.addWidget(tool_card, i // 3, i % 3)

    def open_tool(self, url: str):
        """Open AI tool in browser"""
        WindowsIntegration.open_url(url)

    def refresh(self):
        """Refresh tools list"""
        self.load_tools()
