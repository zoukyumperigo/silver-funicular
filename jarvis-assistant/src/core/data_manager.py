"""Data Manager - Handles all JSON storage operations"""

import json
import os
from pathlib import Path
from typing import Any, Dict, List, Optional
from datetime import datetime


class DataManager:
    """Manages all data persistence for JARVIS Assistant"""

    def __init__(self, data_dir: str = None):
        if data_dir is None:
            # Get the project root directory
            self.data_dir = Path(__file__).parent.parent.parent / "data"
        else:
            self.data_dir = Path(data_dir)

        self.data_dir.mkdir(parents=True, exist_ok=True)

        # File paths
        self.ai_tools_file = self.data_dir / "ai_tools.json"
        self.wisdom_file = self.data_dir / "wisdom_quotes.json"
        self.prompts_file = self.data_dir / "prompts.json"
        self.sessions_file = self.data_dir / "sessions.json"
        self.settings_file = self.data_dir / "settings.json"

        self._ensure_files_exist()

    def _ensure_files_exist(self):
        """Ensure all data files exist with default content"""
        defaults = {
            self.ai_tools_file: {"tools": []},
            self.wisdom_file: {"quotes": []},
            self.prompts_file: {"prompts": []},
            self.sessions_file: {"sessions": []},
            self.settings_file: {
                "theme": "jarvis_dark",
                "auto_start": False,
                "default_pomodoro": 25,
                "wisdom_enabled": True,
                "notification_sound": True
            }
        }

        for file_path, default_content in defaults.items():
            if not file_path.exists():
                self._save_json(file_path, default_content)

    def _load_json(self, file_path: Path) -> Dict:
        """Load JSON file"""
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                return json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return {}

    def _save_json(self, file_path: Path, data: Dict):
        """Save JSON file"""
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    # AI Tools
    def get_ai_tools(self) -> List[Dict]:
        """Get all AI tools"""
        data = self._load_json(self.ai_tools_file)
        return data.get("tools", [])

    def get_ai_tool(self, tool_id: str) -> Optional[Dict]:
        """Get a specific AI tool by ID"""
        tools = self.get_ai_tools()
        return next((t for t in tools if t["id"] == tool_id), None)

    def add_ai_tool(self, tool: Dict):
        """Add a new AI tool"""
        data = self._load_json(self.ai_tools_file)
        data["tools"].append(tool)
        self._save_json(self.ai_tools_file, data)

    def update_ai_tool(self, tool_id: str, updates: Dict):
        """Update an AI tool"""
        data = self._load_json(self.ai_tools_file)
        for tool in data["tools"]:
            if tool["id"] == tool_id:
                tool.update(updates)
                break
        self._save_json(self.ai_tools_file, data)

    def delete_ai_tool(self, tool_id: str):
        """Delete an AI tool"""
        data = self._load_json(self.ai_tools_file)
        data["tools"] = [t for t in data["tools"] if t["id"] != tool_id]
        self._save_json(self.ai_tools_file, data)

    # Wisdom Quotes
    def get_wisdom_quotes(self, source: Optional[str] = None) -> List[Dict]:
        """Get wisdom quotes, optionally filtered by source"""
        data = self._load_json(self.wisdom_file)
        quotes = data.get("quotes", [])
        if source:
            quotes = [q for q in quotes if q["source"] == source]
        return quotes

    def get_random_quote(self, source: Optional[str] = None) -> Optional[Dict]:
        """Get a random wisdom quote"""
        import random
        quotes = self.get_wisdom_quotes(source)
        return random.choice(quotes) if quotes else None

    # Prompts
    def get_prompts(self, category: Optional[str] = None) -> List[Dict]:
        """Get prompts, optionally filtered by category"""
        data = self._load_json(self.prompts_file)
        prompts = data.get("prompts", [])
        if category:
            prompts = [p for p in prompts if p["category"] == category]
        return prompts

    def get_prompt(self, prompt_id: str) -> Optional[Dict]:
        """Get a specific prompt by ID"""
        prompts = self.get_prompts()
        return next((p for p in prompts if p["id"] == prompt_id), None)

    def add_prompt(self, prompt: Dict):
        """Add a new prompt"""
        import uuid
        if "id" not in prompt:
            prompt["id"] = f"prompt-{uuid.uuid4().hex[:8]}"
        if "created" not in prompt:
            prompt["created"] = datetime.now().isoformat()

        data = self._load_json(self.prompts_file)
        data["prompts"].append(prompt)
        self._save_json(self.prompts_file, data)

    def update_prompt(self, prompt_id: str, updates: Dict):
        """Update a prompt"""
        data = self._load_json(self.prompts_file)
        for prompt in data["prompts"]:
            if prompt["id"] == prompt_id:
                prompt.update(updates)
                break
        self._save_json(self.prompts_file, data)

    def delete_prompt(self, prompt_id: str):
        """Delete a prompt"""
        data = self._load_json(self.prompts_file)
        data["prompts"] = [p for p in data["prompts"] if p["id"] != prompt_id]
        self._save_json(self.prompts_file, data)

    def search_prompts(self, query: str) -> List[Dict]:
        """Search prompts by title, content, or tags"""
        prompts = self.get_prompts()
        query = query.lower()
        results = []

        for prompt in prompts:
            if (query in prompt.get("title", "").lower() or
                query in prompt.get("content", "").lower() or
                any(query in tag.lower() for tag in prompt.get("tags", []))):
                results.append(prompt)

        return results

    # Sessions
    def add_session(self, session: Dict):
        """Add a work session"""
        import uuid
        if "id" not in session:
            session["id"] = f"session-{uuid.uuid4().hex[:8]}"
        if "start_time" not in session:
            session["start_time"] = datetime.now().isoformat()

        data = self._load_json(self.sessions_file)
        data["sessions"].append(session)
        self._save_json(self.sessions_file, data)

    def get_sessions(self, date: Optional[str] = None) -> List[Dict]:
        """Get sessions, optionally filtered by date"""
        data = self._load_json(self.sessions_file)
        sessions = data.get("sessions", [])

        if date:
            sessions = [s for s in sessions if s.get("start_time", "").startswith(date)]

        return sessions

    def get_sessions_today(self) -> List[Dict]:
        """Get today's sessions"""
        today = datetime.now().strftime("%Y-%m-%d")
        return self.get_sessions(today)

    # Settings
    def get_settings(self) -> Dict:
        """Get all settings"""
        return self._load_json(self.settings_file)

    def get_setting(self, key: str, default: Any = None) -> Any:
        """Get a specific setting"""
        settings = self.get_settings()
        return settings.get(key, default)

    def update_settings(self, updates: Dict):
        """Update settings"""
        settings = self.get_settings()
        settings.update(updates)
        self._save_json(self.settings_file, settings)

    def update_setting(self, key: str, value: Any):
        """Update a single setting"""
        self.update_settings({key: value})
