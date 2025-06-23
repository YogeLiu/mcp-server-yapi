import { MCPTool, MCPInput } from "mcp-framework";
import { z } from "zod";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "./schemas/interface-schemas.js";

const ListInterfaceSchema = InterfaceSchema.pick({
  project_id: true,
  page: true,
  limit: true,
}).partial({
  page: true,
  limit: true,
});

class ListInterface extends MCPTool {
  name = "list_interface";
  description = "获取接口列表数据";
  schema = ListInterfaceSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.LIST, input);
  }
}

export default ListInterface;
