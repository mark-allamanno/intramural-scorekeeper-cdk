import { App, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { ScoreKeeperStack } from '../stacks/scorekeeper';

let app: App;
let stack: Stack;
let template: Template;

beforeEach(() => {
    app = new App();
    stack = new ScoreKeeperStack(app, 'TestStack');
    template = Template.fromStack(stack);
});

test('API Gateway and DNS Created', () => {
    template.hasResourceProperties("AWS::Route53::HostedZone", {
        Name: "intramuralscorekeeper.com.",
    });

    template.hasResourceProperties("AWS::CertificateManager::Certificate", {
        DomainName: "*.intramuralscorekeeper.com",
        ValidationMethod: "DNS",
    });

    template.hasResourceProperties("AWS::ApiGateway::RestApi", {
        Name: "ScoreKeeperAPIGateway"
    });
});
