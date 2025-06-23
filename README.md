# mcp-server-yapi

[![version](https://img.shields.io/badge/version-0.0.3-blue.svg)](https://github.com/kales0202/mcp-server-yapi.git)

mcp-server-yapi 是一个为 [YApi](https://github.com/YMFE/yapi) 设计的 MCP 服务器。它将 YApi的常用功能封装为一系列工具，允许大语言模型（LLM）通过自然语言与你的 YApi 平台进行交互，实现接口管理自动化。

## ✨ 核心功能

通过本服务，你可以用自然语言完成以下操作：

- **项目管理**: 获取项目基本信息。
- **接口管理**: 创建、保存、更新、获取接口信息。
- **接口分类**: 创建分类、获取分类菜单。
- **数据导入**: 导入接口数据。
- **接口列表**: 获取项目或分类下的接口列表。

## ⚙️ 客户端配置

YAPI的项目TOKEN：在"项目->设置->toekn 配置"中

```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "npx",
      "args": [
        "-y",
        "mcp-server-yapi"
      ],
      "env": {
        "YAPI_BASE_URL": "YAPI服务地址",
        "YAPI_TOKEN": "项目TOKEN"
      }
    }
  }
}
```

## 🔧 本地开发调试

请确保你的开发环境中已安装 [Node.js](https://nodejs.org/) (版本 `>=18`)。

1. 克隆并编译

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

2. 与 AI Agent 结合

你可以将此服务集成到支持 MCP 协议的 AI Agent 客户端中，将以下配置添加到你的客户端配置文件中

YAPI的项目TOKEN：在"项目->设置->toekn 配置"中

```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "node",
      "args": ["/absolute/path/to/your/mcp-server-yapi/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "YAPI服务地址",
        "YAPI_TOKEN": "项目TOKEN"
      }
    }
  }
}
```

## 🛠️ 可用工具列表

- `get_project`: 获取项目基本信息
- `add_cat`: 新增接口分类
- `get_cat_menu`: 获取菜单列表
- `list_cat`: 获取某个分类下接口列表
- `list_menu`: 获取接口菜单列表
- `get_interface`: 获取接口数据
- `list_interface`: 获取接口列表数据
- `save_interface`: 新增或者更新接口
- `add_interface`: 新增接口
- `up_interface`: 更新接口
- `import_data`: 服务端数据导入
