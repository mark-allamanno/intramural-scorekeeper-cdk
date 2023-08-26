import { App } from "aws-cdk-lib";
import { ScoreKeeperStack } from "./stacks/scorekeeper";

const app = new App();

new ScoreKeeperStack(app, 'ScoreKeeperStack');