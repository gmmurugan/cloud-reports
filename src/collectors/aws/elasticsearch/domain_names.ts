import * as AWS from "aws-sdk";
import { AWSErrorHandler } from "../../../utils/aws";
import { BaseCollector } from "../../base";

export class ESDomainNamesCollector extends BaseCollector {
    public collect() {
        return this.getAllDomains();
    }

    private async getAllDomains() {

        const serviceName = "ES";
        const esRegions = this.getRegions(serviceName);
        const domain_names = {};

        for (const region of esRegions) {
            try {
                const es = this.getClient(serviceName, region) as AWS.ES;
                const domainsResponse: AWS.ES.ListDomainNamesResponse = await es.listDomainNames().promise();
                if (domainsResponse && domainsResponse.DomainNames) {
                    domain_names[region] = domainsResponse.DomainNames.map((domain) => {
                        return domain.DomainName;
                    });
                }
            } catch (error) {
                AWSErrorHandler.handle(error);
                continue;
            }
        }
        return { domain_names };
    }
}
