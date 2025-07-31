import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "../schemas/interface-schemas.js";

const GetCategoryMenuSchema = InterfaceSchema.pick({ project_id: true });

/**
 * Get menu list
 */
class GetCatMenu extends MCPTool {
  name = "get_cat_menu";
  description =
    "Get menu list - Get all interface category lists, generally used to understand project structure and get category IDs";
  schema = GetCategoryMenuSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.GET_CAT_MENU, {
      project_id: input.project_id,
    });
  }
}

export default GetCatMenu;
