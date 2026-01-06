"""Pomodoro Engine - Timer logic and session management"""

from PyQt6.QtCore import QObject, QTimer, pyqtSignal
from datetime import datetime
from typing import Optional


class PomodoroEngine(QObject):
    """Manages Pomodoro timer logic"""

    # Signals
    tick = pyqtSignal(int)  # Remaining seconds
    started = pyqtSignal()
    paused = pyqtSignal()
    resumed = pyqtSignal()
    completed = pyqtSignal()
    stopped = pyqtSignal()

    # Preset durations (in minutes)
    PRESETS = {
        "short": 25,
        "medium": 50,
        "long": 90,
        "custom": 0
    }

    def __init__(self, data_manager):
        super().__init__()
        self.data_manager = data_manager
        self.timer = QTimer()
        self.timer.timeout.connect(self._on_tick)

        # State
        self.duration_minutes = 25
        self.remaining_seconds = 0
        self.is_running = False
        self.is_paused = False
        self.start_time = None
        self.mode = None  # e.g., "saas", "video", etc.

    def set_duration(self, minutes: int):
        """Set timer duration in minutes"""
        self.duration_minutes = minutes
        self.remaining_seconds = minutes * 60

    def set_preset(self, preset: str):
        """Set timer to a preset duration"""
        if preset in self.PRESETS:
            minutes = self.PRESETS[preset]
            if minutes > 0:
                self.set_duration(minutes)

    def start(self, mode: Optional[str] = None):
        """Start the timer"""
        if self.remaining_seconds == 0:
            self.remaining_seconds = self.duration_minutes * 60

        self.is_running = True
        self.is_paused = False
        self.start_time = datetime.now()
        self.mode = mode

        self.timer.start(1000)  # Tick every second
        self.started.emit()

    def pause(self):
        """Pause the timer"""
        if self.is_running and not self.is_paused:
            self.is_paused = True
            self.timer.stop()
            self.paused.emit()

    def resume(self):
        """Resume the timer"""
        if self.is_running and self.is_paused:
            self.is_paused = False
            self.timer.start(1000)
            self.resumed.emit()

    def stop(self):
        """Stop the timer"""
        was_running = self.is_running
        self.is_running = False
        self.is_paused = False
        self.timer.stop()

        if was_running:
            # Save session as incomplete
            self._save_session(completed=False)
            self.stopped.emit()

    def reset(self):
        """Reset the timer"""
        self.stop()
        self.remaining_seconds = self.duration_minutes * 60

    def _on_tick(self):
        """Handle timer tick"""
        self.remaining_seconds -= 1
        self.tick.emit(self.remaining_seconds)

        if self.remaining_seconds <= 0:
            self._complete()

    def _complete(self):
        """Handle timer completion"""
        self.timer.stop()
        self.is_running = False
        self.is_paused = False

        # Save session as completed
        self._save_session(completed=True)
        self.completed.emit()

    def _save_session(self, completed: bool):
        """Save session to database"""
        if self.start_time:
            elapsed = (datetime.now() - self.start_time).total_seconds()
            session = {
                "start_time": self.start_time.isoformat(),
                "duration": int(elapsed),
                "planned_duration": self.duration_minutes * 60,
                "type": "pomodoro",
                "mode": self.mode,
                "completed": completed
            }
            self.data_manager.add_session(session)

    def get_formatted_time(self) -> str:
        """Get remaining time formatted as MM:SS"""
        minutes = self.remaining_seconds // 60
        seconds = self.remaining_seconds % 60
        return f"{minutes:02d}:{seconds:02d}"

    def get_progress_percentage(self) -> float:
        """Get progress as percentage (0-100)"""
        total_seconds = self.duration_minutes * 60
        if total_seconds == 0:
            return 0
        elapsed = total_seconds - self.remaining_seconds
        return (elapsed / total_seconds) * 100
