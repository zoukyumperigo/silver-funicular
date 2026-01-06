"""HUD-style widgets for JARVIS interface - Iron Man inspired"""

from PyQt6.QtWidgets import QWidget, QLabel, QVBoxLayout, QHBoxLayout, QFrame
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QRect
from PyQt6.QtGui import QPainter, QPen, QColor, QFont, QConicalGradient, QBrush
import math
import psutil
from datetime import datetime
from .styles import COLORS


class CircularGauge(QWidget):
    """Circular gauge widget for HUD display"""

    def __init__(self, title: str, unit: str = "%", max_value: float = 100):
        super().__init__()
        self.title = title
        self.unit = unit
        self.max_value = max_value
        self.value = 0
        self.setMinimumSize(150, 150)

    def set_value(self, value: float):
        """Update gauge value"""
        self.value = min(value, self.max_value)
        self.update()

    def paintEvent(self, event):
        """Paint the circular gauge"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        width = self.width()
        height = self.height()
        side = min(width, height)

        painter.setViewport((width - side) // 2, (height - side) // 2, side, side)
        painter.setWindow(-50, -50, 100, 100)

        # Draw outer ring
        pen = QPen(QColor(COLORS['border']))
        pen.setWidth(2)
        painter.setPen(pen)
        painter.drawEllipse(-45, -45, 90, 90)

        # Draw inner ring
        pen = QPen(QColor(COLORS['bg_tertiary']))
        pen.setWidth(3)
        painter.setPen(pen)
        painter.drawEllipse(-40, -40, 80, 80)

        # Draw value arc
        progress = (self.value / self.max_value) * 360
        pen = QPen(QColor(COLORS['accent_cyan']))
        pen.setWidth(6)
        pen.setCapStyle(Qt.PenCapStyle.RoundCap)
        painter.setPen(pen)
        painter.drawArc(-40, -40, 80, 80, 90 * 16, -int(progress * 16))

        # Draw center circle
        gradient = QConicalGradient(0, 0, -90)
        gradient.setColorAt(0, QColor(COLORS['accent_cyan']))
        gradient.setColorAt(self.value / self.max_value, QColor(COLORS['accent_green']))
        gradient.setColorAt(1, QColor(COLORS['bg_secondary']))

        painter.setBrush(QBrush(QColor(COLORS['bg_primary'])))
        painter.setPen(QPen(QColor(COLORS['accent_cyan']), 2))
        painter.drawEllipse(-30, -30, 60, 60)

        # Draw value text
        painter.setPen(QColor(COLORS['accent_cyan']))
        painter.setFont(QFont('Consolas', 18, QFont.Weight.Bold))
        text = f"{int(self.value)}"
        painter.drawText(-20, -5, 40, 20, Qt.AlignmentFlag.AlignCenter, text)

        # Draw unit
        painter.setFont(QFont('Consolas', 8))
        painter.drawText(-20, 10, 40, 15, Qt.AlignmentFlag.AlignCenter, self.unit)

        # Draw title
        painter.setFont(QFont('Consolas', 7, QFont.Weight.Bold))
        painter.setPen(QColor(COLORS['text_secondary']))
        painter.drawText(-45, 35, 90, 15, Qt.AlignmentFlag.AlignCenter, self.title)


class SystemMonitor(QFrame):
    """System monitoring HUD widget"""

    def __init__(self):
        super().__init__()
        self.setup_ui()
        self.setup_timer()

    def setup_ui(self):
        """Setup UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(10)

        # Title
        title = QLabel("SYSTEM STATUS")
        title.setStyleSheet(f"""
            font-size: 12px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
        """)
        title.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(title)

        # Gauges
        gauges_layout = QHBoxLayout()
        gauges_layout.setSpacing(15)

        self.cpu_gauge = CircularGauge("CPU", "%")
        self.ram_gauge = CircularGauge("RAM", "%")
        self.disk_gauge = CircularGauge("DISK", "%")

        gauges_layout.addWidget(self.cpu_gauge)
        gauges_layout.addWidget(self.ram_gauge)
        gauges_layout.addWidget(self.disk_gauge)

        layout.addLayout(gauges_layout)

        # Details
        self.details_label = QLabel()
        self.details_label.setStyleSheet(f"""
            font-size: 10px;
            color: {COLORS['text_secondary']};
            font-family: 'Consolas';
        """)
        self.details_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.details_label)

        self.setLayout(layout)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['accent_cyan']};
                border-radius: 10px;
            }}
        """)

    def setup_timer(self):
        """Setup update timer"""
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_stats)
        self.timer.start(1000)  # Update every second
        self.update_stats()

    def update_stats(self):
        """Update system statistics"""
        try:
            # CPU
            cpu_percent = psutil.cpu_percent(interval=0.1)
            self.cpu_gauge.set_value(cpu_percent)

            # RAM
            ram = psutil.virtual_memory()
            self.ram_gauge.set_value(ram.percent)

            # Disk
            disk = psutil.disk_usage('/')
            self.disk_gauge.set_value(disk.percent)

            # Details
            details = f"CPU: {cpu_percent:.1f}% | RAM: {ram.used // (1024**3)}GB / {ram.total // (1024**3)}GB | Disk: {disk.used // (1024**3)}GB / {disk.total // (1024**3)}GB"
            self.details_label.setText(details)

        except Exception as e:
            print(f"Error updating system stats: {e}")


class FinancialTicker(QFrame):
    """Real-time financial data ticker"""

    def __init__(self):
        super().__init__()
        self.setup_ui()
        self.setup_timer()

    def setup_ui(self):
        """Setup UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(10)

        # Title
        title = QLabel("⚡ FINANCIAL MARKETS")
        title.setStyleSheet(f"""
            font-size: 14px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
        """)
        layout.addWidget(title)

        # Data grid
        data_layout = QVBoxLayout()
        data_layout.setSpacing(8)

        # USD/BRL
        self.usd_label = QLabel("USD/BRL: Loading...")
        self.usd_label.setStyleSheet(self._get_ticker_style())
        data_layout.addWidget(self.usd_label)

        # EUR/BRL
        self.eur_label = QLabel("EUR/BRL: Loading...")
        self.eur_label.setStyleSheet(self._get_ticker_style())
        data_layout.addWidget(self.eur_label)

        # BTC
        self.btc_label = QLabel("BTC/USD: Loading...")
        self.btc_label.setStyleSheet(self._get_ticker_style())
        data_layout.addWidget(self.btc_label)

        # Stocks placeholder (would need API)
        stocks_label = QLabel("STOCKS: AAPL • GOOGL • MSFT • TSLA")
        stocks_label.setStyleSheet(f"""
            font-size: 9px;
            color: {COLORS['text_tertiary']};
            font-family: 'Consolas';
            padding: 5px;
        """)
        data_layout.addWidget(stocks_label)

        layout.addLayout(data_layout)

        # Last update
        self.update_label = QLabel("Last update: Never")
        self.update_label.setStyleSheet(f"""
            font-size: 8px;
            color: {COLORS['text_tertiary']};
            font-family: 'Consolas';
        """)
        self.update_label.setAlignment(Qt.AlignmentFlag.AlignRight)
        layout.addWidget(self.update_label)

        self.setLayout(layout)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['accent_green']};
                border-radius: 10px;
            }}
        """)

    def _get_ticker_style(self):
        """Get ticker label style"""
        return f"""
            font-size: 13px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            font-family: 'Consolas';
            padding: 3px;
            background-color: {COLORS['bg_tertiary']};
            border-radius: 4px;
        """

    def setup_timer(self):
        """Setup update timer"""
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_rates)
        self.timer.start(30000)  # Update every 30 seconds
        self.update_rates()

    def update_rates(self):
        """Update exchange rates (simulated - would use API in production)"""
        try:
            import random
            from datetime import datetime

            # Simulate rates (in production, use API like exchangerate-api.com or similar)
            usd_rate = 5.00 + random.uniform(-0.10, 0.10)
            eur_rate = 5.40 + random.uniform(-0.10, 0.10)
            btc_rate = 42000 + random.uniform(-500, 500)

            # Update labels with colors
            self.usd_label.setText(f"💵 USD/BRL: R$ {usd_rate:.4f}")
            self.eur_label.setText(f"💶 EUR/BRL: R$ {eur_rate:.4f}")
            self.btc_label.setText(f"₿ BTC/USD: $ {btc_rate:,.2f}")

            # Update timestamp
            now = datetime.now().strftime("%H:%M:%S")
            self.update_label.setText(f"Last update: {now}")

        except Exception as e:
            print(f"Error updating rates: {e}")


class DigitalClock(QFrame):
    """Digital clock with date"""

    def __init__(self):
        super().__init__()
        self.setup_ui()
        self.setup_timer()

    def setup_ui(self):
        """Setup UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(20, 20, 20, 20)
        layout.setSpacing(5)

        # Time
        self.time_label = QLabel("00:00:00")
        self.time_label.setStyleSheet(f"""
            font-size: 48px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
        """)
        self.time_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.time_label)

        # Date
        self.date_label = QLabel("Monday, January 1, 2024")
        self.date_label.setStyleSheet(f"""
            font-size: 14px;
            color: {COLORS['text_secondary']};
            font-family: 'Consolas';
        """)
        self.date_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        layout.addWidget(self.date_label)

        self.setLayout(layout)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['accent_cyan']};
                border-radius: 10px;
            }}
        """)

    def setup_timer(self):
        """Setup update timer"""
        self.timer = QTimer()
        self.timer.timeout.connect(self.update_time)
        self.timer.start(1000)  # Update every second
        self.update_time()

    def update_time(self):
        """Update time display"""
        now = datetime.now()
        self.time_label.setText(now.strftime("%H:%M:%S"))
        self.date_label.setText(now.strftime("%A, %B %d, %Y"))


class WeatherWidget(QFrame):
    """Weather information widget"""

    def __init__(self):
        super().__init__()
        self.setup_ui()

    def setup_ui(self):
        """Setup UI"""
        layout = QVBoxLayout()
        layout.setContentsMargins(15, 15, 15, 15)
        layout.setSpacing(10)

        # Location
        location = QLabel("🌍 Your Location")
        location.setStyleSheet(f"""
            font-size: 12px;
            font-weight: bold;
            color: {COLORS['accent_cyan']};
            font-family: 'Consolas';
        """)
        layout.addWidget(location)

        # Temperature
        temp_layout = QHBoxLayout()
        self.temp_label = QLabel("--°C")
        self.temp_label.setStyleSheet(f"""
            font-size: 36px;
            font-weight: bold;
            color: {COLORS['text_primary']};
            font-family: 'Consolas';
        """)
        temp_layout.addWidget(self.temp_label)
        temp_layout.addStretch()

        # Weather icon
        weather_icon = QLabel("☀️")
        weather_icon.setStyleSheet("font-size: 32px;")
        temp_layout.addWidget(weather_icon)

        layout.addLayout(temp_layout)

        # Condition
        condition = QLabel("Use weather API for real data")
        condition.setStyleSheet(f"""
            font-size: 10px;
            color: {COLORS['text_secondary']};
            font-family: 'Consolas';
        """)
        layout.addWidget(condition)

        # Details
        details = QLabel("Humidity: --% | Wind: -- km/h")
        details.setStyleSheet(f"""
            font-size: 9px;
            color: {COLORS['text_tertiary']};
            font-family: 'Consolas';
        """)
        layout.addWidget(details)

        self.setLayout(layout)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_secondary']};
                border: 2px solid {COLORS['accent_yellow']};
                border-radius: 10px;
            }}
        """)


