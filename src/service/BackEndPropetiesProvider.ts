
import {GLOBAL_PROPERTIES} from "../properties/properties";
import {GlobalAppProperties} from "../properties/propertiesInterface";

export class BackEndPropetiesProvider {
    properties:GlobalAppProperties = GLOBAL_PROPERTIES;
    constructor() {
    }

    getProperty(pptName:string):string {
        return this.properties[pptName];
    }
}

export var backEndPropetiesProvider = new BackEndPropetiesProvider();
