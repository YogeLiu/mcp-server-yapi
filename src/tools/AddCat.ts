import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema, ProjectNameSchema } from "../schemas/interface-schemas.js";

const AddCatSchema = InterfaceSchema.pick({
  name: true,
  project_id: true,
  desc: true,
}).partial({
  desc: true,
}).merge(ProjectNameSchema);

class AddCat extends MCPTool {
  name = "add_cat";
  description = "Add interface category";
  schema = AddCatSchema;

  async execute(input: MCPInput<this>) {
    const { project_name, ...apiParams } = input;
    return await yapiPost(INTERFACE_ENDPOINTS.ADD_CAT, apiParams, project_name);
  }
}

export default AddCat;
