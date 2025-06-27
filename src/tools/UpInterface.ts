import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "../schemas/interface-schemas.js";

const UpInterfaceSchema = InterfaceSchema.pick({
  id: true,
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

class UpInterface extends MCPTool {
  name = "up_interface";
  description = "更新接口 - 建议优先使用save_interface";
  schema = UpInterfaceSchema;

  async execute(input: MCPInput<this>) {
    return await yapiPost(INTERFACE_ENDPOINTS.UP, input);
  }
}

export default UpInterface;
