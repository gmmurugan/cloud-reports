import * as AWS from "aws-sdk";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { BucketsCollector } from "./buckets";

export class BucketEncryptionCollector extends BaseCollector {
    public collect() {
        return this.getEncriptionInfo();
    }

    private async getEncriptionInfo() {
        const s3 = this.getClient("S3", "us-east-1") as AWS.S3;
        const bucketsCollector = new BucketsCollector();
        bucketsCollector.setSession(this.getSession());
        const bucket_encryption = {};

        try {
            const bucketsData = await CollectorUtil.cachedCollect(bucketsCollector);
            for (const bucket of bucketsData.buckets) {
                bucket_encryption[bucket.Name] = [];
                try {
                    const s3BucketEncriptionOutput:
                        AWS.S3.GetBucketEncryptionOutput =
                        await s3.getBucketEncryption
                            ({ Bucket: bucket.Name}).promise();
                    bucket_encryption[bucket.Name] =
                        bucket_encryption[bucket.Name].concat
                            (s3BucketEncriptionOutput.ServerSideEncryptionConfiguration!.Rules);
                } catch (err) {
                    if (err.code === "ServerSideEncryptionConfigurationNotFoundError") {
                        bucket_encryption[bucket.Name] = undefined;
                    } else {
                        AWSErrorHandler.handle(err);
                    }
                }
            }
        } catch (err) {
            AWSErrorHandler.handle(err);
        }
        return { bucket_encryption };

    }
}
