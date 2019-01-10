import * as AWS from "aws-sdk";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { KMSKeyCollector } from "./list_keys";

export class KMSKeysPoliciesCollector extends BaseCollector {
    public collect() {
        return this.listAllKMSPolicies();
    }

    private async listAllKMSPolicies() {
        const kms = this.getClient("KMS", "us-east-1") as AWS.KMS;
        const keysCollector = new KMSKeyCollector();
        keysCollector.setSession(this.getSession());
        const get_key_policies = {};

        try {
            const keysData = await CollectorUtil.cachedCollect(keysCollector);
            for (const key of keysData.keys) {
                try {
                    const kmsKeyPolicy:
                    AWS.KMS.GetKeyPolicyResponse = await kms.getKeyPolicy({ KeyId: key.KeyId, PolicyName: "default" }).promise();
                    get_key_policies[key.KeyId] = kmsKeyPolicy.Policy;
                } catch (err) {
                    AWSErrorHandler.handle(err);
                    continue;
                }
            }
        } catch (err) {
            AWSErrorHandler.handle(err);
        }
        return { get_key_policies };
    }
}
