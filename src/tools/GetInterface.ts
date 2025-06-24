import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "./schemas/interface-schemas.js";

const GetInterfaceSchema = InterfaceSchema.pick({ id: true });

class GetInterface extends MCPTool {
  name = "get_interface";
  description = "获取接口数据";
  schema = GetInterfaceSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.GET, { id: input.id });
  }
}

export default GetInterface;
