import { Construct } from 'constructs';
import { LambdaRestApi } from 'aws-cdk-lib/aws-apigateway'
import { Function } from 'aws-cdk-lib/aws-lambda';
import { HostedZone, ARecord, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { ApiGateway } from 'aws-cdk-lib/aws-route53-targets';
import { Certificate, CertificateValidation } from 'aws-cdk-lib/aws-certificatemanager';

interface ResourceHandlerLambdaProps {
    /**
     * The Lambda function to handle requests to this API Gateway resource
     */
    handler: Function,

    /**
     * The resource path that this lambda will serve in the API Gateway.
     */
    resource: string,

    /**
     * The HTTP methods that this resource handler should support.
     * 
     * Ex. [GET, POST, PUT]
     */
    methods: string[],
};

interface APIGatewayProps {
    /**
     * The default lambda that should service all non-mapped resources. This should 
     * just return an error message to the caller if ever invoked.
     */
    defaultHandler: Function,

    /**
     * Each of the resources and associated lambda functions to add to the gateway.
     * We should have one lambda handler per resource.
     */
    resourceHandlers: ResourceHandlerLambdaProps[],

    /**
     * The custom domain name that we should use instead of the auto-generated stuff
     * from API Gateway.
     * 
     * Ex. intramuralscorekeeper.com
     */
    domainName: string
};

export class ScoreKeeperAPIGateway extends Construct {

    readonly api: LambdaRestApi;

    constructor(scope: Construct, id: string, props: APIGatewayProps) {
        super(scope, id);

        const apiEndpointSubDomain = `api.${props.domainName}`;

        const route53Dns = new HostedZone(this, 'ScoreKeeperRoute53', {
            zoneName: props.domainName,
        });

        const certificate = new Certificate(this, 'ScoreKeeperCertificate', {
            domainName: `*.${props.domainName}`,
            certificateName: 'ScoreKeeperDNSCertificate',
            validation: CertificateValidation.fromDns(route53Dns),
        });

        this.api = new LambdaRestApi(scope, 'ScoreKeeperAPIGateway', {
            handler: props.defaultHandler,
            domainName : {
                domainName: apiEndpointSubDomain,
                certificate: certificate
            },
        });

        const customApiDomainRecord = new ARecord(this, 'CustomApiDomainRecord', {
            zone: route53Dns,
            recordName: apiEndpointSubDomain,
            target: RecordTarget.fromAlias(new ApiGateway(this.api)),
        });

        props.resourceHandlers.forEach((lambda) => {
            const resource = this.api.root.addResource(lambda.resource);
            lambda.methods.forEach((method) => resource.addMethod(method));
        });
    }
}

