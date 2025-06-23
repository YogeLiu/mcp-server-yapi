import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "./schemas/interface-schemas.js";

const ListMenuSchema = InterfaceSchema.pick({ project_id: true });

/**
 * 获取接口菜单列表
 */
class ListMenu extends MCPTool {
  name = "list_menu";
  description =
    "获取YAPI项目的完整接口菜单树，以分类为节点、接口为叶子的树形结构展示项目的所有接口";
  schema = ListMenuSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.LIST_MENU, {
      project_id: input.project_id,
    });
  }
}

export default ListMenu;
