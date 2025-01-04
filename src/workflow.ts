import { LLM } from './llm';
import { Tool } from './tools/tool';
import { Prover } from './provers/prover';
import { Memory } from './memory';

interface ActionResult {
    tool?: Tool;
    output: string;
}

export class Workflow {
    llm: LLM;
    tools: Tool[];
    provers: Prover[];
    memory: Memory;


    constructor(llm: LLM, tools: Tool[], provers: Prover[], memory: Memory) {
        this.llm = llm;
        this.tools = tools;
        this.provers = provers;
        this.memory = memory;
    }

    async execute(input: string): Promise<string> {
        const memoryVariables = this.memory.loadMemoryVariables();
        const availableTools = this.tools.map(tool => ({ name: tool.name, description: tool.description }));

        const prompt = `
            Previous Conversation: ${JSON.stringify(memoryVariables.history)}
            User Input: ${input}

            Available Tools: ${JSON.stringify(availableTools)}

            Respond with a JSON object in the following format:
            \`\`\`json
            {
                "tool": "tool_name_or_null", // The name of the tool to use, or null if no tool is needed
                "tool_input": "input_for_the_tool" // The input to pass to the tool in json format (only if a tool is selected)
            }
            \`\`\`
            If no tool is needed, set "tool" to null and provide a response in "tool_input".
        `;

        try {
            const llmResponse = await this.llm.generate(prompt);
            console.log("LLM raw response:", llmResponse)
            const action: ActionResult = this.parseLLMResponse(llmResponse);

            let output: string;
            if (action.tool) {
                const toolOutput = await action.tool.execute(action.output);

                const availableProvers = this.provers.map(prover => ({ name: prover.name, description: prover.description }));
                const proverPrompt = `
                    Previous Conversation: ${JSON.stringify(memoryVariables.history)}
                    User Input: ${input}
                    Tool Used: ${action.tool.name}
                    Tool Input: ${action.output}
                    Tool Output: ${toolOutput}

                    Available Provers: ${JSON.stringify(availableProvers)}

                    Respond with a JSON object in the following format:
                    \`\`\`json
                    {
                        "prover": "prover_name_or_null", // The name of the prover to use, or null if no prover is needed
                        "prover_input": "input_for_the_prover" // The input to pass to the tool in json format (only if a tool is selected)
                    }
                    \`\`\`
                    If no prover is needed, set "prover" to null and provide a response in "tool_input".
                `;

                const llmResponseforProver = await this.llm.generate(proverPrompt);
                console.log("LLM raw response for prover:", llmResponseforProver)
                const proverAction: ActionResult = this.parseLLMResponseforProver(llmResponseforProver);


                let proverOutput: string = "None";
                if (proverAction.tool) {
                    proverOutput = await proverAction.tool.execute(proverAction.output);
                }

                // FEED TOOL OUTPUT BACK TO LLM
                const finalPrompt = `
                    Previous Conversation: ${JSON.stringify(this.memory.loadMemoryVariables().history)}
                    User Input: ${input}
                    Tool Used: ${action.tool.name}
                    Tool Input: ${action.output}
                    Tool Output: ${toolOutput}
                    Prover Used: ${proverAction.tool ? proverAction.tool.name : "None"}
                    Prover Input: ${proverAction.output}
                    Prover Output: ${proverOutput}

                    Generate a human-readable response based on the tool output.
                `;
                output = await this.llm.generate(finalPrompt);

            } else {
                output = action.output; // LLM handles it directly (no tool used)
            }

            this.memory.saveContext(input, output);
            return output;

        } catch (error) {
            console.error("Workflow Error:", error);
            return "Workflow Error: " + error; // Return a user-friendly error message
        }
    }

    private parseLLMResponse(llmResponse: string): ActionResult {
        try {
            // Remove Markdown code blocks if present
            const cleanResponse = llmResponse.replace(/```json\n/g, '').replace(/```/g, '').trim();

            const jsonResponse = JSON.parse(cleanResponse);
            const toolName = jsonResponse.tool;
            const toolInput = jsonResponse.tool_input;

            if (toolName) {
                const tool = this.tools.find(t => t.name === toolName);
                if (tool) {
                    return { tool, output: toolInput };
                } else {
                    return { output: `Tool "${toolName}" not found.` };
                }
            } else {
                return { output: toolInput || "No tool needed." };
            }
        } catch (error) {
            console.error("Error parsing LLM response:", error, "Raw LLM Response:", llmResponse);
            return { output: `Error parsing LLM response: ${error}. Raw Response: ${llmResponse}. Cleaned Response (for debugging): ${llmResponse.replace(/```json\n/g, '').replace(/```/g, '').trim()}` };
        }
    }

    private parseLLMResponseforProver(llmResponse: string): ActionResult {
        try {
            // Remove Markdown code blocks if present
            const cleanResponse = llmResponse.replace(/```json\n/g, '').replace(/```/g, '').trim();

            const jsonResponse = JSON.parse(cleanResponse);
            const toolName = jsonResponse.tool;
            const toolInput = jsonResponse.tool_input;

            if (toolName) {
                const tool = this.tools.find(t => t.name === toolName);
                if (tool) {
                    return { tool, output: toolInput };
                } else {
                    return { output: `Tool "${toolName}" not found.` };
                }
            } else {
                return { output: toolInput || "No tool needed." };
            }
        } catch (error) {
            console.error("Error parsing LLM response:", error, "Raw LLM Response:", llmResponse);
            return { output: `Error parsing LLM response: ${error}. Raw Response: ${llmResponse}. Cleaned Response (for debugging): ${llmResponse.replace(/```json\n/g, '').replace(/```/g, '').trim()}` };
        }
    }
}