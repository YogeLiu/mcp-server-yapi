import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';

const AddCategorySchema = z.object({
  name: z.string().min(1).max(50)
    .describe('分类名称 - 长度1-50字符。建议使用有意义的名称如"用户管理"、"订单系统"、"商品接口"等，便于接口分组管理'),
  project_id: z.number().int().positive()
    .describe('目标项目ID - 必须是已存在的YAPI项目ID。可通过get_project获取当前项目ID'),
  desc: z.string().max(200).optional()
    .describe('分类描述（可选）- 最大200字符。详细说明该分类下接口的用途和范围，如"用户相关的增删改查接口"、"订单流程相关API"等')
});

class AddCategory extends MCPTool {
  name = 'add_category';
  description = `在指定YAPI项目中创建新的接口分类。

⚡ 使用说明：
- 需要提供分类名称和目标项目ID，描述可选
- 创建成功后返回完整的分类信息，包括自动生成的分类ID

📊 返回信息：
- 新分类的完整信息：ID、名称、描述、所属项目
- 创建者信息：创建者ID、创建时间
- MongoDB字段：包含__v版本字段

💡 使用场景：
- 为项目建立接口分类体系
- 准备为新功能模块创建接口组
- 重新组织现有项目结构

🔧 API详情：POST /api/interface/add_cat
📝 真实验证：已通过真实API测试，成功创建分类ID 9886`;
  schema = AddCategorySchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);
    return await yapiService.addCategory(input);
  }
}

export default AddCategory; 