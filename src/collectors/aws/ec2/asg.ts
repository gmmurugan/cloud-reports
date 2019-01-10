import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { LogUtil } from "../../../utils/log";

export class ASGCollector extends BaseCollector {
    public collect() {
        return this.getASGInformation();
    }

    private async getASGInformation() {
        const autoscaling = new AWS.AutoScaling({region: 'us-east-1'});
        const asg_min_max_settings = {};

        await autoscaling.describeAutoScalingGroups({}, function(err, data) {
            if (err) {
                LogUtil.error(err, err.stack);
            } else {
                data['AutoScalingGroups'].forEach(function(value) {
                    var min_size = value['MinSize'];
                    var max_size = value['MaxSize'];
                    asg_min_max_settings[value['AutoScalingGroupName']] = [];
                    
                    if (min_size == max_size) {
                        asg_min_max_settings[value['AutoScalingGroupName']] =
                        asg_min_max_settings[value['AutoScalingGroupName']].concat
                                ("Invalid");
                    } else {
                        asg_min_max_settings[value['AutoScalingGroupName']] =
                        asg_min_max_settings[value['AutoScalingGroupName']].concat
                                ("Valid");
                    }
                });
            }
          }).promise();
        return { asg_min_max_settings };
    }
}
