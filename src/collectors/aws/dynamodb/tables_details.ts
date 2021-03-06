import * as AWS from "aws-sdk";
import { CollectorUtil } from "../../../utils";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";
import { DynamoDBTableNamesCollector } from "./table_names";

export class DynamoDBTablesDetailsCollector extends BaseCollector {
    public collect() {
        return this.getAllTablesDetails();
    }

    private async getAllTablesDetails() {

        const serviceName = "DynamoDB";
        const dynamoDBRegions = this.getRegions(serviceName);
        const tables_details = {};
        const dynamoDBTableNamesCollector = new DynamoDBTableNamesCollector();
        dynamoDBTableNamesCollector.setSession(this.getSession());
        const tablesData = await CollectorUtil.cachedCollect(dynamoDBTableNamesCollector);
        const tableNames = tablesData.tableNames;
        for (const region of dynamoDBRegions) {
            try {
                const dynamoDB = this.getClient(serviceName, region) as AWS.DynamoDB;
                tables_details[region] = [];
                for (const tableName of tableNames[region]) {
                    const tableResponse: AWS.DynamoDB.DescribeTableOutput =
                        await dynamoDB.describeTable({ TableName: tableName }).promise();
                    if (tableResponse.Table) {
                        tables_details[region].push(tableResponse.Table);
                    }
                }
            } catch (err) {
                AWSErrorHandler.handle(err, region);
                continue;
            }
        }
        return { tables_details };
    }
}
