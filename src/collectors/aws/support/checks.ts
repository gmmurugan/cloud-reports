import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class TAChecksCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllChecks();
    }

    private async listAllChecks() {
        try {
            const ta = this.getClient("Support", "us-east-1") as AWS.Support;
            const trusted_advisor: AWS.Support.DescribeTrustedAdvisorChecksResponse =
            await ta.describeTrustedAdvisorChecks({ language: "en" }).promise();
            // console.log(trusted_advisor);
            return { trusted_advisor };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
