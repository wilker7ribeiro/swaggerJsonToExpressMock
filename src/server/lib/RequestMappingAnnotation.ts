import { MetadataKeys } from './metadataKeys';
import { Handler } from 'express';

export interface Route {
	method: 'get' | 'post' | 'put' | 'delete';
	path: string;
	action: Handler;
	middleWares?: Handler[];
}
export interface RequestMappingOptions {
	method: 'get' | 'post' | 'put' | 'delete';
	path: string;
	middleWares?: Handler[];
}

export interface RequestMappingConfig {
	method: 'get' | 'post' | 'put' | 'delete';
	path: string;
	action?: Handler;
	middleWares?: Handler[];
}

export interface RoutesMetaData {
	routes: Route[];
}

// Property Decorator
export function RequestMapping(options: RequestMappingConfig) {
	return (target: any, propertyName: string, decriptor: TypedPropertyDescriptor<Handler>) => {
		// console.log("RequestMapping ->", target);
		// console.log("RequestMapping ->", propertyName);
		// console.log("RequestMapping ->", decriptor);
		const classConstructor = target.constructor;
		if(decriptor.value){
			const action: Handler = decriptor.value;
			const metadata: RoutesMetaData = Reflect.getMetadata(MetadataKeys.ROUTES_CONFIG_METADATA, classConstructor) || { routes: [] };
			options.action = action;
			const route: Route = {
				action: action,
				method: options.method,
				middleWares: options.middleWares,
				path: options.path
			};
			metadata.routes.push(route);
			Reflect.defineMetadata(MetadataKeys.ROUTES_CONFIG_METADATA, metadata, classConstructor);
		} else {
			console.log("No action defined")
		}

	};
}