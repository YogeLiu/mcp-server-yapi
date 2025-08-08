import { MCPTool, MCPInput } from "mcp-framework";
import { yapiGet } from "../utils/yapi-request.js";
import { PROJECT_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { ProjectNameSchema } from "../schemas/interface-schemas.js";

const GetProjectSchema = ProjectNameSchema;

class GetProject extends MCPTool {
  name = "get_project";
  description = "Get project basic information";
  schema = GetProjectSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(PROJECT_ENDPOINTS.GET, {}, input.project_name);
  }
}

export default GetProject;