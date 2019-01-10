import { CheckAnalysisType, ICheckAnalysisResult, IResourceAnalysisResult, SeverityStatus } from "../../../types";
import { BaseAnalyzer } from "../../base";

export class BucketEncryptionAnalyzer extends BaseAnalyzer {

    public analyze(params: any): any {
        const allBucketEncryptionRules = params.bucket_encryption;
        if (!allBucketEncryptionRules) {
            return undefined;
        }
        const bucket_encryption_used: ICheckAnalysisResult = { type: CheckAnalysisType.Security };
        bucket_encryption_used.what = "Are S3 Buckets Encrypted?";
        bucket_encryption_used.why = `It is better to encrypt buckets.`;
        bucket_encryption_used.recommendation = "Recommended to encript buckets";
        const allBucketsAnalysis: IResourceAnalysisResult[] = [];
        for (const bucketName in allBucketEncryptionRules) {
            const bucket_analysis: IResourceAnalysisResult = {};
            bucket_analysis.resource = { bucketName, bucketLifeCycleRules: allBucketEncryptionRules[bucketName] };
            bucket_analysis.resourceSummary = {
                name: "Bucket", value: bucketName,
            };
            if (allBucketEncryptionRules[bucketName] && allBucketEncryptionRules[bucketName].length > 0) {
                bucket_analysis.severity = SeverityStatus.Good;
                bucket_analysis.message = "Bucket Encryption is configured";
            } else {
                bucket_analysis.severity = SeverityStatus.Warning;
                bucket_analysis.message = "Bucket Encryption not configured";
                bucket_analysis.action = "Configure bucket Encryption";
            }
            allBucketsAnalysis.push(bucket_analysis);
        }
        bucket_encryption_used.regions = { global: allBucketsAnalysis };
        return { bucket_encryption_used: bucket_encryption_used };
    }
}
