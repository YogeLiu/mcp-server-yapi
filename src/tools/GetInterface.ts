import { MCPTool, MCPInput } from "mcp-framework";
import { z } from "zod";
import { yapiGet } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema, ProjectNameSchema } from "../schemas/interface-schemas.js";

const GetInterfaceSchema = InterfaceSchema.pick({ 
  project_id: true
}).extend({
  router_path: z.string().describe("Router path for fuzzy matching")
}).merge(ProjectNameSchema);

class GetInterface extends MCPTool {
  name = "get_interface";
  description = "Get interface data by router path fuzzy matching";
  schema = GetInterfaceSchema;

  async execute(input: MCPInput<this>) {
    const { project_name, ...apiParams } = input;
    // 获取所有接口数据
    const response = await yapiGet(INTERFACE_ENDPOINTS.LIST, { 
      project_id: input.project_id,
      limit: 2000 // 获取足够多的接口
    }, project_name);

    // 如果请求失败，直接返回
    if (!response.data || !Array.isArray(response.data.list)) {
      return response;
    }

    // 本地过滤匹配router_path的接口
    const filteredInterfaces = response.data.list.filter((item: any) => 
      item.path && item.path.includes(input.router_path)
    );

    // 返回过滤后的结果
    return {
      ...response,
      data: {
        ...response.data,
        list: filteredInterfaces,
        count: filteredInterfaces.length
      }
    };
  }
}

export default GetInterface;
