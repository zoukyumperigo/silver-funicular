"""Session Tracker - Tracks work sessions and productivity"""

from datetime import datetime, timedelta
from typing import List, Dict
from collections import defaultdict


class SessionTracker:
    """Tracks and analyzes work sessions"""

    def __init__(self, data_manager):
        self.data_manager = data_manager

    def get_today_stats(self) -> Dict:
        """Get statistics for today"""
        sessions = self.data_manager.get_sessions_today()
        return self._calculate_stats(sessions)

    def get_week_stats(self) -> Dict:
        """Get statistics for the past 7 days"""
        today = datetime.now()
        week_ago = today - timedelta(days=7)

        all_sessions = self.data_manager.get_sessions()
        week_sessions = [
            s for s in all_sessions
            if s.get("start_time", "") >= week_ago.isoformat()
        ]

        return self._calculate_stats(week_sessions)

    def get_stats_by_date(self, date: str) -> Dict:
        """Get statistics for a specific date (YYYY-MM-DD)"""
        sessions = self.data_manager.get_sessions(date)
        return self._calculate_stats(sessions)

    def _calculate_stats(self, sessions: List[Dict]) -> Dict:
        """Calculate statistics from sessions"""
        total_sessions = len(sessions)
        completed_sessions = sum(1 for s in sessions if s.get("completed", False))
        interrupted_sessions = total_sessions - completed_sessions

        total_time = sum(s.get("duration", 0) for s in sessions)
        total_time_hours = total_time / 3600

        # Group by mode
        mode_stats = defaultdict(lambda: {"count": 0, "time": 0})
        for session in sessions:
            mode = session.get("mode", "general")
            mode_stats[mode]["count"] += 1
            mode_stats[mode]["time"] += session.get("duration", 0)

        return {
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "interrupted_sessions": interrupted_sessions,
            "completion_rate": (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0,
            "total_time_seconds": total_time,
            "total_time_hours": total_time_hours,
            "average_session_minutes": (total_time / 60 / total_sessions) if total_sessions > 0 else 0,
            "mode_breakdown": dict(mode_stats)
        }

    def get_daily_report(self, date: str = None) -> str:
        """Generate a daily report"""
        if date is None:
            date = datetime.now().strftime("%Y-%m-%d")

        stats = self.get_stats_by_date(date)

        report = f"📊 PRODUCTIVITY REPORT - {date}\n"
        report += "═" * 50 + "\n\n"
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

    def export_sessions_csv(self, output_file: str, date_from: str = None, date_to: str = None):
        """Export sessions to CSV"""
        import csv

        sessions = self.data_manager.get_sessions()

        # Filter by date range if provided
        if date_from:
            sessions = [s for s in sessions if s.get("start_time", "") >= date_from]
        if date_to:
            sessions = [s for s in sessions if s.get("start_time", "") <= date_to]

        with open(output_file, 'w', newline='', encoding='utf-8') as f:
            writer = csv.writer(f)
            writer.writerow(['ID', 'Start Time', 'Duration (min)', 'Type', 'Mode', 'Completed'])

            for session in sessions:
                writer.writerow([
                    session.get('id', ''),
                    session.get('start_time', ''),
                    session.get('duration', 0) / 60,
                    session.get('type', ''),
                    session.get('mode', ''),
                    'Yes' if session.get('completed', False) else 'No'
                ])

    def export_sessions_txt(self, output_file: str, date_from: str = None, date_to: str = None):
        """Export sessions to TXT"""
        sessions = self.data_manager.get_sessions()

        # Filter by date range if provided
        if date_from:
            sessions = [s for s in sessions if s.get("start_time", "") >= date_from]
        if date_to:
            sessions = [s for s in sessions if s.get("start_time", "") <= date_to]

        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("═" * 60 + "\n")
            f.write("JARVIS ASSISTANT - SESSION LOG\n")
            f.write("═" * 60 + "\n\n")

            for session in sessions:
                f.write(f"Session: {session.get('id', 'N/A')}\n")
                f.write(f"Start Time: {session.get('start_time', 'N/A')}\n")
                f.write(f"Duration: {session.get('duration', 0) / 60:.1f} minutes\n")
                f.write(f"Type: {session.get('type', 'N/A')}\n")
                f.write(f"Mode: {session.get('mode', 'General')}\n")
                f.write(f"Completed: {'Yes' if session.get('completed', False) else 'No'}\n")
                f.write("-" * 60 + "\n\n")
