"""Settings view - Application configuration"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QCheckBox, QComboBox, QGroupBox, QMessageBox,
                              QScrollArea, QFrame)
from PyQt6.QtCore import Qt
from ..ui.widgets import GlowButton
from ..ui.styles import COLORS
from ..utils.system import WindowsIntegration


class SettingsView(QWidget):
    """Settings view"""

    def __init__(self, data_manager):
        super().__init__()
        self.data_manager = data_manager
        self.setup_ui()
        self.load_settings()

    def setup_ui(self):
        """Setup settings view"""
        # Main scroll area
        scroll = QScrollArea()
        scroll.setWidgetResizable(True)
        scroll.setFrameShape(QFrame.Shape.NoFrame)

        content = QWidget()
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(25)

        # Header
        header = QLabel("SETTINGS")
        header.setStyleSheet(f"""
            font-size: 32px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
        """)
        layout.addWidget(header)

        # General Settings
        general_group = QGroupBox("General")
        general_layout = QVBoxLayout()

        self.auto_start_check = QCheckBox("Start with Windows")
        self.auto_start_check.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        general_layout.addWidget(self.auto_start_check)

        self.minimize_tray_check = QCheckBox("Minimize to system tray")
        self.minimize_tray_check.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        general_layout.addWidget(self.minimize_tray_check)

        self.notification_sound_check = QCheckBox("Play notification sounds")
        self.notification_sound_check.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        general_layout.addWidget(self.notification_sound_check)

        general_group.setLayout(general_layout)
        layout.addWidget(general_group)

        # Pomodoro Settings
        pomodoro_group = QGroupBox("Pomodoro")
        pomodoro_layout = QVBoxLayout()

        pomodoro_preset_layout = QHBoxLayout()
        pomodoro_preset_label = QLabel("Default Duration:")
        pomodoro_preset_label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        pomodoro_preset_layout.addWidget(pomodoro_preset_label)

        self.pomodoro_combo = QComboBox()
        self.pomodoro_combo.addItems(["25 minutes", "50 minutes", "90 minutes"])
        self.pomodoro_combo.setMaximumWidth(150)
        pomodoro_preset_layout.addWidget(self.pomodoro_combo)
        pomodoro_preset_layout.addStretch()

        pomodoro_layout.addLayout(pomodoro_preset_layout)

        self.wisdom_enabled_check = QCheckBox("Show wisdom quotes during sessions")
        self.wisdom_enabled_check.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        pomodoro_layout.addWidget(self.wisdom_enabled_check)

        pomodoro_group.setLayout(pomodoro_layout)
        layout.addWidget(pomodoro_group)

        # Interface Settings
        interface_group = QGroupBox("Interface")
        interface_layout = QVBoxLayout()

        self.command_bar_check = QCheckBox("Show command bar")
        self.command_bar_check.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        interface_layout.addWidget(self.command_bar_check)

        theme_layout = QHBoxLayout()
        theme_label = QLabel("Theme:")
        theme_label.setStyleSheet(f"font-size: 14px; color: {COLORS['text_primary']};")
        theme_layout.addWidget(theme_label)

        self.theme_combo = QComboBox()
        self.theme_combo.addItems(["JARVIS Dark"])
        self.theme_combo.setEnabled(False)  # Only one theme for now
        self.theme_combo.setMaximumWidth(150)
        theme_layout.addWidget(self.theme_combo)
        theme_layout.addStretch()

        interface_layout.addLayout(theme_layout)

        interface_group.setLayout(interface_layout)
        layout.addWidget(interface_group)

        # About section
        about_group = QGroupBox("About")
        about_layout = QVBoxLayout()

        about_text = QLabel("""
<b>JARVIS AI Production Assistant</b><br>
Version 1.0.0<br><br>

A powerful Windows desktop application for maximizing deep work and productivity.<br><br>

<b>Features:</b><br>
• AI Tool Hub with centralized access<br>
• Pomodoro timer for focus sessions<br>
• Wisdom quotes from ancient traditions<br>
• Prompt library for AI workflows<br>
• Project quick modes<br>
• Productivity tracking and reports<br>
        """)
        about_text.setStyleSheet(f"font-size: 13px; color: {COLORS['text_secondary']}; line-height: 1.6;")
        about_text.setWordWrap(True)
        about_layout.addWidget(about_text)

        about_group.setLayout(about_layout)
        layout.addWidget(about_group)

        layout.addStretch()

        # Save button
        save_layout = QHBoxLayout()
        save_layout.addStretch()

        btn_save = GlowButton("💾 Save Settings", primary=True)
        btn_save.setMinimumWidth(200)
        btn_save.clicked.connect(self.save_settings)
        save_layout.addWidget(btn_save)

        layout.addLayout(save_layout)

        content.setLayout(layout)
        scroll.setWidget(content)

        # Main layout
        main_layout = QVBoxLayout()
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.addWidget(scroll)
        self.setLayout(main_layout)

    def load_settings(self):
        """Load settings from database"""
        settings = self.data_manager.get_settings()

        # Auto-start (check actual Windows registry)
        self.auto_start_check.setChecked(WindowsIntegration.is_auto_start_enabled())

        # Other settings
        self.minimize_tray_check.setChecked(settings.get("minimize_to_tray", False))
        self.notification_sound_check.setChecked(settings.get("notification_sound", True))
        self.wisdom_enabled_check.setChecked(settings.get("wisdom_enabled", True))
        self.command_bar_check.setChecked(settings.get("show_command_bar", True))

        # Pomodoro preset
        default_pomodoro = settings.get("default_pomodoro", 25)
        presets = [25, 50, 90]
        if default_pomodoro in presets:
            self.pomodoro_combo.setCurrentIndex(presets.index(default_pomodoro))

    def save_settings(self):
        """Save settings to database"""
        # Handle auto-start
        if self.auto_start_check.isChecked():
            if not WindowsIntegration.enable_auto_start():
                QMessageBox.warning(
                    self,
                    "Warning",
                    "Could not enable auto-start. This may require administrator privileges."
                )
        else:
            WindowsIntegration.disable_auto_start()

        # Pomodoro preset
        pomodoro_presets = [25, 50, 90]
        default_pomodoro = pomodoro_presets[self.pomodoro_combo.currentIndex()]

        # Save other settings
        settings = {
            "auto_start": self.auto_start_check.isChecked(),
            "minimize_to_tray": self.minimize_tray_check.isChecked(),
            "notification_sound": self.notification_sound_check.isChecked(),
            "wisdom_enabled": self.wisdom_enabled_check.isChecked(),
            "show_command_bar": self.command_bar_check.isChecked(),
            "default_pomodoro": default_pomodoro,
            "theme": "jarvis_dark"
        }

        self.data_manager.update_settings(settings)

        QMessageBox.information(
            self,
            "Success",
            "Settings saved successfully!\n\nSome changes may require restarting the application."
        )

    def refresh(self):
        """Refresh settings"""
        self.load_settings()
