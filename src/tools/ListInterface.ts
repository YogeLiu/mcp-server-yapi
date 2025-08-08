import { MCPTool, MCPInput } from "mcp-framework";
import { z } from "zod";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema, ProjectNameSchema } from "../schemas/interface-schemas.js";

const ListInterfaceSchema = InterfaceSchema.pick({
  project_id: true,
  page: true,
  limit: true,
}).partial({
  page: true,
  limit: true,
}).merge(ProjectNameSchema);

class ListInterface extends MCPTool {
  name = "list_interface";
  description = "Get interface list data";
  schema = ListInterfaceSchema;

  async execute(input: MCPInput<this>) {
    const { project_name, ...apiParams } = input;
    const params = {
      ...apiParams,
      limit: input.limit || 2000
    };
    return await yapiGet(INTERFACE_ENDPOINTS.LIST, params, project_name);
  }
}

export default ListInterface;
