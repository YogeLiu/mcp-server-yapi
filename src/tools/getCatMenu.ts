import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "./schemas/interface-schemas.js";

const GetCategoryMenuSchema = InterfaceSchema.pick({ project_id: true });

/**
 * 获取菜单列表
 */
class GetCatMenu extends MCPTool {
  name = "get_cat_menu";
  description =
    "获取菜单列表 - 获取所有接口分类列表，一般用于了解项目结构和获取分类ID";
  schema = GetCategoryMenuSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.GET_CAT_MENU, {
      project_id: input.project_id,
    });
  }
}

export default GetCatMenu;
