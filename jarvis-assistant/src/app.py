"""JARVIS Application - Main application class"""

import sys
from PyQt6.QtWidgets import QApplication
from PyQt6.QtCore import Qt

from .core.data_manager import DataManager
from .core.pomodoro_engine import PomodoroEngine
from .core.wisdom_engine import WisdomEngine
from .core.session_tracker import SessionTracker
from .main_window import MainWindow


class JarvisApplication:
    """Main JARVIS application"""

    def __init__(self):
        # Create Qt application
        self.app = QApplication(sys.argv)
        self.app.setApplicationName("JARVIS Assistant")
        self.app.setOrganizationName("JARVIS")

        # Enable high DPI scaling
        QApplication.setHighDpiScaleFactorRoundingPolicy(
            Qt.HighDpiScaleFactorRoundingPolicy.PassThrough
        )

        # Initialize core components
        self.data_manager = DataManager()
        self.pomodoro_engine = PomodoroEngine(self.data_manager)
        self.wisdom_engine = WisdomEngine(self.data_manager)
        self.session_tracker = SessionTracker(self.data_manager)

        # Create main window
        self.main_window = MainWindow(
            self.data_manager,
            self.pomodoro_engine,
            self.wisdom_engine,
            self.session_tracker
        )

    def run(self):
        """Run the application"""
        self.main_window.show()
        return self.app.exec()


def run_application():
    """Entry point for running the application"""
    app = JarvisApplication()
    sys.exit(app.run())
