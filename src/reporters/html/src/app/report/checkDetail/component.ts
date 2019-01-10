import { ArrayUtil } from './../../../utils/array';
import { Component, OnInit, ViewChild } from '@angular/core';
import { CloudReportService } from '../report.service'
import { ActivatedRoute, Router } from '@angular/router';
import { MatSort, MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
    selector: 'app-cloud-report-check-detail',
    templateUrl: 'component.html',
    styleUrls: ['component.scss']
})
export class CloudReportCheckDetailComponent implements OnInit {

    displayedColumns = ['type', 'service', 'checkCategory', 'region', 'resourceName', 'resourceValue', 'message', 'severity', 'action'];
    dataSource;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    resultLength = 0;
    services: string[];
    selectedService: string;
    serviceCheckCategories: string[];
    selectedServiceCheckCategory: string;
    regions: string[];
    types: string[];
    selectedRegion: string;
    selectedType: string;
    hasNoRegions = true;
    selectedSeverity: string[];
    tableData: any[];
    scanReportData: Object;
    removable: boolean = true;

    filterSelections: Object[];

    constructor(
        private cloudReportService: CloudReportService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit() {
        this.loadCheckDetailPageData();
    }

    private getServiceKey(provider = "aws") {
        return this.selectedService ? provider + '.' + this.selectedService : undefined;
    }

    loadCheckDetailPageData() {
        this.route.queryParams.subscribe((urlData) => {
            this.cloudReportService.getScanReportData()
                .subscribe((data) => {
                    // this.loadFilterSelection();
                    this.scanReportData = data;
                    this.services = this.cloudReportService.getServices(data);
                    this.selectedSeverity = ArrayUtil.toArray(urlData['severity']);
                    this.selectedService = urlData['service'];
                    const serviceKey = this.getServiceKey();
                    if (this.selectedService) {
                        this.serviceCheckCategories = this.cloudReportService.getServiceCheckCategories(this.cloudReportService.getCheckDetailData(data, serviceKey));
                    }
                    this.selectedServiceCheckCategory = urlData['checkCategory'] == 'null' || urlData['checkCategory'] == 'undefined' ? 'all' : urlData['checkCategory'];
                    // if (this.selectedServiceCheckCategory) {
                    //     this.regions = this.cloudReportService.getServiceRegions(this.cloudReportService.getCheckDetailData(data, serviceKey, this.selectedServiceCheckCategory, undefined, this.selectedSeverity));
                    // } else {
                    //     this.regions = this.cloudReportService.getServiceRegions(this.cloudReportService.getCheckDetailData(data, serviceKey, undefined, undefined, this.selectedSeverity));
                    // }
                    this.regions = this.cloudReportService.getAllRegions('aws');
                    this.selectedRegion = urlData['region'] == 'null' || urlData['region'] == 'undefined' ? 'all' : urlData['region'];
                    if (this.regions.length === 1) {
                        this.selectedRegion = this.regions[0];
                    }

                    this.types = ["Informational", "Security", "Reliability", "PerformanceEfficiency", "CostOptimization", "OperationalExcellence"];
                    this.selectedType = urlData['type'] == 'null' || urlData['type'] == 'undefined' ? 'all' : urlData['type'];
                    console.log("Selected type: ", this.selectedType);
                    if (this.types.length === 1) {
                        this.selectedType = this.types[0];
                    }
                    console.log("Selected type1: ", this.selectedType);
                    const filterredData = this.cloudReportService.getCheckDetailData(data, serviceKey, this.selectedServiceCheckCategory, this.selectedRegion, this.selectedSeverity, this.selectedType);
                    // console.log('filtered data', filterredData);
                    this.tableData = this.makeTableData(filterredData);
                    // console.log('table data', this.tableData)
                    this.dataSource = new MatTableDataSource(this.tableData)
                    this.resultLength = this.tableData.length;
                    this.dataSource.paginator = this.paginator;
                    this.dataSource.sort = this.sort;
                }, (error) => {
                    console.log(error);
                });
        });
    }

    applyFilter(filterValue: string) {
        this.dataSource.filter = filterValue.trim().toLowerCase();
    }

    fetchServiceCheckCategories() {
        this.selectedServiceCheckCategory = undefined;
        this.serviceCheckCategories = this.cloudReportService.getServiceCheckCategories(this.cloudReportService.getCheckDetailData(this.scanReportData, this.getServiceKey()))
        // this.selectedRegion = undefined;
        // this.regions = [];
        this.reload();
    }

    fetchServiceCheckCategoryType() {
        this.reload();
    }

    fetchServiceCheckCategoryRegions() {
        // this.selectedRegion = undefined;
        // this.regions = this.cloudReportService.getServiceRegions(this.cloudReportService.getCheckDetailData(this.scanReportData, this.getServiceKey(), this.selectedServiceCheckCategory, undefined, this.selectedSeverity));
        this.reload();
    }

    reload() {
        // console.log('all data is present, selectedService = ' + this.selectedService + ' or selectedServiceCheckCategory = ' + this.selectedServiceCheckCategory + ' or selectedServiceCheckCategoryRegion =' + this.selectedRegion + ' or selectedSeverity =' + this.selectedSeverity + ' and reloading page');
        if (!ArrayUtil.isNotBlank(this.selectedSeverity)) {
            this.selectedSeverity = undefined;
        }
        // this.storeFliterSelectionData({
        //     checkCategory: this.selectedServiceCheckCategory,
        //     region: this.selectedRegion,
        //     service: this.selectedService,
        //     severity: this.selectedSeverity
        // });
        this.router.navigate(['/report/checkDetail'], {
            queryParams: {
                checkCategory: this.selectedServiceCheckCategory,
                region: this.selectedRegion,
                service: this.selectedService,
                severity: this.selectedSeverity,
                type: this.selectedType
            }
        });
    }

    goToServiceDashboard() {
        this.router.navigate(['/report/checkCategory', this.selectedService]);
    }

    private makeTableData(filteredDataObject: any) {
        const tableData = [];
        if (filteredDataObject && typeof filteredDataObject === 'object') {
            for (let serviceObjectKey in filteredDataObject) {
                for (let checkCategoryObjectKey in filteredDataObject[serviceObjectKey]) {
                    const regionsObject = filteredDataObject[serviceObjectKey][checkCategoryObjectKey].regions;
                    for (let regionsObjectKey in regionsObject) {
                        for (let i = 0; i < regionsObject[regionsObjectKey].length; i++) {
                            regionsObject[regionsObjectKey][i]['type'] = filteredDataObject[serviceObjectKey][checkCategoryObjectKey].type;
                            regionsObject[regionsObjectKey][i]['service'] = serviceObjectKey.split('.')[1];
                            regionsObject[regionsObjectKey][i]['checkCategory'] = checkCategoryObjectKey;
                            regionsObject[regionsObjectKey][i]['region'] = regionsObjectKey;
                            regionsObject[regionsObjectKey][i]['recommendation'] = filteredDataObject[serviceObjectKey][checkCategoryObjectKey].recommendation;
                            tableData.push(regionsObject[regionsObjectKey][i]);
                        }
                    }
                }
            }
        }
        return tableData;
    }

    // loadFilterSelection() {
    //     const filterSelectionData = this.cloudReportService.getFilterSelectionData();
    //     console.log('Loading filter selection data: ', filterSelectionData);
        
    //     // this.filterSelections = filterSelectionData;
    // }

    // storeFliterSelectionData(data) {
    //     console.log('Filter data is storing..');
    //     this.cloudReportService.storeFilterSelectionData(data);
    // }

    // remove(filterSelection) {
    //     console.log(filterSelection)
    //     if (filterSelection.key === 'service') {
    //         this.selectedService = undefined;
    //     }
    //     if (filterSelection.key === 'checkCategory') {
    //         this.selectedServiceCheckCategory = undefined;
    //     }
    //     if (filterSelection.key === 'severity') {
    //         this.selectedSeverity = [];
    //     }
    //     if (filterSelection.key === 'region') {
    //         this.selectedRegion = undefined;
    //     }
    //     this.reload();
    // }
}
