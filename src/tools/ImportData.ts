import { MCPTool, MCPInput } from 'mcp-framework';
import { yapiPost } from '../utils/yapi-request.js';
import { OPEN_ENDPOINTS } from '../constants/yapi-endpoints.js';
import { InterfaceSchema } from './schemas/interface-schemas.js';

const ImportDataSchema = InterfaceSchema
  .pick({
    project_id: true,
    type: true,
    data_type: true,
    merge: true,
    json: true,
    url: true
  })
  .partial({
    json: true,
    url: true
  });

class ImportData extends MCPTool {
  name = 'import_data';
  description = "服务端数据导入 - 从外部数据源批量导入接口到YAPI项目。支持Swagger、Postman、HAR、JSON格式，可通过JSON数据或URL链接导入";
  schema = ImportDataSchema;

  async execute(input: MCPInput<this>) {
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

    return await yapiPost(OPEN_ENDPOINTS.IMPORT_DATA, input);
  }
}

export default ImportData; 