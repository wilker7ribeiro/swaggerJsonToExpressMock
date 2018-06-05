import { ServiceApiConfig } from "./ServiceApiAnnotation";
import { Application } from "express";
import { Route, RoutesMetaData } from "./RequestMappingAnnotation";
import { MetadataKeys } from "./metadataKeys";
import { Request, Response, NextFunction, Errback } from "express";
import glob = require("glob")
import * as path from "path";



export interface ModuleManegerService {
    constructor: any;
    instance?: any;
    config: ServiceApiConfig
}

export interface ModuleManagerRoute extends Route {
    service: ModuleManegerService;
}

export abstract class ModuleManager {
    static app: Application;
    static servicos: ModuleManegerService[] = []
    static routes: ModuleManagerRoute[] = [];

    static init(app: Application, cb: () => void) {
        ModuleManager.app = app;

        glob("./dist/server/api/*.js", (err, fileList) => {
            var importList = fileList.map(filePath => {
                return import(path.join(process.cwd(), filePath));
            })
            Promise.all(importList).then((servicesImport: any) => {
                servicesImport.forEach((serviceImport: any) => {
                    var name = Object.keys(serviceImport)[0]
                    var constructor = serviceImport[name];
                    var config = Reflect.getMetadata(MetadataKeys.SERVICE_API_CONFIG_METADATA, serviceImport[name]);
                    console.log(config)
                    ModuleManager.servicos.push({
                        config: Reflect.getMetadata(MetadataKeys.SERVICE_API_CONFIG_METADATA, serviceImport[name]),
                        constructor: serviceImport[name],
                        instance: null
                    })

                })
                ModuleManager.servicos.forEach(service => {
                    ModuleManager.inicializarRotas(service)
                });
                cb(app)
            })

        })

    }


    // static inicializarModulos() {
    //     ModuleManager.modules.forEach((Module: ModuleManagerModulo, index) => {
    //         ModuleManager.inicializarServices(Module);
    //     });
    // }

    // static inicializarServico() {
    //     ModuleManager.servicos = [];
    //     ModuleManager.servicos.forEach((serviceConstructor, index) => {
    //         const serviceConfig = Reflect.getMetadata(MetadataKeys.SERVICE_API_CONFIG_METADATA, serviceConstructor);
    //         const constrollerInstance = new serviceConstructor();
    //         ModuleManager.services.push({ constructor: serviceConstructor, config: serviceConfig, instance: constrollerInstance });
    //     });
    //     Module.services.forEach(Service => {
    //         ModuleManager.inicializarRotas(Service, Module);
    //     });
    // }


    /** @todo separar gerenciamento de rotas em outra classe */
    static inicializarRotas(Service: ModuleManegerService) {

        const ServiceConstructor = Service.constructor;
        console.log(new ServiceConstructor())
        const routeMetaDataObj: RoutesMetaData = Reflect.getMetadata(MetadataKeys.ROUTES_CONFIG_METADATA, ServiceConstructor) || {};
        console.log(routeMetaDataObj)
        const metaDataRoutes: Route[] = routeMetaDataObj.routes || [];
        metaDataRoutes.forEach((rota) => {
            if (Service.config) {
                ModuleManager.configurarRota(rota, Service);
            }
            ModuleManager.inicializarRota(rota, Service);
        });
    }

    static configurarRota(rota: Route, Service: ModuleManegerService) {
        rota.path = rota.path.startsWith('\/') ? rota.path : '/' + rota.path;
        if (Service.config.path) {
            Service.config.path = Service.config.path.startsWith('\/') ? Service.config.path : '/' + Service.config.path;
            rota.path = Service.config.path + rota.path;
        }
    }

    static inicializarRota(rota: Route, service: ModuleManegerService) {
        const args: any[] = [];
        if (rota.middleWares) {
            args.push(rota.middleWares);
        }
        const rotaValida = ModuleManager.validarRota(rota, service);
        // Logger.warn('')
        if (rotaValida) {
            args.push((request: Request, response: Response, next: NextFunction) => {
                rota.action(request, response, next)
                    .catch((err: any) => {next(err)});
            });
            ModuleManager.app[rota.method](rota.path, ...args);

            const registroRota: ModuleManagerRoute = { ...rota, service };
            ModuleManager.routes.push(registroRota);
        }
    }
    static validarRota(rota: Route, Service: ModuleManegerService) {
        const ServiceConstructor = Service.constructor;

        const jaCadastrada = ModuleManager.getRotaJaCadastradara(rota);
        if (jaCadastrada) {
            console.warn(`O a rota "${rota.method.toLocaleUpperCase()} ${rota.path}" do service "${ServiceConstructor.name} "tentou ser cadastrada várias vezes: "${jaCadastrada.service.constructor.name} - ${jaCadastrada.service.constructor.name} - ${rota.method.toLocaleUpperCase()} ${rota.path}`);
            return false;
        }
        return true;
    }
    static getRotaJaCadastradara(item: Route): ModuleManagerRoute | null {
        for (let i = 0; i < ModuleManager.routes.length; i++) {
            const rota = ModuleManager.routes[i];
            if (item.path === rota.path && item.method === rota.method) {
                return rota;
            }
        }
        return null
    }
}