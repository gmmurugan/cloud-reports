import * as AWS from "aws-sdk";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { EC2InstancesCollector } from "./instances";

export class InstanceImageCollector extends BaseCollector {
    public collect() {
        return this.getInstanceImageName();
    }

    private async getInstanceImageName() {

        const serviceName = "EC2";
        const ec2Regions = this.getRegions(serviceName);
        const instance_image_name = {};
        const ec2InstancesCollector = new EC2InstancesCollector();
        ec2InstancesCollector.setSession(this.getSession());
        try {
            const instancesData = await CollectorUtil.cachedCollect(ec2InstancesCollector);
            const instances = instancesData.instances;
            for (const region of ec2Regions) {
                try {
                    const ec2 = this.getClient(serviceName, region) as AWS.EC2;
                    instance_image_name[region] = [];
                    for (const instance of instances[region]) {
                        const instanceImageResponse: AWS.EC2.DescribeImagesResult =
                        await ec2.describeImages({ ImageIds: [instance.ImageId] }).promise();
                        instance_image_name[region].push(Object.assign(instance, instanceImageResponse));
                    }
                } catch (error) {
                    AWSErrorHandler.handle(error);
                    continue;
                }
            }
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
        return { instance_image_name };
    }
}
