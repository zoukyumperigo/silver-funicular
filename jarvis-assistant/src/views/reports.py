"""Productivity Reports - View and export session data"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QTextEdit, QPushButton, QComboBox, QFileDialog,
                              QMessageBox, QGridLayout, QFrame)
from PyQt6.QtCore import Qt
from datetime import datetime, timedelta
from ..ui.widgets import StatCard, GlowButton
from ..ui.styles import COLORS


class ReportsView(QWidget):
    """Productivity reports view"""

    def __init__(self, session_tracker, data_manager):
        super().__init__()
        self.session_tracker = session_tracker
        self.data_manager = data_manager
        self.setup_ui()
        self.load_report()

    def setup_ui(self):
        """Setup reports view"""
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(20)

        # Header
        header_layout = QHBoxLayout()

        header = QLabel("PRODUCTIVITY REPORTS")
        header.setStyleSheet(f"""
            font-size: 32px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
        """)
        header_layout.addWidget(header)

        header_layout.addStretch()

        # Export button
        btn_export = GlowButton("📥 Export Data", primary=True)
        btn_export.clicked.connect(self.on_export)
        header_layout.addWidget(btn_export)

        layout.addLayout(header_layout)

        # Period selector
        period_layout = QHBoxLayout()

        period_label = QLabel("Report Period:")
        period_label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        period_layout.addWidget(period_label)

        self.period_combo = QComboBox()
        self.period_combo.addItems(["Today", "This Week", "All Time"])
        self.period_combo.currentTextChanged.connect(self.load_report)
        self.period_combo.setMaximumWidth(200)
        period_layout.addWidget(self.period_combo)

        period_layout.addStretch()
        layout.addLayout(period_layout)

        # Stats cards
        stats_layout = QHBoxLayout()
        stats_layout.setSpacing(20)

        self.stat_total_sessions = StatCard("Total Sessions", "0", "⏱️")
        self.stat_completed = StatCard("Completed", "0", "✓")
        self.stat_total_time = StatCard("Total Time", "0h", "🎯")
        self.stat_avg_session = StatCard("Avg Session", "0min", "📊")

        stats_layout.addWidget(self.stat_total_sessions)
        stats_layout.addWidget(self.stat_completed)
        stats_layout.addWidget(self.stat_total_time)
        stats_layout.addWidget(self.stat_avg_session)
        stats_layout.addStretch()

        layout.addLayout(stats_layout)

        # Detailed report
        report_label = QLabel("DETAILED REPORT")
        report_label.setStyleSheet(f"""
            font-size: 18px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            padding-top: 10px;
        """)
        layout.addWidget(report_label)

        self.report_text = QTextEdit()
        self.report_text.setReadOnly(True)
        self.report_text.setStyleSheet(f"""
            QTextEdit {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['border']};
                border-radius: 8px;
                padding: 15px;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 13px;
                line-height: 1.6;
            }}
        """)
        layout.addWidget(self.report_text)

        self.setLayout(layout)

    def load_report(self):
        """Load and display report based on selected period"""
        period = self.period_combo.currentText()

        if period == "Today":
            stats = self.session_tracker.get_today_stats()
            date = datetime.now().strftime("%Y-%m-%d")
            report = self.session_tracker.get_daily_report(date)
        elif period == "This Week":
            stats = self.session_tracker.get_week_stats()
            report = self._generate_week_report(stats)
        else:  # All Time
            all_sessions = self.data_manager.get_sessions()
            stats = self.session_tracker._calculate_stats(all_sessions)
            report = self._generate_all_time_report(stats)

        # Update stat cards
        self.stat_total_sessions.update_value(str(stats['total_sessions']))
        self.stat_completed.update_value(str(stats['completed_sessions']))
        self.stat_total_time.update_value(f"{stats['total_time_hours']:.1f}h")
        self.stat_avg_session.update_value(f"{stats['average_session_minutes']:.1f}min")

        # Update report text
        self.report_text.setPlainText(report)

    def _generate_week_report(self, stats):
        """Generate weekly report"""
        report = "📊 WEEKLY PRODUCTIVITY REPORT\n"
        report += "═" * 60 + "\n\n"
        report += f"Total Sessions: {stats['total_sessions']}\n"
        report += f"Completed: {stats['completed_sessions']} ✓\n"
        report += f"Interrupted: {stats['interrupted_sessions']} ✗\n"
        report += f"Completion Rate: {stats['completion_rate']:.1f}%\n\n"
        report += f"Total Focus Time: {stats['total_time_hours']:.2f} hours\n"
        report += f"Average Session: {stats['average_session_minutes']:.1f} minutes\n\n"

        if stats['mode_breakdown']:
            report += "Mode Breakdown:\n"
            for mode, data in stats['mode_breakdown'].items():
                hours = data['time'] / 3600
                report += f"  • {mode.upper()}: {data['count']} sessions, {hours:.2f}h\n"

        return report

    def _generate_all_time_report(self, stats):
        """Generate all-time report"""
        report = "📊 ALL-TIME PRODUCTIVITY REPORT\n"
        report += "═" * 60 + "\n\n"
        report += f"Total Sessions: {stats['total_sessions']}\n"
        report += f"Completed: {stats['completed_sessions']} ✓\n"
        report += f"Interrupted: {stats['interrupted_sessions']} ✗\n"
        report += f"Completion Rate: {stats['completion_rate']:.1f}%\n\n"
        report += f"Total Focus Time: {stats['total_time_hours']:.2f} hours\n"
        report += f"Average Session: {stats['average_session_minutes']:.1f} minutes\n\n"

        if stats['mode_breakdown']:
            report += "Mode Breakdown:\n"
            for mode, data in stats['mode_breakdown'].items():
                hours = data['time'] / 3600
                report += f"  • {mode.upper()}: {data['count']} sessions, {hours:.2f}h\n"

        return report

    def on_export(self):
        """Export session data"""
        from PyQt6.QtWidgets import QDialog, QVBoxLayout, QRadioButton, QButtonGroup

        # Export dialog
        dialog = QDialog(self)
        dialog.setWindowTitle("Export Data")
        dialog.setMinimumWidth(300)

        layout = QVBoxLayout()

        label = QLabel("Select export format:")
        label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']}; padding: 10px;")
        layout.addWidget(label)

        # Format selection
        format_group = QButtonGroup(dialog)
        csv_radio = QRadioButton("CSV (Comma-separated)")
        txt_radio = QRadioButton("TXT (Plain text)")
        csv_radio.setChecked(True)

        format_group.addButton(csv_radio)
        format_group.addButton(txt_radio)

        layout.addWidget(csv_radio)
        layout.addWidget(txt_radio)

        # Buttons
        from PyQt6.QtWidgets import QDialogButtonBox
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Ok | QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(dialog.accept)
        button_box.rejected.connect(dialog.reject)
        layout.addWidget(button_box)

        dialog.setLayout(layout)

        if dialog.exec() == QDialog.DialogCode.Accepted:
            # Get file path
            if csv_radio.isChecked():
                file_path, _ = QFileDialog.getSaveFileName(
                    self,
                    "Export to CSV",
                    f"jarvis_sessions_{datetime.now().strftime('%Y%m%d')}.csv",
                    "CSV Files (*.csv)"
                )
                if file_path:
                    self.session_tracker.export_sessions_csv(file_path)
                    QMessageBox.information(self, "Success", f"Data exported to:\n{file_path}")
            else:
                file_path, _ = QFileDialog.getSaveFileName(
                    self,
                    "Export to TXT",
                    f"jarvis_sessions_{datetime.now().strftime('%Y%m%d')}.txt",
                    "Text Files (*.txt)"
                )
                if file_path:
                    self.session_tracker.export_sessions_txt(file_path)
                    QMessageBox.information(self, "Success", f"Data exported to:\n{file_path}")

    def refresh(self):
        """Refresh report"""
        self.load_report()
