# mcp-server-yapi

[![version](https://img.shields.io/badge/version-0.0.1-blue.svg)](https://github.com/your-repo/mcp-server-yapi)

mcp-server-yapi 是一个为 [YApi](https://github.com/YMFE/yapi) 设计的MCP服务器。它将YApi的常用功能封装为一系列工具，允许大语言模型（LLM）通过自然语言与你的YApi平台进行交互，实现接口管理自动化。

## ✨ 核心功能

通过本服务，你可以用自然语言完成以下操作：

- **项目管理**: 获取项目基本信息。
- **接口管理**: 创建、保存、更新、获取接口信息。
- **接口分类**: 创建分类、获取分类菜单。
- **数据导入**: 从Swagger/OpenAPI等格式导入数据。
- **接口列表**: 获取项目或分类下的接口列表。

## 🚀 快速开始

### 1. 环境准备

请确保你的开发环境中已安装 [Node.js](https://nodejs.org/) (版本 `>=20`)。

### 2. 安装

从你的终端克隆并安装此项目：

```bash
# 克隆仓库
git clone https://github.com/kales0202/mcp-server-yapi.git

# 进入项目目录
cd mcp-server-yapi

# 安装依赖
npm install

# 编译生成dist/index.js
npm run build
```

## 🤖 与AI Agent结合

你可以将此服务集成到支持MCP协议的AI Agent客户端（如 [Claude Desktop](https://github.com/jtsang4/claude-desktop)）中。

将以下配置添加到你的客户端配置文件中：

```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "node",
      "args": ["/absolute/path/to/your/mcp-server-yapi/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "YAPI服务地址",
        "YAPI_TOKEN": "YAPI的项目TOKEN，在“项目->设置->toekn配置”中可以找到此token"
      }
    }
  }
}
```
> 请务必将 `args` 中的路径替换为你本地项目的 **绝对路径**。

完成配置后，你就可以在AI Agent中通过自然语言使用所有YApi工具了。

## 🛠️ 可用工具列表

- `get_project`: 获取项目信息
- `get_interface`: 获取接口详情
- `list_interfaces`: 获取项目接口列表
- `get_category_menu`: 获取接口分类菜单
- `list_category_interfaces`: 获取分类下的接口列表
- `add_category`: 新增接口分类
- `add_interface`: 新增接口
- `update_interface`: 更新接口
- `save_interface`: 保存或更新接口
- `import_data`: 导入外部接口数据