import { LLM } from './llm';
import { Tool } from './tools/tool';
import { Prover } from './provers/prover';
import { Memory } from './memory';
import { Workflow } from './workflow';

export class Agent {
  private workflow: Workflow;

  constructor(llm: LLM, tools: Tool[], provers: Prover[], memory: Memory) {
    this.workflow = new Workflow(llm, tools, provers, memory);
  }

  async run(input: string): Promise<string> {
    return this.workflow.execute(input);
  }
}