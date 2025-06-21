import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';

const GetCategoryMenuSchema = z.object({
  project_id: z.number().int().positive()
    .describe('项目ID - 要查询分类菜单的YAPI项目ID。必须是有效的项目ID，可通过get_project获取当前项目ID')
});

class GetCategoryMenu extends MCPTool {
  name = 'get_category_menu';
  description = `获取指定YAPI项目的所有接口分类列表。

⚡ 使用说明：
- 需要提供有效的项目ID作为参数
- 返回该项目下所有分类的数组，包含完整的分类信息

📊 返回信息：
- 分类基本信息：分类名称、ID、描述
- 分类归属：所属项目ID、创建者信息
- 时间信息：创建时间、最后更新时间
- MongoDB字段：包含__v版本字段等

💡 使用场景：
- 了解项目的接口分类结构
- 为add_interface选择合适的分类ID
- 项目接口组织结构分析

🔧 API详情：GET /api/interface/getCatMenu?project_id={id}&token={token}`;
  schema = GetCategoryMenuSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);
    return await yapiService.getCategoryMenu(input.project_id);
  }
}

export default GetCategoryMenu; 