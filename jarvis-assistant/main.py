#!/usr/bin/env python3
"""
JARVIS AI Production Assistant
Main entry point
"""

import sys
import os

# Add src directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'src'))

from src.app import run_application

if __name__ == "__main__":
    run_application()
