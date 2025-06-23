import { MCPTool, MCPInput } from 'mcp-framework';
import { yapiGet } from '../utils/yapi-request.js';
import { INTERFACE_ENDPOINTS } from '../constants/yapi-endpoints.js';
import { InterfaceSchema } from './schemas/interface-schemas.js';

const ListCatSchema = InterfaceSchema
  .pick({
    catid: true,
    status: true,
    page: true,
    limit: true
  })
  .partial({
    status: true,
    page: true,
    limit: true
  });

class ListCat extends MCPTool {
  name = 'list_cat';
  description = "获取某个分类下接口列表";
  schema = ListCatSchema;

  async execute(input: MCPInput<this>) {
    return await yapiGet(INTERFACE_ENDPOINTS.LIST_CAT, input);
  }
}

export default ListCat; 