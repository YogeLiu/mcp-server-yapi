import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "../schemas/interface-schemas.js";

const AddCatSchema = InterfaceSchema.pick({
  name: true,
  project_id: true,
  desc: true,
}).partial({
  desc: true,
});

class AddCat extends MCPTool {
  name = "add_cat";
  description = "Add interface category";
  schema = AddCatSchema;

  async execute(input: MCPInput<this>) {
    return await yapiPost(INTERFACE_ENDPOINTS.ADD_CAT, input);
  }
}

export default AddCat;
