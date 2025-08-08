import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema, ProjectNameSchema } from "../schemas/interface-schemas.js";

const ListCatSchema = InterfaceSchema.pick({
  catid: true,
  status: true,
  page: true,
  limit: true,
}).partial({
  status: true,
  page: true,
  limit: true,
}).merge(ProjectNameSchema);

class ListCat extends MCPTool {
  name = "list_cat";
  description = "Get interface list under a specific category";
  schema = ListCatSchema;

  async execute(input: MCPInput<this>) {
    const { project_name, ...apiParams } = input;
    return await yapiGet(INTERFACE_ENDPOINTS.LIST_CAT, apiParams, project_name);
  }
}

export default ListCat;
