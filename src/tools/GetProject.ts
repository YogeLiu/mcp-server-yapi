import { MCPTool, MCPInput } from "mcp-framework";
import { z } from "zod";
import { yapiGet } from "../utils/yapi-request.js";
import { PROJECT_ENDPOINTS } from "../constants/yapi-endpoints.js";

// 无需参数的空Schema
const GetProjectSchema = z.object({});

class GetProject extends MCPTool {
  name = "get_project";
  description = "获取项目基本信息 - 包括项目名称、基础路径、环境配置等";
  schema = GetProjectSchema;

  async execute(_input: MCPInput<this>) {
    return await yapiGet(PROJECT_ENDPOINTS.GET);
  }
}

export default GetProject;
