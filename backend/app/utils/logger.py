"""
Logging configuration for the application.
"""

import logging
import sys
from datetime import datetime
from pathlib import Path

# Create logs directory if it doesn't exist
LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)

# Configure logging format
LOG_FORMAT = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
DATE_FORMAT = "%Y-%m-%d %H:%M:%S"

# Create formatters
formatter = logging.Formatter(LOG_FORMAT, DATE_FORMAT)

# Console handler
console_handler = logging.StreamHandler(sys.stdout)
console_handler.setLevel(logging.INFO)
console_handler.setFormatter(formatter)

# File handler for general logs
file_handler = logging.FileHandler(
    LOG_DIR / f"icode_portal_{datetime.now().strftime('%Y%m%d')}.log"
)
file_handler.setLevel(logging.DEBUG)
file_handler.setFormatter(formatter)

# File handler for errors
error_handler = logging.FileHandler(
    LOG_DIR / f"errors_{datetime.now().strftime('%Y%m%d')}.log"
)
error_handler.setLevel(logging.ERROR)
error_handler.setFormatter(formatter)

# Configure root logger
logger = logging.getLogger("icode_portal")
logger.setLevel(logging.DEBUG)
logger.addHandler(console_handler)
logger.addHandler(file_handler)
logger.addHandler(error_handler)


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance for a module"""
    return logging.getLogger(f"icode_portal.{name}")


# Example usage in modules:
# from app.utils.logger import get_logger
# logger = get_logger(__name__)
# logger.info("Message")

