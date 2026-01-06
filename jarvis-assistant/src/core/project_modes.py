"""Project Modes - Quick mode templates for different projects"""

from typing import Dict, List


class ProjectMode:
    """Represents a project mode configuration"""

    def __init__(self, id: str, name: str, icon: str, description: str,
                 ai_tools: List[str], prompts: List[str], pomodoro: int = 50):
        self.id = id
        self.name = name
        self.icon = icon
        self.description = description
        self.ai_tools = ai_tools  # List of AI tool IDs to open
        self.prompts = prompts    # List of relevant prompt categories
        self.pomodoro = pomodoro  # Default pomodoro duration


class ProjectModes:
    """Manages project mode templates"""

    MODES = {
        "saas": ProjectMode(
            id="saas",
            name="Create SaaS",
            icon="💻",
            description="Build and launch a SaaS product",
            ai_tools=["chatgpt", "claude"],
            prompts=["code", "business", "copywriting"],
            pomodoro=90
        ),
        "video": ProjectMode(
            id="video",
            name="Create Video",
            icon="🎬",
            description="Produce video content",
            ai_tools=["chatgpt", "claude"],
            prompts=["video", "copywriting"],
            pomodoro=50
        ),
        "ebook": ProjectMode(
            id="ebook",
            name="Create Ebook",
            icon="📚",
            description="Write and publish an ebook",
            ai_tools=["chatgpt", "claude"],
            prompts=["ebook", "copywriting"],
            pomodoro=90
        ),
        "social": ProjectMode(
            id="social",
            name="Social Media",
            icon="📱",
            description="Create social media content",
            ai_tools=["chatgpt", "claude"],
            prompts=["social-media", "copywriting"],
            pomodoro=25
        ),
        "code": ProjectMode(
            id="code",
            name="Code Project",
            icon="⌨️",
            description="Build software projects",
            ai_tools=["chatgpt", "claude"],
            prompts=["code"],
            pomodoro=90
        ),
        "design": ProjectMode(
            id="design",
            name="Design",
            icon="🎨",
            description="Create designs and graphics",
            ai_tools=["midjourney", "chatgpt"],
            prompts=["copywriting"],
            pomodoro=50
        ),
        "research": ProjectMode(
            id="research",
            name="Research",
            icon="🔍",
            description="Research and analysis",
            ai_tools=["chatgpt", "claude", "gemini"],
            prompts=["business"],
            pomodoro=50
        ),
        "writing": ProjectMode(
            id="writing",
            name="Writing",
            icon="✍️",
            description="Creative and technical writing",
            ai_tools=["chatgpt", "claude"],
            prompts=["ebook", "copywriting"],
            pomodoro=50
        )
    }

    @classmethod
    def get_mode(cls, mode_id: str) -> ProjectMode:
        """Get a specific project mode"""
        return cls.MODES.get(mode_id)

    @classmethod
    def get_all_modes(cls) -> Dict[str, ProjectMode]:
        """Get all project modes"""
        return cls.MODES

    @classmethod
    def get_mode_list(cls) -> List[ProjectMode]:
        """Get all modes as a list"""
        return list(cls.MODES.values())

    @classmethod
    def get_mode_for_button(cls, mode_id: str) -> Dict:
        """Get mode data formatted for UI button"""
        mode = cls.get_mode(mode_id)
        if mode:
            return {
                "id": mode.id,
                "name": mode.name,
                "icon": mode.icon,
                "description": mode.description
            }
        return None
