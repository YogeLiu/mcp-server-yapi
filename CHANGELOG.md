# Changelog

All notable changes to this project will be documented in this file.

## [0.2.0] - 2025-01-08

### 🚀 Features
- **Multi-project support**: Support multiple YAPI projects with different tokens and base URLs
- **File-based configuration**: Support loading project configurations from JSON files (recommended)
- **Project name parameter**: All tools now accept optional `project_name` parameter to specify target project
- **Default project setting**: Configure a default project to use when no project_name is specified

### 🔧 Improvements
- **Enhanced GetInterface tool**: Now uses router_path for fuzzy matching instead of interface ID
- **Optimized ListInterface**: Default page size increased to 2000 for better performance
- **Better configuration validation**: More comprehensive error messages and validation
- **Improved logging**: Better debug information for configuration loading

### 📝 Configuration Changes
- **NEW**: `YAPI_PROJECTS_FILE` - Path to JSON configuration file (recommended)
- **NEW**: `YAPI_DEFAULT_PROJECT` - Default project name to use
- **LEGACY**: `YAPI_BASE_URL` and `YAPI_TOKEN` still supported for single project setup

### 🛠 Tools Available
- `get_project` - Get project basic information
- `get_cat_menu` - Get interface category menu list  
- `add_cat` - Add interface category
- `list_cat` - Get interface list under specific category
- `list_interface` - Get interface list data (default 2000 items)
- `get_interface` - Get interface data by router path fuzzy matching
- `save_interface` - Add or update interface

### 🔒 Security
- Added `yapi-projects.json` to `.gitignore` to protect sensitive tokens
- Provided `yapi-projects.example.json` as template

## [0.1.2] - Previous Version
- Basic YAPI MCP server functionality
- Single project support only