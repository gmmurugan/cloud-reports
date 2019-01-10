import {
    CheckAnalysisType,
    ICheckAnalysisResult,
    IDictionary,
    IResourceAnalysisResult,
    SeverityStatus,
} from "../../../types";
import {
    BaseAnalyzer,
} from "../../base";

export class UserGroupCompareAnalyzer extends BaseAnalyzer {

    public analyze(params: any, fullReport ?: any): any {
        const result = params.roles;
        let roleCount = this.countHumanAndServiceRolePerAccount(result);
        Object.keys(roleCount).forEach(function(key) {
            let totalNumOfHumanRole = roleCount[key].humanRoleCount;
            let totalNumOfServiceRole = roleCount[key].serviceRoleCount;
            let isAccountGood: boolean = false;
            if (totalNumOfHumanRole < 3 && totalNumOfServiceRole > 5) {
                isAccountGood = true;
            }
            Object.assign(roleCount[key], {IsAccountGood: isAccountGood});
        });
        const roles_group_count: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        roles_group_count.what = "Are there less service_roles for the account?";
        roles_group_count.why = "It is hard to manage security goals when there too many human roles and less service_roles as chances of mistakes increases";
        roles_group_count.recommendation = "Recommended to have 2-3 human_roles and atleast 5 service_roles per account";
        const allRegionsAnalysis: IDictionary<IResourceAnalysisResult[]> = {};
        const allRolesAnalysis: IResourceAnalysisResult[] = [];
        allRegionsAnalysis.global = [];
        Object.keys(roleCount).forEach(function(key) {
            const roles = roleCount[key].roles;
            for (const role of roles) {
                const roleAnalysis: IResourceAnalysisResult = {};
                roleAnalysis.resource = role.RoleName;
                roleAnalysis.resourceSummary = {
                    name: "Role Type",
                    value: role.RoleType,
                };
                // console.log("Role: ", roleCount[key]);
                if (!roleCount[key].IsAccountGood) {
                    roleAnalysis.severity = SeverityStatus.Failure;
                    roleAnalysis.message = "Federated Role";
                    roleAnalysis.action = "Use less human roles";
                } else {
                    roleAnalysis.severity = SeverityStatus.Good;
                    roleAnalysis.message = "Service Role used";
                }
                allRegionsAnalysis.global.push(roleAnalysis);
            }
        });
        roles_group_count.regions = allRegionsAnalysis;
        return { roles_group_count };
    }

    public countHumanAndServiceRolePerAccount(data) {
        let resJson = {};
        Object.keys(data).forEach(function(key) {
            let humanRoleCount = 0;
            let serviceRoleCount = 0;
            for (let i = 0; i < data[key].length; i++) {
                if (data[key][i].RoleType == "Human") {
                    humanRoleCount++;
                }
                if (data[key][i].RoleType == "Service") {
                    serviceRoleCount++;
                }
            }
            resJson[key] = {
                humanRoleCount,
                serviceRoleCount,
                roles: data[key],
            };
        });
        return resJson;
    }
}
