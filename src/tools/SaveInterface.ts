import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "../schemas/interface-schemas.js";

const SaveInterfaceSchema = InterfaceSchema.pick({
  api_opened: true,
  catid: true,
  desc: true,
  method: true,
  path: true,
  // req_body_form: ?
  req_body_is_json_schema: true,
  req_body_other: true,
  req_body_type: true,
  req_headers: true,
  req_params: true,
  req_query: true,
  res_body: true,
  res_body_is_json_schema: true,
  res_body_type: true,
  status: true,
  switch_notice: true,
  tag: true,
  title: true,
}).partial({
  api_opened: true,
  desc: true,
  req_body_is_json_schema: true,
  req_body_other: true,
  req_body_type: true,
  req_headers: true,
  req_params: true,
  req_query: true,
  res_body: true,
  res_body_is_json_schema: true,
  res_body_type: true,
  tag: true,
});

class SaveInterface extends MCPTool {
  name = "save_interface";
  description =
    "Add or update interface - Compared to AddInterface and UpdateInterface, this interface is more recommended. The path parameter is the unique data identifier, if it exists it will be updated, if not it will be added";
  schema = SaveInterfaceSchema;

  async execute(input: MCPInput<this>) {
    return await yapiPost(INTERFACE_ENDPOINTS.SAVE, input);
  }
}

export default SaveInterface;
