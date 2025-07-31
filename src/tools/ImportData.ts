import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { OPEN_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "../schemas/interface-schemas.js";

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
    "Server-side data import - Batch import interfaces from external data sources to YAPI project. Only supports Swagger, can import through JSON data or URL link";
  schema = ImportDataSchema;

  async execute(input: MCPInput<this>) {
    return await yapiPost(OPEN_ENDPOINTS.IMPORT_DATA, input);
  }
}

export default ImportData;
