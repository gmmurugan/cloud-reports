import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { CommonUtil, ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";

export class EC2InstancesGoldenAMIAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const allInstances = params.instance_image_name;
        if (!allInstances) {
            return undefined;
        }
        const instances_golden_ami: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        instances_golden_ami.what = "Are there any instances which is not using golden AMI?";
        instances_golden_ami.why = `Its recomended to use Golden Image.`;
        instances_golden_ami.recommendation = "Recommended to use Golden AMI for all instances";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        for (const region in allInstances) {
            const regionInstances = allInstances[region];
            allRegionsAnalysis[region] = [];
            for (const instance of regionInstances) {
                const instanceAnalysis: IResourceAnalysisResult = {};
                instanceAnalysis.resource = {
                    amiId: instance.ImageId,
                    imageName: instance.Images[0].Name,
                    instanceId: instance.InstanceId,
                    instanceName: ResourceUtil.getNameByTags(instance),
                };
                instanceAnalysis.resourceSummary = {
                    name: "Instance",
                    value: `${instanceAnalysis.resource.instanceName} | ${instance.InstanceId} | ${instance.ImageId}`,
                };

                if (instance.Images[0].Name.includes("golden")) {
                    instanceAnalysis.severity = SeverityStatus.Good;
                    instanceAnalysis.message = "Used Golden AMI";
                } else {
                    instanceAnalysis.severity = SeverityStatus.Failure;
                    instanceAnalysis.message = `No Golden AMI used`;
                    instanceAnalysis.action = "Action Required: Change the Image";
                }
                allRegionsAnalysis[region].push(instanceAnalysis);
            }
        }
        instances_golden_ami.regions = allRegionsAnalysis;
        return { instances_golden_ami };
    }

}