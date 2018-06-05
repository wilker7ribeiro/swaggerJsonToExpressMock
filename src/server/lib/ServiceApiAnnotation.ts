import { MetadataKeys } from "./metadataKeys";
import "reflect-metadata";

export interface ServiceApiConfig {
    path?: string;
}
export interface AppServiceApi {

}

// Class Decorator
export function ServiceApi(options?: ServiceApiConfig) {
    // return <T extends AppServiceApi>(constructor: new () => T) => {
    return <T>(constructor: new (...args: any[]) => T) => {
        // console.log('ServiceApi');
        Reflect.defineMetadata(MetadataKeys.SERVICE_API_CONFIG_METADATA, options, constructor);
    };
}