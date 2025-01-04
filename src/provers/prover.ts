export interface Prover {
    name: string;
    description: string;
    prove(input: string): Promise<string>;
    verify(input: string): Promise<boolean>;
}

export abstract class APIProver implements Prover {
    name: string;
    description: string;
    protected apiKey: string;

    constructor(name: string, description: string, apiKey: string) {
        this.name = name;
        this.description = description;
        this.apiKey = apiKey;
    }

    abstract prove(input: string): Promise<string>;

    abstract verify(input: string): Promise<boolean>;
}