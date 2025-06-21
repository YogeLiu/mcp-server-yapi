import { MCPTool, MCPInput, logger } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';

// 无需参数的空Schema
const GetProjectSchema = z.object({});

class GetProject extends MCPTool {
  name = 'get_project';
  description = `获取当前YAPI项目的详细信息。

⚡ 使用说明：
- 无需任何参数，自动使用环境变量YAPI_TOKEN中配置的项目token
- 返回19个字段的完整项目信息，包括项目名称、基础路径、环境配置等

📊 返回信息：
- 项目基本信息：名称、ID、描述、基础路径
- 项目配置：是否开启Mock、JSON5支持、切换通知等
- 时间信息：创建时间、最后更新时间
- 项目环境：测试、生产等环境配置列表

🔧 API详情：GET /api/project/get?token={token}`;
  schema = GetProjectSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);
    return await yapiService.getProject();
  }
}

export default GetProject; 