"""Prompt Library - Manage and organize prompts"""

from PyQt6.QtWidgets import (QWidget, QVBoxLayout, QHBoxLayout, QLabel,
                              QListWidget, QListWidgetItem, QTextEdit, QPushButton,
                              QLineEdit, QComboBox, QDialog, QDialogButtonBox,
                              QFormLayout, QMessageBox, QSplitter, QFrame)
from PyQt6.QtCore import Qt
from ..ui.widgets import GlowButton
from ..ui.styles import COLORS


class PromptDialog(QDialog):
    """Dialog for creating/editing prompts"""

    def __init__(self, parent=None, prompt=None):
        super().__init__(parent)
        self.prompt = prompt
        self.is_edit = prompt is not None
        self.setup_ui()

        if self.is_edit:
            self.load_prompt()

    def setup_ui(self):
        """Setup dialog UI"""
        self.setWindowTitle("Edit Prompt" if self.is_edit else "New Prompt")
        self.setMinimumWidth(600)
        self.setMinimumHeight(500)

        layout = QVBoxLayout()

        # Form
        form = QFormLayout()

        self.title_input = QLineEdit()
        self.title_input.setPlaceholderText("Enter prompt title...")
        form.addRow("Title:", self.title_input)

        self.category_combo = QComboBox()
        self.category_combo.addItems(["code", "copywriting", "video", "ebook", "social-media", "business"])
        form.addRow("Category:", self.category_combo)

        self.tags_input = QLineEdit()
        self.tags_input.setPlaceholderText("Enter tags separated by commas...")
        form.addRow("Tags:", self.tags_input)

        layout.addLayout(form)

        # Content
        content_label = QLabel("Prompt Content:")
        content_label.setStyleSheet(f"font-weight: bold; color: {COLORS['text_primary']};")
        layout.addWidget(content_label)

        self.content_edit = QTextEdit()
        self.content_edit.setPlaceholderText("Enter your prompt content here...")
        self.content_edit.setMinimumHeight(250)
        layout.addWidget(self.content_edit)

        # Buttons
        button_box = QDialogButtonBox(
            QDialogButtonBox.StandardButton.Save | QDialogButtonBox.StandardButton.Cancel
        )
        button_box.accepted.connect(self.accept)
        button_box.rejected.connect(self.reject)
        layout.addWidget(button_box)

        self.setLayout(layout)

    def load_prompt(self):
        """Load prompt data into form"""
        self.title_input.setText(self.prompt.get("title", ""))
        self.content_edit.setPlainText(self.prompt.get("content", ""))

        category = self.prompt.get("category", "code")
        index = self.category_combo.findText(category)
        if index >= 0:
            self.category_combo.setCurrentIndex(index)

        tags = self.prompt.get("tags", [])
        self.tags_input.setText(", ".join(tags))

    def get_prompt_data(self):
        """Get prompt data from form"""
        tags = [tag.strip() for tag in self.tags_input.text().split(",") if tag.strip()]

        return {
            "title": self.title_input.text().strip(),
            "content": self.content_edit.toPlainText().strip(),
            "category": self.category_combo.currentText(),
            "tags": tags
        }


