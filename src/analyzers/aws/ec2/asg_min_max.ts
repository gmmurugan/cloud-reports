import {
    CheckAnalysisType, ICheckAnalysisResult, IDictionary,
    IResourceAnalysisResult, SeverityStatus,
} from "../../../types";
import { ResourceUtil } from "../../../utils";
import { BaseAnalyzer } from "../../base";
import { LogUtil } from "../../../utils/log";

export class AsgAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport?: any): any {
        const group_settings = params.asg_min_max_settings;
        if (!group_settings) {
            return undefined;
        }
        const asg_setting: ICheckAnalysisResult = { type: CheckAnalysisType.OperationalExcellence };
        asg_setting.what = "Are Min and Max value of ASG same?";
        asg_setting.why = "Help to follow security practices easily";
        asg_setting.recommendation = "Recommended to have different value for Min and Max";
        const allASGAnalysis: IResourceAnalysisResult[] = [];
        for (const setting in group_settings) {
            const asg_analysis: IResourceAnalysisResult = {};
            asg_analysis.resource = { setting, asgRule: group_settings[setting] };
            asg_analysis.resourceSummary = {
                name: "ASG", value: setting,
            };
            if (group_settings[setting] && group_settings[setting] == "Valid") {
                asg_analysis.severity = SeverityStatus.Good;
                asg_analysis.message = "Min and Max values are different";
            } else {
                asg_analysis.severity = SeverityStatus.Warning;
                asg_analysis.message = "Min and Max setting is same";
                asg_analysis.action = "Min and Max should be different";
            }
            allASGAnalysis.push(asg_analysis);
        }
        asg_setting.regions = { global: allASGAnalysis };
        return { asg_setting: asg_setting };
    }
}
