import sys
import os

# Dynamically add the backend folder to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from database.scripts.call_script import get_call_scripts
