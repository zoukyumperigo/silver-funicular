"""Wisdom Engine - Displays motivational quotes from ancient wisdom"""

import random
from typing import Optional, Dict, List


class WisdomEngine:
    """Manages wisdom quotes from Islam, Ancient Greece, and Ancient Rome"""

    SOURCES = ["islam", "greece", "rome"]

    def __init__(self, data_manager):
        self.data_manager = data_manager

    def get_random_quote(self, source: Optional[str] = None) -> Optional[Dict]:
        """Get a random quote, optionally from a specific source"""
        return self.data_manager.get_random_quote(source)

    def get_all_quotes(self, source: Optional[str] = None) -> List[Dict]:
        """Get all quotes, optionally filtered by source"""
        return self.data_manager.get_wisdom_quotes(source)

    def format_quote(self, quote: Dict) -> str:
        """Format a quote for display"""
        source = quote.get("source", "").upper()
        lines = [f"═══ {source} ═══\n"]

        # Add original text (Arabic, Greek, or Latin)
        if "arabic" in quote:
            lines.append(f"📿 {quote['arabic']}")
            lines.append(f"   ({quote.get('transliteration', '')})")
        elif "greek" in quote:
            lines.append(f"🏛️ {quote['greek']}")
            if "transliteration" in quote:
                lines.append(f"   ({quote['transliteration']})")
        elif "latin" in quote:
            lines.append(f"🏺 {quote['latin']}")
        elif "original" in quote:
            lines.append(f"   {quote['original']}")

        # Add Portuguese translation
        if "portuguese" in quote:
            lines.append(f"\n💭 {quote['portuguese']}")

        # Add reference
        if "reference" in quote:
            lines.append(f"\n— {quote['reference']}")

        return "\n".join(lines)

    def format_quote_html(self, quote: Dict) -> str:
        """Format a quote as HTML for rich display"""
        source = quote.get("source", "").upper()

        # Choose color based on source
        color_map = {
            "islam": "#00ff88",  # Green
            "greece": "#00d9ff",  # Cyan
            "rome": "#ff6b6b"    # Red
        }
        color = color_map.get(quote.get("source", ""), "#00d9ff")

        html = f'<div style="padding: 20px; background: rgba(26, 35, 50, 0.8); border-left: 4px solid {color}; border-radius: 8px;">'
        html += f'<div style="color: {color}; font-size: 14px; font-weight: bold; margin-bottom: 15px;">═══ {source} ═══</div>'

        # Add original text
        if "arabic" in quote:
            html += f'<div style="font-size: 24px; color: #e0e6ed; font-family: Arial; margin-bottom: 8px; direction: rtl;">{quote["arabic"]}</div>'
            html += f'<div style="font-size: 12px; color: #8892a0; margin-bottom: 12px;">({quote.get("transliteration", "")})</div>'
        elif "greek" in quote:
            html += f'<div style="font-size: 20px; color: #e0e6ed; margin-bottom: 8px;">{quote["greek"]}</div>'
            if "transliteration" in quote:
                html += f'<div style="font-size: 12px; color: #8892a0; margin-bottom: 12px;">({quote["transliteration"]})</div>'
        elif "latin" in quote:
            html += f'<div style="font-size: 20px; color: #e0e6ed; font-style: italic; margin-bottom: 8px;">{quote["latin"]}</div>'
        elif "original" in quote:
            html += f'<div style="font-size: 16px; color: #e0e6ed; font-style: italic; margin-bottom: 12px;">"{quote["original"]}"</div>'

        # Add Portuguese translation
        if "portuguese" in quote:
            html += f'<div style="font-size: 16px; color: #c0c6cd; margin-top: 12px; line-height: 1.6;">💭 {quote["portuguese"]}</div>'

        # Add reference
        if "reference" in quote:
            html += f'<div style="font-size: 12px; color: #6872a0; margin-top: 15px; text-align: right;">— {quote["reference"]}</div>'

        html += '</div>'
        return html

    def get_quote_for_session_start(self) -> Optional[Dict]:
        """Get a motivational quote for starting a focus session"""
        # Prefer quotes about action, discipline, and beginning
        all_quotes = self.get_all_quotes()
        return random.choice(all_quotes) if all_quotes else None

    def get_quote_for_session_end(self) -> Optional[Dict]:
        """Get a quote for completing a focus session"""
        # Prefer quotes about perseverance and achievement
        all_quotes = self.get_all_quotes()
        return random.choice(all_quotes) if all_quotes else None

    def get_daily_quote(self) -> Optional[Dict]:
        """Get a quote for daily inspiration"""
        return self.get_random_quote()
