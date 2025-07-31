import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "../schemas/interface-schemas.js";

const ListMenuSchema = InterfaceSchema.pick({ project_id: true });

class ListMenu extends MCPTool {
  name = "list_menu";
  description =
    "Get interface menu list - Tree structure with categories as nodes and interfaces as leaves to display all interfaces in the project";
  schema = ListMenuSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.LIST_MENU, {
      project_id: input.project_id,
    });
  }
}

export default ListMenu;