class PromptsView(QWidget):
    """Prompt library view"""

    def __init__(self, data_manager):
        super().__init__()
        self.data_manager = data_manager
        self.current_prompt = None
        self.setup_ui()
        self.load_prompts()

    def setup_ui(self):
        """Setup prompts view"""
        layout = QVBoxLayout()
        layout.setContentsMargins(30, 30, 30, 30)
        layout.setSpacing(20)

        # Header
        header_layout = QHBoxLayout()

        header = QLabel("PROMPT LIBRARY")
        header.setStyleSheet(f"""
            font-size: 32px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
        """)
        header_layout.addWidget(header)

        header_layout.addStretch()

        # New prompt button
        btn_new = GlowButton("+ New Prompt", primary=True)
        btn_new.clicked.connect(self.on_new_prompt)
        header_layout.addWidget(btn_new)

        layout.addLayout(header_layout)

        # Filters
        filter_layout = QHBoxLayout()
        filter_layout.setSpacing(15)

        self.search_input = QLineEdit()
        self.search_input.setPlaceholderText("🔍 Search prompts...")
        self.search_input.textChanged.connect(self.filter_prompts)
        self.search_input.setMaximumWidth(300)
        filter_layout.addWidget(self.search_input)

        self.category_filter = QComboBox()
        self.category_filter.addItems(["All Categories", "Code", "Copywriting", "Video", "Ebook", "Social-Media", "Business"])
        self.category_filter.currentTextChanged.connect(self.filter_prompts)
        self.category_filter.setMaximumWidth(200)
        filter_layout.addWidget(self.category_filter)

        filter_layout.addStretch()
        layout.addLayout(filter_layout)

        # Splitter for list and preview
        splitter = QSplitter(Qt.Orientation.Horizontal)

        # Prompts list
        self.prompts_list = QListWidget()
        self.prompts_list.itemClicked.connect(self.on_prompt_selected)
        self.prompts_list.setMinimumWidth(300)
        splitter.addWidget(self.prompts_list)

        # Preview/detail panel
        preview_widget = QWidget()
        preview_layout = QVBoxLayout()
        preview_layout.setContentsMargins(0, 0, 0, 0)

        self.preview_title = QLabel("Select a prompt to view details")
        self.preview_title.setStyleSheet(f"""
            font-size: 20px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            padding: 15px;
        """)
        preview_layout.addWidget(self.preview_title)

        self.preview_meta = QLabel("")
        self.preview_meta.setStyleSheet(f"""
            font-size: 12px;
            color: {COLORS['text_secondary']};
            padding: 0 15px 10px 15px;
        """)
        preview_layout.addWidget(self.preview_meta)

        self.preview_content = QTextEdit()
        self.preview_content.setReadOnly(True)
        self.preview_content.setStyleSheet(f"""
            QTextEdit {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['border']};
                border-radius: 8px;
                padding: 15px;
                font-family: 'Consolas', 'Courier New', monospace;
                font-size: 13px;
            }}
        """)
        preview_layout.addWidget(self.preview_content)

        # Action buttons
        actions_layout = QHBoxLayout()
        actions_layout.setSpacing(10)

        self.btn_copy = GlowButton("📋 Copy")
        self.btn_copy.setEnabled(False)
        self.btn_copy.clicked.connect(self.on_copy_prompt)
        actions_layout.addWidget(self.btn_copy)

        self.btn_edit = GlowButton("✏️ Edit")
        self.btn_edit.setEnabled(False)
        self.btn_edit.clicked.connect(self.on_edit_prompt)
        actions_layout.addWidget(self.btn_edit)

        self.btn_delete = GlowButton("🗑️ Delete")
        self.btn_delete.setEnabled(False)
        self.btn_delete.clicked.connect(self.on_delete_prompt)
        actions_layout.addWidget(self.btn_delete)

        actions_layout.addStretch()
        preview_layout.addLayout(actions_layout)

        preview_widget.setLayout(preview_layout)
        splitter.addWidget(preview_widget)

        splitter.setSizes([300, 700])
        layout.addWidget(splitter)

        self.setLayout(layout)

    def load_prompts(self):
        """Load prompts from database"""
        self.all_prompts = self.data_manager.get_prompts()
        self.display_prompts(self.all_prompts)

    def filter_prompts(self):
        """Filter prompts based on search and category"""
        search_text = self.search_input.text().lower()
        category = self.category_filter.currentText()

        if search_text:
            filtered = self.data_manager.search_prompts(search_text)
        else:
            filtered = self.all_prompts.copy()

        if category != "All Categories":
            filtered = [p for p in filtered if p.get("category", "").lower() == category.lower()]

        self.display_prompts(filtered)

    def display_prompts(self, prompts):
        """Display prompts in list"""
        self.prompts_list.clear()

        for prompt in prompts:
            item = QListWidgetItem()
            title = prompt.get("title", "Untitled")
            category = prompt.get("category", "")
            tags = ", ".join(prompt.get("tags", []))

            item.setText(f"{title}\n{category} • {tags}" if tags else f"{title}\n{category}")
            item.setData(Qt.ItemDataRole.UserRole, prompt)
            self.prompts_list.addItem(item)

    def on_prompt_selected(self, item):
        """Handle prompt selection"""
        self.current_prompt = item.data(Qt.ItemDataRole.UserRole)

        # Update preview
        self.preview_title.setText(self.current_prompt.get("title", "Untitled"))

        category = self.current_prompt.get("category", "")
        tags = ", ".join(self.current_prompt.get("tags", []))
        meta = f"Category: {category}"
        if tags:
            meta += f" • Tags: {tags}"

        self.preview_meta.setText(meta)
        self.preview_content.setPlainText(self.current_prompt.get("content", ""))

        # Enable action buttons
        self.btn_copy.setEnabled(True)
        self.btn_edit.setEnabled(True)
        self.btn_delete.setEnabled(True)

    def on_new_prompt(self):
        """Create new prompt"""
        dialog = PromptDialog(self)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            prompt_data = dialog.get_prompt_data()
            if prompt_data["title"] and prompt_data["content"]:
                self.data_manager.add_prompt(prompt_data)
                self.load_prompts()
                QMessageBox.information(self, "Success", "Prompt created successfully!")
            else:
                QMessageBox.warning(self, "Error", "Title and content are required!")

    def on_edit_prompt(self):
        """Edit selected prompt"""
        if not self.current_prompt:
            return

        dialog = PromptDialog(self, self.current_prompt)
        if dialog.exec() == QDialog.DialogCode.Accepted:
            prompt_data = dialog.get_prompt_data()
            if prompt_data["title"] and prompt_data["content"]:
                self.data_manager.update_prompt(self.current_prompt["id"], prompt_data)
                self.load_prompts()
                QMessageBox.information(self, "Success", "Prompt updated successfully!")

    def on_delete_prompt(self):
        """Delete selected prompt"""
        if not self.current_prompt:
            return

        reply = QMessageBox.question(
            self,
            "Delete Prompt",
            f"Are you sure you want to delete '{self.current_prompt.get('title')}'?",
            QMessageBox.StandardButton.Yes | QMessageBox.StandardButton.No
        )

        if reply == QMessageBox.StandardButton.Yes:
            self.data_manager.delete_prompt(self.current_prompt["id"])
            self.current_prompt = None
            self.load_prompts()
            self.preview_title.setText("Select a prompt to view details")
            self.preview_meta.setText("")
            self.preview_content.clear()
            self.btn_copy.setEnabled(False)
            self.btn_edit.setEnabled(False)
            self.btn_delete.setEnabled(False)

    def on_copy_prompt(self):
        """Copy prompt to clipboard"""
        if self.current_prompt:
            from PyQt6.QtWidgets import QApplication
            QApplication.clipboard().setText(self.current_prompt.get("content", ""))
            QMessageBox.information(self, "Copied", "Prompt copied to clipboard!")

    def refresh(self):
        """Refresh prompts list"""
        self.load_prompts()
