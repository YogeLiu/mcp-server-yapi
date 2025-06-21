import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';

const ImportDataSchema = z.object({
  project_id: z.number().int().positive()
    .describe('项目ID - 要导入数据的目标YAPI项目ID'),
  type: z.enum(['swagger', 'postman', 'har', 'json'])
    .describe('导入数据类型 - swagger(OpenAPI规范)、postman(Postman集合)、har(HTTP Archive)、json(通用JSON格式)'),
  data_type: z.enum(['json', 'url'])
    .describe('数据格式 - json(直接提供JSON数据)或url(提供数据URL链接)'),
  merge: z.enum(['normal', 'good', 'merge'])
    .describe('合并策略 - normal(普通导入)、good(智能合并)、merge(强制合并)。建议使用good进行智能合并'),
  json: z.string().optional()
    .describe('JSON数据（可选）- 当data_type为json时必需，提供要导入的完整JSON数据'),
  url: z.string().url().optional()
    .describe('数据URL（可选）- 当data_type为url时必需，提供可访问的数据文件URL地址')
});

class ImportData extends MCPTool {
  name = 'import_data';
  description = `从外部数据源批量导入接口数据到YAPI项目，支持多种主流格式。

⚡ 使用说明：
- 必需参数：project_id(项目ID)、type(数据类型)、data_type(数据格式)、merge(合并策略)
- 可选参数：json(JSON数据) 或 url(数据URL)，根据data_type选择其中一个
- 支持Swagger/OpenAPI、Postman、HAR等多种数据格式
- 可通过JSON数据或URL链接两种方式导入
- 提供智能合并策略，避免重复接口
- 批量导入，大幅提升接口迁移效率

📋 完整参数说明：
- project_id: 项目ID，必需，目标YAPI项目ID
- type: 数据类型，必需，swagger、postman、har、json
- data_type: 数据格式，必需，json(直接数据)或url(链接地址)
- merge: 合并策略，必需，normal、good(推荐)、merge
- json: JSON数据，当data_type为json时必需
- url: 数据URL，当data_type为url时必需

📊 支持格式：
- Swagger/OpenAPI：标准的API文档格式，支持v2和v3版本
- Postman：Postman导出的Collection JSON格式
- HAR：浏览器导出的HTTP Archive格式
- JSON：YAPI通用的JSON接口数据格式

🔄 合并策略：
- normal：普通导入，直接添加所有接口
- good：智能合并，自动识别和合并相同接口（推荐）
- merge：强制合并，覆盖已存在的同名接口

💡 使用场景：
- 从Swagger文档导入API接口
- 迁移Postman集合到YAPI
- 从HAR文件分析和导入真实请求
- 批量导入现有的API文档

🔧 API详情：POST /api/open/import_data
📝 实现状态：已调用真实API，支持完整的数据导入流程

💡 最佳实践：
- 使用good合并策略避免重复接口
- 大文件建议使用URL方式导入
- 导入前建议备份项目数据
- 导入后检查接口分类和完整性

⚠️ 重要提示：
- 数据格式必须符合对应的标准规范
- URL方式要求目标地址可公网访问
- 导入操作不可逆，建议先在测试项目验证
- 建议使用good策略进行智能合并

🔍 验证要求：
- data_type为json时必须提供json参数
- data_type为url时必须提供url参数
- 两者不能同时为空或同时提供`;
  schema = ImportDataSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);

    // 验证json和url参数的逻辑
    if (input.data_type === 'json' && !input.json) {
      throw new Error('当data_type为json时，必须提供json参数');
    }
    if (input.data_type === 'url' && !input.url) {
      throw new Error('当data_type为url时，必须提供url参数');
    }
    if (input.json && input.url) {
      throw new Error('json和url参数不能同时提供，请选择其中一种方式');
    }

    return await yapiService.importData(input);
  }
}

export default ImportData; 