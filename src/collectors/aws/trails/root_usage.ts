import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class CloudTrailsRootLoginCollector extends BaseCollector {
    public async collect() {
        const serviceName = "CloudTrail";
        const cloudTrailRegions = this.getRegions(serviceName);
        const self = this;
        const ct_root_usage = {};
        for (const region of cloudTrailRegions) {
            try {
                const cloudTrail = self.getClient(serviceName, region) as AWS.CloudTrail;
                const cloudTrailsResponse:
                    AWS.CloudTrail.LookupEventsResponse = await cloudTrail.lookupEvents().promise();
                ct_root_usage[region] = cloudTrailsResponse.Events;
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { ct_root_usage };
    }
}
