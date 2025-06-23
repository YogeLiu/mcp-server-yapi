import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { OPEN_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "./schemas/interface-schemas.js";

const ImportDataSchema = InterfaceSchema.pick({
  type: true,
  json: true,
  merge: true,
  url: true,
}).partial({
  json: true,
  url: true,
});

class ImportData extends MCPTool {
  name = "import_data";
  description =
    "服务端数据导入 - 从外部数据源批量导入接口到YAPI项目。支持Swagger、Postman、HAR、JSON格式，可通过JSON数据或URL链接导入";
  schema = ImportDataSchema;

  async execute(input: MCPInput<this>) {
    return await yapiPost(OPEN_ENDPOINTS.IMPORT_DATA, input);
  }
}

export default ImportData;
