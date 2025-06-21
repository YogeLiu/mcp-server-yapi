import { MCPTool, MCPInput } from 'mcp-framework';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';
import { UpdateInterfaceSchema } from './schemas/interface-schemas.js';

class UpdateInterface extends MCPTool {
  name = 'update_interface';
  description = `更新YAPI接口的详细信息。

⚠️ 建议优先使用 save_interface 工具！
save_interface 是YAPI推荐的标准接口保存方式，支持智能新增和更新，功能更完整。
当前工具仅用于简单的接口更新场景。

⚡ 使用说明：
- 必需参数：id(接口ID)
- 可选参数：title(接口名称)、desc(接口描述)、req_body_other(请求体Schema)、res_body(响应体Schema)
- 支持部分更新，只需提供要修改的字段
- 建议先使用get_interface获取当前接口信息，然后修改需要的部分

📋 完整参数说明：
- id: 接口ID，必需，要更新的接口的唯一标识
- title: 接口名称，1-100字符，可选，如"获取用户信息"
- desc: 接口描述，可选
- req_body_other: 请求体JSON Schema，可选，用于定义请求结构
- res_body: 响应体JSON Schema，可选，用于定义响应结构

📊 支持更新的内容：
- 基本信息：接口名称(title)、描述(desc)
- 请求体定义：JSON Schema格式的完整请求体结构(req_body_other)
- 响应体定义：JSON Schema格式的完整响应体结构(res_body)

💡 使用场景：
- 修改接口的基本信息（名称、描述）
- 更新接口的参数定义和默认值
- 调整JSON Schema中的字段配置
- 完善接口的文档和规范

🔧 API详情：POST /api/interface/up
📝 真实验证：已通过真实API测试
  - 成功修改接口ID 12571的email字段默认值
  - 验证了从example到default字段的区别
  - 确认了界面显示与Schema字段的对应关系

⚠️ 重要提示：
- 更新操作会修改接口的up_time字段
- req_body_other字段需要是有效的JSON Schema字符串
- res_body字段需要是有效的JSON Schema字符串
- example字段对应界面的"示例"列，default字段对应"默认值"列
- 数组参数会重新生成_id字段

🎯 JSON Schema字段说明：
- "example": 对应YAPI界面的"示例"列
- "default": 对应YAPI界面的"默认值"列  
- "description": 对应字段的备注说明
- "required": 数组中列出必填字段名称`;
  schema = UpdateInterfaceSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);
    return await yapiService.updateInterface(input);
  }
}

export default UpdateInterface; 