"""Main window for JARVIS Assistant"""

from PyQt6.QtWidgets import (QMainWindow, QWidget, QVBoxLayout, QHBoxLayout,
                              QStackedWidget, QMessageBox)
from PyQt6.QtCore import Qt, QSize
from PyQt6.QtGui import QIcon

from .ui.styles import get_style
from .ui.sidebar import Sidebar
from .ui.command_bar import CommandBar
from .views.dashboard import DashboardView
from .views.ai_tools import AIToolsView
from .views.pomodoro import PomodoroView
from .views.prompts import PromptsView
from .views.reports import ReportsView
from .views.settings import SettingsView
from .core.project_modes import ProjectModes
from .utils.system import WindowsIntegration


class MainWindow(QMainWindow):
    """Main application window"""

    def __init__(self, data_manager, pomodoro_engine, wisdom_engine, session_tracker):
        super().__init__()
        self.data_manager = data_manager
        self.pomodoro_engine = pomodoro_engine
        self.wisdom_engine = wisdom_engine
        self.session_tracker = session_tracker

        self.setup_ui()
        self.setup_connections()

        # Load window settings
        settings = self.data_manager.get_settings()
        width = settings.get("window_width", 1200)
        height = settings.get("window_height", 800)
        self.resize(width, height)

    def setup_ui(self):
        """Setup main window UI"""
        self.setWindowTitle("JARVIS - AI Production Assistant")
        self.setMinimumSize(QSize(1000, 600))

        # Apply stylesheet
        self.setStyleSheet(get_style())

        # Central widget
        central_widget = QWidget()
        self.setCentralWidget(central_widget)

        # Main layout
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)

        # Command bar
        self.command_bar = CommandBar()
        main_layout.addWidget(self.command_bar)

        # Content layout (sidebar + views)
        content_layout = QHBoxLayout()
        content_layout.setContentsMargins(0, 0, 0, 0)
        content_layout.setSpacing(0)

        # Sidebar
        self.sidebar = Sidebar()
        content_layout.addWidget(self.sidebar)

        # Stacked widget for views
        self.stack = QStackedWidget()

        # Create views
        self.dashboard_view = DashboardView(
            self.data_manager,
            self.session_tracker,
            self.wisdom_engine
        )
        self.ai_tools_view = AIToolsView(self.data_manager)
        self.pomodoro_view = PomodoroView(
            self.pomodoro_engine,
            self.wisdom_engine,
            self.data_manager
        )
        self.prompts_view = PromptsView(self.data_manager)
        self.reports_view = ReportsView(self.session_tracker, self.data_manager)
        self.settings_view = SettingsView(self.data_manager)

        # Add views to stack
        self.stack.addWidget(self.dashboard_view)   # 0
        self.stack.addWidget(self.ai_tools_view)    # 1
        self.stack.addWidget(self.pomodoro_view)    # 2
        self.stack.addWidget(self.prompts_view)     # 3
        self.stack.addWidget(self.reports_view)     # 4
        self.stack.addWidget(self.settings_view)    # 5

        content_layout.addWidget(self.stack)

        main_layout.addLayout(content_layout)

        central_widget.setLayout(main_layout)

    def setup_connections(self):
        """Setup signal connections"""
        # Sidebar navigation
        self.sidebar.navigate_home.connect(lambda: self.navigate_to(0))
        self.sidebar.navigate_ai_tools.connect(lambda: self.navigate_to(1))
        self.sidebar.navigate_pomodoro.connect(lambda: self.navigate_to(2))
        self.sidebar.navigate_prompts.connect(lambda: self.navigate_to(3))
        self.sidebar.navigate_reports.connect(lambda: self.navigate_to(4))
        self.sidebar.navigate_settings.connect(lambda: self.navigate_to(5))

        # Sidebar mode selection
        self.sidebar.mode_selected.connect(self.launch_mode)

        # Dashboard navigation
        self.dashboard_view.navigate_ai_tools.connect(lambda: self.navigate_to(1))
        self.dashboard_view.navigate_pomodoro.connect(lambda: self.navigate_to(2))
        self.dashboard_view.mode_selected.connect(self.launch_mode)

        # Command bar
        self.command_bar.command_submitted.connect(self.process_command)

    def navigate_to(self, index: int):
        """Navigate to a view by index"""
        self.stack.setCurrentIndex(index)
        self.sidebar.set_active(index)

        # Refresh the view when navigated to
        current_widget = self.stack.currentWidget()
        if hasattr(current_widget, 'refresh'):
            current_widget.refresh()

    def launch_mode(self, mode_id: str):
        """Launch a project mode"""
        mode = ProjectModes.get_mode(mode_id)
        if not mode:
            return

        # Navigate to pomodoro view
        self.navigate_to(2)

        # Set pomodoro duration
        self.pomodoro_engine.set_duration(mode.pomodoro)

        # Show mode info
        QMessageBox.information(
            self,
            f"{mode.icon} {mode.name} Mode",
            f"{mode.description}\n\n"
            f"Duration: {mode.pomodoro} minutes\n"
            f"AI Tools: {', '.join(mode.ai_tools)}\n"
            f"Relevant Prompts: {', '.join(mode.prompts)}\n\n"
            f"Ready to start your focus session?"
        )

        # Open AI tools
        for tool_id in mode.ai_tools[:2]:  # Open first 2 tools
            tool = self.data_manager.get_ai_tool(tool_id)
            if tool:
                WindowsIntegration.open_url(tool['url'])

    def process_command(self, command: str):
        """Process a command from the command bar"""
        result = self.command_bar.process_command(command)
        action = result.get("action")

        if action == "navigate":
            view_map = {
                "home": 0,
                "ai_tools": 1,
                "pomodoro": 2,
                "prompts": 3,
                "reports": 4,
                "settings": 5
            }
            view = result.get("view")
            if view in view_map:
                self.navigate_to(view_map[view])

        elif action == "mode":
            mode_id = result.get("mode_id")
            self.launch_mode(mode_id)

        elif action == "show_help":
            help_text = self.command_bar.get_help_text()
            QMessageBox.information(self, "JARVIS Commands", help_text)

        elif action == "unknown":
            suggestions = result.get("suggestions", [])
            if suggestions:
                msg = f"Unknown command. Did you mean:\n\n" + "\n".join(f"  • {s}" for s in suggestions)
            else:
                msg = "Unknown command. Type 'help' to see available commands."

            QMessageBox.warning(self, "Unknown Command", msg)

    def closeEvent(self, event):
        """Handle window close event"""
        # Save window size
        self.data_manager.update_settings({
            "window_width": self.width(),
            "window_height": self.height()
        })

        # If pomodoro is running, confirm
        if self.pomodoro_engine.is_running:
            reply = QMessageBox.question(
                self,
                "Confirm Exit",
                "A focus session is in progress. Are you sure you want to exit?",
                QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
            )

            if reply == QMessageBox.StandardButton.No:
                event.ignore()
                return

            # Stop the timer
            self.pomodoro_engine.stop()

        event.accept()
