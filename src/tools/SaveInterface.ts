import { MCPTool, MCPInput } from 'mcp-framework';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';
import { HttpMethod } from '../types/yapi-types.js';
import { SaveInterfaceSchema } from './schemas/interface-schemas.js';

class SaveInterface extends MCPTool {
  name = 'save_interface';
  description = `YAPI接口智能保存工具 - 统一的新增和更新接口。

⚡ 核心特性：
- 🔄 智能判断：提供ID时更新，不提供ID时新增
- 📝 完整支持：支持接口的所有配置项，包括请求体、状态、描述等
- 🎯 JSON Schema：完整支持JSON Schema定义，包括default和example字段
- 🚀 一步到位：一个接口搞定新增和更新，无需分别调用不同工具

📋 完整参数说明：
- id: 接口ID，可选，提供时更新，不提供时新增
- title: 接口名称，1-100字符，必需，如"获取用户信息"
- path: 接口路径，必须以/开头，必需，如"/api/user/info"
- method: HTTP方法，必需，支持GET、POST、PUT、DELETE等
- project_id: 项目ID，必需，可通过get_project获取
- catid: 分类ID，必需，可通过get_category_menu获取
- status: 接口状态，可选，undone(开发中)或done(已完成)，默认undone
- desc: 接口描述，可选
- req_body_other: 请求体JSON Schema，可选，用于定义复杂请求结构
- req_body_type: 请求体类型，可选，如json、form等
- req_body_is_json_schema: 是否启用JSON Schema，可选
- res_body: 响应体JSON Schema，可选，用于定义复杂响应结构
- res_body_type: 响应体类型，可选，如json
- res_body_is_json_schema: 是否启用响应体JSON Schema，可选
- api_opened: 是否开放接口，可选
- switch_notice: 是否开启通知，可选

📊 使用场景：
1. **新增接口**：不提供id参数，创建全新的API接口
2. **更新接口**：提供id参数，修改现有接口的任意配置
3. **完善接口**：创建基本接口后，再次调用添加详细的请求体定义

💡 最佳实践：
- 第一次调用：只提供基本信息(title, path, method, project_id, catid)创建接口
- 第二次调用：添加id参数和req_body_other等详细配置完善接口
- 建议先使用get_interface查看现有接口信息，再进行更新

🔧 API详情：POST /api/interface/save
📝 真实验证：推荐的YAPI标准接口保存方式

🎯 JSON Schema字段说明：
- "example": 对应YAPI界面的"示例"列，显示字段的示例值
- "default": 对应YAPI界面的"默认值"列，字段的默认值
- "description": 对应字段的备注说明
- "required": 数组中列出必填字段名称
- "type": 字段类型，如string、number、boolean、object、array等

⚠️ 重要提示：
- 这是YAPI推荐的标准接口保存方式
- 支持完整的接口定义，包括参数、请求体、响应体等
- 相比add+update的方式，save接口更加高效和稳定
- res_body和req_body_other需要是有效的JSON Schema字符串`;
  schema = SaveInterfaceSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);

    const requestParams = {
      ...input,
      method: input.method as HttpMethod,
    };

    return await yapiService.saveInterface(requestParams);
  }
}

export default SaveInterface; 