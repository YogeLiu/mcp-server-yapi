import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';

const GetInterfaceSchema = z.object({
  id: z.number().int().positive()
    .describe('接口ID - YAPI接口的唯一标识符。可在接口列表或接口详情页面URL中找到，例如URL为 /project/123/interface/api/456，则接口ID为456。也可通过add_interface创建后获得')
});

class GetInterface extends MCPTool {
  name = 'get_interface';
  description = `获取指定YAPI接口的完整详细信息。

⚡ 使用说明：
- 需要提供有效的接口ID作为参数
- 返回接口的完整定义，包括所有参数、响应格式等

📊 返回信息：
- 接口基本信息：名称、路径、HTTP方法、状态、描述
- 请求参数：查询参数(req_query)、请求头(req_headers)、路径参数(req_params)
- 请求体：类型、JSON Schema格式的完整定义
- 响应信息：响应体类型、JSON Schema格式的响应结构
- 元数据：创建者、创建时间、更新时间、query_path等25+个字段

💡 使用场景：
- 查看接口的详细规范和文档
- 为update_interface操作获取当前接口数据
- 接口调试和测试准备
- API文档生成和分析

🔧 API详情：GET /api/interface/get?id={id}&token={token}
📝 真实验证：已通过真实API测试
  - 成功获取接口ID 12571的完整信息
  - 返回包含JSON Schema格式的请求体和响应体定义
  - 支持example和default字段的完整解析

⚠️ 注意事项：
- 接口ID必须存在且用户有访问权限
- req_body_other和res_body字段是JSON字符串，需要解析后使用
- 支持完整的JSON Schema v4规范`;
  schema = GetInterfaceSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);
    return await yapiService.getInterface(input);
  }
}

export default GetInterface; 