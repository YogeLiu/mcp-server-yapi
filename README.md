# mcp-server-yapi

[![version](https://img.shields.io/badge/version-0.1.2-blue.svg)](https://github.com/kales0202/mcp-server-yapi.git)
[![smithery badge](https://smithery.ai/badge/mcp-server-yapi)](https://smithery.ai/server/@kales0202/mcp-server-yapi)

mcp-server-yapi 是一个为 [YApi](https://github.com/YMFE/yapi) 设计的 MCP 服务器。它将 YApi 的常用功能封装为一系列工具，允许大语言模型（LLM）通过自然语言与你的 YApi 平台进行交互，实现接口管理自动化。

## ✨ 核心功能

**🚀 企业增强版特性：**
- **多项目支持**: 同时管理多个YAPI项目，支持不同域名和token
- **文件配置**: 支持JSON文件配置，管理更简洁安全
- **路径模糊匹配**: 接口查询支持路径模糊匹配，无需记住接口ID
- **高性能列表**: 默认获取2000条接口数据，满足大项目需求

**📋 基础功能：**
- **项目管理**: 获取项目基本信息
- **接口管理**: 创建、保存、更新、获取接口信息
- **接口分类**: 创建分类、获取分类菜单
- **接口列表**: 获取项目或分类下的接口列表

## ⚙️ 客户端配置

### 安装要求

- Node.js >= v18.0.0
- Cursor, Windsurf, Claude Desktop 或者其它支持 MCP 协议的客户端

### 配置示例

YAPI 的项目 TOKEN：在"项目->设置->token 配置"中

#### 单项目配置（向后兼容）

```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "npx",
      "args": ["-y", "@yogeliu/mcp-server-yapi"],
      "env": {
        "YAPI_BASE_URL": "YAPI服务地址，例：https://xxx.yyy.com",
        "YAPI_TOKEN": "项目TOKEN",
        "MCP_DEBUG_CONSOLE": "false"
      }
    }
  }
}
```

#### 多项目配置（推荐）

**方式1：使用配置文件（推荐）**

1. 创建 `yapi-projects.json` 配置文件：
```json
{
  "go_equity_package": {
    "baseUrl": "https://fed.qschou.com",
    "token": "your_project_token_here"
  },
  "test_project": {
    "baseUrl": "https://test.example.com", 
    "token": "test_project_token"
  }
}
```

2. MCP客户端配置：
```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "npx",
      "args": ["-y", "@yogeliu/mcp-server-yapi"],
      "env": {
        "YAPI_PROJECTS_FILE": "./yapi-projects.json",
        "YAPI_DEFAULT_PROJECT": "go_equity_package",
        "MCP_DEBUG_CONSOLE": "false"
      }
    }
  }
}
```

**方式2：使用环境变量（不推荐）**
```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "npx",
      "args": ["-y", "@yogeliu/mcp-server-yapi"],
      "env": {
        "YAPI_PROJECTS": "{\"project1\":{\"baseUrl\":\"https://yapi1.com\",\"token\":\"token1\"},\"project2\":{\"baseUrl\":\"https://yapi2.com\",\"token\":\"token2\"}}",
        "YAPI_DEFAULT_PROJECT": "project1",
        "MCP_DEBUG_CONSOLE": "false"
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

YAPI 的项目 TOKEN：在"项目->设置->toekn 配置"中

```json
{
  "mcpServers": {
    "mcp-server-yapi": {
      "command": "node",
      "args": ["/absolute/path/to/your/mcp-server-yapi/dist/index.js"],
      "env": {
        "YAPI_BASE_URL": "YAPI服务地址",
        "YAPI_TOKEN": "项目TOKEN",
        "MCP_DEBUG_CONSOLE": "false"
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
