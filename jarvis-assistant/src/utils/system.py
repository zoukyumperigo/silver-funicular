"""System utilities for Windows integration"""

import os
import sys
import winreg
from pathlib import Path


class WindowsIntegration:
    """Handles Windows-specific features"""

    APP_NAME = "JARVIS Assistant"
    REG_PATH = r"Software\Microsoft\Windows\CurrentVersion\Run"

    @classmethod
    def is_windows(cls) -> bool:
        """Check if running on Windows"""
        return sys.platform == "win32"

    @classmethod
    def get_executable_path(cls) -> str:
        """Get the path to the executable"""
        if getattr(sys, 'frozen', False):
            # Running as compiled executable
            return sys.executable
        else:
            # Running as script
            return os.path.abspath(sys.argv[0])

    @classmethod
    def is_auto_start_enabled(cls) -> bool:
        """Check if auto-start is enabled"""
        if not cls.is_windows():
            return False

        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, cls.REG_PATH, 0, winreg.KEY_READ)
            try:
                value, _ = winreg.QueryValueEx(key, cls.APP_NAME)
                winreg.CloseKey(key)
                return True
            except FileNotFoundError:
                winreg.CloseKey(key)
                return False
        except Exception:
            return False

    @classmethod
    def enable_auto_start(cls) -> bool:
        """Enable auto-start with Windows"""
        if not cls.is_windows():
            return False

        try:
            exe_path = cls.get_executable_path()
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, cls.REG_PATH, 0, winreg.KEY_WRITE)
            winreg.SetValueEx(key, cls.APP_NAME, 0, winreg.REG_SZ, f'"{exe_path}"')
            winreg.CloseKey(key)
            return True
        except Exception as e:
            print(f"Error enabling auto-start: {e}")
            return False

    @classmethod
    def disable_auto_start(cls) -> bool:
        """Disable auto-start with Windows"""
        if not cls.is_windows():
            return False

        try:
            key = winreg.OpenKey(winreg.HKEY_CURRENT_USER, cls.REG_PATH, 0, winreg.KEY_WRITE)
            try:
                winreg.DeleteValue(key, cls.APP_NAME)
                winreg.CloseKey(key)
                return True
            except FileNotFoundError:
                winreg.CloseKey(key)
                return True
        except Exception as e:
            print(f"Error disabling auto-start: {e}")
            return False

    @classmethod
    def get_startup_folder(cls) -> Path:
        """Get the Windows startup folder path"""
        if cls.is_windows():
            startup = Path(os.getenv('APPDATA')) / "Microsoft" / "Windows" / "Start Menu" / "Programs" / "Startup"
            return startup
        return None

    @classmethod
    def create_shortcut_in_startup(cls):
        """Create a shortcut in the startup folder (alternative method)"""
        try:
            import win32com.client
            startup_folder = cls.get_startup_folder()
            if not startup_folder:
                return False

            shortcut_path = startup_folder / f"{cls.APP_NAME}.lnk"
            target = cls.get_executable_path()

            shell = win32com.client.Dispatch("WScript.Shell")
            shortcut = shell.CreateShortCut(str(shortcut_path))
            shortcut.Targetpath = target
            shortcut.WorkingDirectory = str(Path(target).parent)
            shortcut.IconLocation = target
            shortcut.save()
            return True
        except Exception as e:
            print(f"Error creating shortcut: {e}")
            return False

    @classmethod
    def open_url(cls, url: str):
        """Open URL in default browser"""
        import webbrowser
        webbrowser.open(url)
