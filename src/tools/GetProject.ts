import { MCPTool, MCPInput } from "mcp-framework";
import { z } from "zod";
import { yapiGet } from "../utils/yapi-request.js";
import { PROJECT_ENDPOINTS } from "../constants/yapi-endpoints.js";

// Empty Schema with no parameters required
const GetProjectSchema = z.object({});

class GetProject extends MCPTool {
  name = "get_project";
  description = "Get project basic information";
  schema = GetProjectSchema;

  async execute(_input: MCPInput<this>) {
    return await yapiGet(PROJECT_ENDPOINTS.GET);
  }
}

export default GetProject;
