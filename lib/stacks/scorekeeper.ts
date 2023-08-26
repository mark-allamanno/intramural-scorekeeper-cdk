import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ScoreKeeperAPIGateway } from '../resources/api_gateway';
import { Function, Code, Runtime } from 'aws-cdk-lib/aws-lambda';
import path = require('path');

export class ScoreKeeperStack extends Stack {

    private readonly buildPath = `${path.resolve(__dirname)}/../build/application.zip`;

    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const apiGateway = new ScoreKeeperAPIGateway(this, 'APIGateway', {
            defaultHandler: this.createLambdaFunction('defaultResponse'),
            resourceHandlers: [],
            domainName: 'intramuralscorekeeper.com'
        });
    }

    private createLambdaFunction(functionName: string): Function {
        return new Function(this, functionName, {
            handler: 'index.handler',
            code: Code.fromAsset(this.buildPath),
            runtime: Runtime.PROVIDED_AL2,
        });
    }
}
