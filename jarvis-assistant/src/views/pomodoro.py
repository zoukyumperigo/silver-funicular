"""Pomodoro timer view"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QPushButton, QProgressBar, QComboBox, QFrame,
                              QMessageBox)
from PyQt6.QtCore import Qt
from ..ui.widgets import QuoteDisplay, GlowButton
from ..ui.styles import COLORS


class PomodoroView(QWidget):
    """Pomodoro timer view"""

    def __init__(self, pomodoro_engine, wisdom_engine, data_manager):
        super().__init__()
        self.pomodoro_engine = pomodoro_engine
        self.wisdom_engine = wisdom_engine
        self.data_manager = data_manager
        self.setup_ui()
        self.connect_signals()

    def setup_ui(self):
        """Setup pomodoro view"""
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(25)
        layout.setAlignment(Qt.AlignmentFlag.AlignTop | Qt.AlignmentFlag.AlignHCenter)

        # Header
        header = QLabel("FOCUS SESSION")
        header.setStyleSheet(f"""
            font-size: 32px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
        """)
        header.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(header)

        # Timer display
        self.timer_label = QLabel("25:00")
        self.timer_label.setStyleSheet(f"""
            font-size: 120px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas', 'Courier New', monospace;
            padding: 30px;
        """)
        self.timer_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.timer_label)

        # Progress bar
        self.progress_bar = QProgressBar()
        self.progress_bar.setMinimum(0)
        self.progress_bar.setMaximum(100)
        self.progress_bar.setValue(0)
        self.progress_bar.setTextVisible(False)
        self.progress_bar.setFixedHeight(20)
        self.progress_bar.setMaximumWidth(600)
        layout.addWidget(self.progress_bar, alignment=Qt.AlignmentFlag.AlignCenter)

        # Status label
        self.status_label = QLabel("Ready to start")
        self.status_label.setStyleSheet(f"""
            font-size: 16px;
            color: {COLORS['text_secondary']};
            padding: 10px;
        """)
        self.status_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.status_label)

        # Preset selection
        preset_layout = QHBoxLayout()
        preset_layout.setSpacing(15)

        preset_label = QLabel("Duration:")
        preset_label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        preset_layout.addWidget(preset_label)

        self.preset_combo = QComboBox()
        self.preset_combo.addItems(["25 minutes", "50 minutes", "90 minutes"])
        self.preset_combo.currentIndexChanged.connect(self.on_preset_changed)
        self.preset_combo.setMinimumWidth(150)
        preset_layout.addWidget(self.preset_combo)

        preset_layout.addStretch()
        layout.addLayout(preset_layout)

        # Control buttons
        controls_layout = QHBoxLayout()
        controls_layout.setSpacing(15)

        self.btn_start = GlowButton("▶ START", primary=True)
        self.btn_start.setMinimumWidth(150)
        self.btn_start.setMinimumHeight(50)
        self.btn_start.clicked.connect(self.on_start_clicked)
        controls_layout.addWidget(self.btn_start)

        self.btn_pause = GlowButton("⏸ PAUSE")
        self.btn_pause.setMinimumWidth(150)
        self.btn_pause.setMinimumHeight(50)
        self.btn_pause.setEnabled(False)
        self.btn_pause.clicked.connect(self.on_pause_clicked)
        controls_layout.addWidget(self.btn_pause)

        self.btn_stop = GlowButton("⏹ STOP")
        self.btn_stop.setMinimumWidth(150)
        self.btn_stop.setMinimumHeight(50)
        self.btn_stop.setEnabled(False)
        self.btn_stop.clicked.connect(self.on_stop_clicked)
        controls_layout.addWidget(self.btn_stop)

        layout.addLayout(controls_layout)

        # Wisdom quote section
        quote_label = QLabel("FOCUS WISDOM")
        quote_label.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            padding-top: 20px;
        """)
        layout.addWidget(quote_label)

        self.quote_display = QuoteDisplay()
        self.quote_display.setMaximumWidth(800)
        layout.addWidget(self.quote_display, alignment=Qt.AlignmentFlag.AlignCenter)

        layout.addStretch()

        self.setLayout(layout)

    def connect_signals(self):
        """Connect pomodoro engine signals"""
        self.pomodoro_engine.tick.connect(self.on_tick)
        self.pomodoro_engine.started.connect(self.on_started)
        self.pomodoro_engine.paused.connect(self.on_paused)
        self.pomodoro_engine.resumed.connect(self.on_resumed)
        self.pomodoro_engine.completed.connect(self.on_completed)
        self.pomodoro_engine.stopped.connect(self.on_stopped)

    def on_preset_changed(self, index):
        """Handle preset selection change"""
        presets = [25, 50, 90]
        if index < len(presets):
            self.pomodoro_engine.set_duration(presets[index])
            self.timer_label.setText(self.pomodoro_engine.get_formatted_time())

    def on_start_clicked(self):
        """Handle start button click"""
        # Show wisdom quote for session start
        quote = self.wisdom_engine.get_quote_for_session_start()
        if quote:
            self.quote_display.display_quote(quote)

        # Start timer
        self.pomodoro_engine.start()

    def on_pause_clicked(self):
        """Handle pause button click"""
        if self.pomodoro_engine.is_paused:
            self.pomodoro_engine.resume()
        else:
            self.pomodoro_engine.pause()

    def on_stop_clicked(self):
        """Handle stop button click"""
        reply = QMessageBox.question(
            self,
            "Stop Session",
            "Are you sure you want to stop this focus session?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )

        if reply == QMessageBox.StandardButton.Yes:
            self.pomodoro_engine.stop()

    def on_tick(self, remaining_seconds):
        """Update timer display on each tick"""
        self.timer_label.setText(self.pomodoro_engine.get_formatted_time())
        progress = self.pomodoro_engine.get_progress_percentage()
        self.progress_bar.setValue(int(progress))

    def on_started(self):
        """Handle timer started"""
        self.status_label.setText("Focus session in progress...")
        self.status_label.setStyleSheet(f"font-size: 16px; color: {COLORS['accent_green']};")
        self.btn_start.setEnabled(False)
        self.btn_pause.setEnabled(True)
        self.btn_stop.setEnabled(True)
        self.preset_combo.setEnabled(False)

    def on_paused(self):
        """Handle timer paused"""
        self.status_label.setText("Session paused")
        self.status_label.setStyleSheet(f"font-size: 16px; color: {COLORS['accent_yellow']};")
        self.btn_pause.setText("▶ RESUME")

    def on_resumed(self):
        """Handle timer resumed"""
        self.status_label.setText("Focus session in progress...")
        self.status_label.setStyleSheet(f"font-size: 16px; color: {COLORS['accent_green']};")
        self.btn_pause.setText("⏸ PAUSE")

    def on_completed(self):
        """Handle timer completion"""
        self.status_label.setText("Session completed! 🎉")
        self.status_label.setStyleSheet(f"font-size: 16px; color: {COLORS['accent_green']};")

        # Show completion quote
        quote = self.wisdom_engine.get_quote_for_session_end()
        if quote:
            self.quote_display.display_quote(quote)

        # Show completion message
        QMessageBox.information(
            self,
            "Session Complete",
            "Congratulations! You've completed your focus session.\n\nTime to take a well-deserved break!"
        )

        self.reset_controls()

    def on_stopped(self):
        """Handle timer stopped"""
        self.status_label.setText("Session stopped")
        self.status_label.setStyleSheet(f"font-size: 16px; color: {COLORS['text_secondary']};")
        self.reset_controls()

    def reset_controls(self):
        """Reset controls to initial state"""
        self.btn_start.setEnabled(True)
        self.btn_pause.setEnabled(False)
        self.btn_pause.setText("⏸ PAUSE")
        self.btn_stop.setEnabled(False)
        self.preset_combo.setEnabled(True)
        self.progress_bar.setValue(0)
        self.timer_label.setText(self.pomodoro_engine.get_formatted_time())

    def refresh(self):
        """Refresh view"""
        if not self.pomodoro_engine.is_running:
            # Load a new quote
            quote = self.wisdom_engine.get_daily_quote()
            if quote:
                self.quote_display.display_quote(quote)
