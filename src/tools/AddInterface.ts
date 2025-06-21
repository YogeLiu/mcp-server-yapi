import { MCPTool, MCPInput } from "mcp-framework";
import { YapiService } from "../services/yapi-service.js";
import { YapiClient } from "../yapi-client.js";
import { loadConfig } from "../config.js";
import { HttpMethod } from "../types/yapi-types.js";
import { AddInterfaceSchema } from "./schemas/interface-schemas.js";

class AddInterface extends MCPTool {
  name = "add_interface";
  description = `在YAPI中创建新的API接口。

⚠️ 建议优先使用 save_interface 工具！
save_interface 是YAPI推荐的标准接口保存方式，支持智能新增和更新，功能更完整。
当前工具仅用于简单的接口创建场景。

⚡ 使用说明：
- 必需参数：title(接口名称)、path(接口路径)、method(HTTP方法)、project_id(项目ID)、catid(分类ID)
- 可选参数：status(接口状态，默认undone)、desc(接口描述)、req_body_other(请求体Schema)、res_body(响应体Schema)
- 创建成功后返回完整的接口信息，包括自动生成的接口ID

📋 完整参数说明：
- title: 接口名称，1-100字符，如"获取用户信息"、"创建订单"
- path: 接口路径，必须以/开头，如"/api/user/info"
- method: HTTP方法，支持GET、POST、PUT、DELETE等
- project_id: 项目ID，可通过get_project获取
- catid: 分类ID，可通过get_category_menu获取
- status: 接口状态，undone(开发中)或done(已完成)，默认undone
- desc: 接口描述，可选
- req_body_other: 请求体JSON Schema，可选，用于定义复杂请求结构
- res_body: 响应体JSON Schema，可选，用于定义复杂响应结构

📊 返回信息：
- 新接口的完整信息：ID、名称、路径、HTTP方法
- 接口配置：状态、分类、项目归属、创建时间
- 高级字段：query_path、edit_uid、type等25+个字段
- MongoDB字段：包含__v版本字段

💡 使用场景：
- 为新功能创建API接口基础结构
- 建立接口规范和初始文档
- 快速创建接口原型

🔧 API详情：POST /api/interface/add
📝 真实验证：已通过真实API测试
  - 成功创建GET接口ID 12569（带查询参数和请求头）
  - 成功创建POST接口ID 12571（带JSON请求体和完整Schema）

⚠️ 重要提示：
- 必须确保project_id和catid都是有效的
- 接口路径在同一项目中应该是唯一的
- 创建后可使用update_interface或save_interface完善接口
- req_body_other需要是有效的JSON Schema字符串
- res_body需要是有效的JSON Schema字符串`;
  schema = AddInterfaceSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);

    // 构建请求参数，添加token并转换类型
    const requestParams = {
      ...input,
      method: input.method as HttpMethod
    };

    return await yapiService.addInterface(requestParams);
  }
}

export default AddInterface;
