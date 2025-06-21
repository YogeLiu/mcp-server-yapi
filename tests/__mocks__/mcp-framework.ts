export class MCPTool {
  name = '';
  description = '';
  schema = {};
  
  async execute(input: any): Promise<string> {
    return '';
  }
}

export interface MCPInput<T> {
  [key: string]: any;
} 