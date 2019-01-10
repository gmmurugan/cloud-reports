import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class KMSKeyCollector extends BaseCollector {
    public collect(callback: (err?: Error, data?: any) => void) {
        return this.listAllKeys();
    }

    private async listAllKeys() {
        try {
            const kms = this.getClient("KMS", "us-east-1") as AWS.KMS;
            const kmsKeysData: AWS.KMS.ListKeysResponse = await kms.listKeys().promise();
            const keys = kmsKeysData.Keys;
            return { keys };
        } catch (error) {
            AWSErrorHandler.handle(error);
        }
    }
}
