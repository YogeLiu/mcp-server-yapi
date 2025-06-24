import { MCPTool, MCPInput } from "mcp-framework";
import { yapiPost } from "../utils/yapi-request.js";
import { INTERFACE_ENDPOINTS } from "../constants/yapi-endpoints.js";
import { InterfaceSchema } from "./schemas/interface-schemas.js";

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
    "新增或者更新接口 - 相比较于AddInterface和UpdateInterface，更推荐使用这个接口，path参数是数据唯一标识，如果存在则更新，不存在则新增";
  schema = SaveInterfaceSchema;

  async execute(input: MCPInput<this>) {
    return await yapiPost(INTERFACE_ENDPOINTS.SAVE, input);
  }
}

export default SaveInterface;
