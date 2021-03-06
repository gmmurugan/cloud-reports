import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ResourceGroupsCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.getAllResourceGroups();
    }

    private async getAllResourceGroups() {

        const self = this;

        const serviceName = "ResourceGroups";
        const resourceGroupsRegions = self.getRegions(serviceName);
        const resource_groups = {};

        for (const region of resourceGroupsRegions) {
            try {
                const resourceGroups = self.getClient(serviceName, region) as AWS.ResourceGroups;
                resource_groups[region] = [];
                let fetchPending = true;
                let marker: string | undefined;
                while (fetchPending) {
                    const resourceGroupsResponse:
                        AWS.ResourceGroups.Types.ListGroupsOutput =
                        await resourceGroups.listGroups({ NextToken: marker }).promise();
                    if (resourceGroupsResponse.Groups) {
                        resource_groups[region] = resource_groups[region].concat(resourceGroupsResponse.Groups);
                    }
                    marker = resourceGroupsResponse.NextToken;
                    fetchPending = marker !== undefined && marker !== null;
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
            }
        }
        return { resource_groups };
    }
}