class StockTicker(QFrame):
    """Scrolling stock ticker"""

    def __init__(self):
        super().__init__()
        self.setup_ui()
        self.setup_timer()
        self.offset = 0

    def setup_ui(self):
        """Setup UI"""
        self.setMinimumHeight(40)
        self.setMaximumHeight(40)
        self.setStyleSheet(f"""
            QFrame {{
                background-color: {COLORS['bg_primary']};
                border: 1px solid {COLORS['border']};
            }}
        """)

        # Stock data (simulated)
        self.stocks = [
            ("AAPL", 180.50, +2.5),
            ("GOOGL", 140.20, -1.2),
            ("MSFT", 380.75, +3.1),
            ("TSLA", 245.30, +5.8),
            ("AMZN", 155.90, -0.5),
            ("META", 480.20, +1.9),
            ("NVDA", 495.60, +4.2),
        ]

    def setup_timer(self):
        """Setup animation timer"""
        self.timer = QTimer()
        self.timer.timeout.connect(self.animate)
        self.timer.start(50)  # Smooth animation

    def animate(self):
        """Animate ticker"""
        self.offset += 2
        if self.offset > 1000:
            self.offset = 0
        self.update()

    def paintEvent(self, event):
        """Paint stock ticker"""
        painter = QPainter(self)
        painter.setRenderHint(QPainter.RenderHint.Antialiasing)

        x = -self.offset
        y = 10

        for symbol, price, change in self.stocks:
            # Symbol
            painter.setPen(QColor(COLORS['accent_cyan']))
            painter.setFont(QFont('Consolas', 10, QFont.Weight.Bold))
            painter.drawText(x, y, 100, 20, Qt.AlignmentFlag.AlignLeft, symbol)
            x += 60

            # Price
            painter.setPen(QColor(COLORS['text_primary']))
            painter.setFont(QFont('Consolas', 9))
            painter.drawText(x, y, 100, 20, Qt.AlignmentFlag.AlignLeft, f"${price:.2f}")
            x += 70

            # Change
            color = COLORS['accent_green'] if change > 0 else COLORS['accent_red']
            painter.setPen(QColor(color))
            sign = "+" if change > 0 else ""
            painter.drawText(x, y, 100, 20, Qt.AlignmentFlag.AlignLeft, f"{sign}{change:.1f}%")
            x += 80

            # Separator
            painter.setPen(QColor(COLORS['border']))
            painter.drawText(x, y, 20, 20, Qt.AlignmentFlag.AlignCenter, "•")
            x += 30
