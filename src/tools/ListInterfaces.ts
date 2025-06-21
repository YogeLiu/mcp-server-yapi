import { MCPTool, MCPInput } from 'mcp-framework';
import { z } from 'zod';
import { YapiService } from '../services/yapi-service.js';
import { YapiClient } from '../yapi-client.js';
import { loadConfig } from '../config.js';
import { InterfaceStatus } from '../types/yapi-types.js';

const ListInterfacesSchema = z.object({
  project_id: z.number().int().positive()
    .describe('项目ID - 要查询接口列表的YAPI项目ID。可通过get_project获取当前项目ID'),
  page: z.number().int().positive()
    .describe('页码 - 分页查询的页码，从1开始。默认为1'),
  limit: z.number().int().positive().max(100)
    .describe('每页数量 - 每页返回的接口数量，范围1-100，默认20。建议根据需要调整，避免一次获取过多数据'),
  status: z.enum(['done', 'undone']).optional()
    .describe('接口状态过滤（可选）- done(已完成)或undone(开发中)。不提供则返回所有状态的接口'),
  tag: z.string().optional()
    .describe('标签过滤（可选）- 按接口标签过滤。可用于查找特定类型的接口')
});

class ListInterfaces extends MCPTool {
  name = 'list_interfaces';
  description = `获取YAPI项目的接口列表，支持分页和过滤查询。

⚡ 使用说明：
- 必需参数：project_id(项目ID)
- 可选参数：page(页码，默认1)、limit(每页数量，默认20)、status(状态过滤)、tag(标签过滤)
- 支持分页查询，避免数据量过大
- 支持按状态和标签过滤接口
- 返回接口的ID、名称、路径、HTTP方法、状态等关键信息

📋 完整参数说明：
- project_id: 项目ID，必需，可通过get_project获取当前项目ID
- page: 页码，可选，从1开始，默认1
- limit: 每页数量，可选，范围1-100，默认20
- status: 接口状态过滤，可选，done(已完成)或undone(开发中)
- tag: 标签过滤，可选，按接口标签过滤特定类型接口

📊 返回信息：
- 分页信息：总数量、当前页码、每页数量
- 接口列表：每个接口包含ID、标题、路径、HTTP方法、状态、更新时间
- 接口基本信息：足够用于后续调用get_interface获取详情

💡 使用场景：
- 浏览项目的所有API接口
- 查找特定状态的接口（开发中/已完成）
- 获取接口ID用于后续详细查询
- 项目接口概览和管理

🔧 API详情：GET /api/interface/list
📝 实现状态：已调用真实API，支持完整分页和过滤功能

💡 最佳实践：
- 首次查询建议使用较小的limit（如10-20）
- 可以通过status过滤查看开发状态
- 获取到接口ID后，使用get_interface查看详细信息
- 对于大型项目，建议分页浏览而非一次性获取所有接口

⚠️ 重要提示：
- 返回的是接口摘要信息，详细配置需要调用get_interface
- 支持状态过滤，便于查看不同开发阶段的接口
- 分页查询有助于处理大量接口的项目`;
  schema = ListInterfacesSchema;

  async execute(input: MCPInput<this>) {
    const config = loadConfig();
    const yapiClient = new YapiClient(config);
    const yapiService = new YapiService(yapiClient);

    const requestParams = {
      ...input,
      status: input.status as InterfaceStatus | undefined,
    };

    return await yapiService.listInterfaces(requestParams);
  }
}

export default ListInterfaces; 