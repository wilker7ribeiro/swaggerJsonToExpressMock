import { Order } from '../entidade/Order';
import { Request, Response, NextFunction } from 'express';
import { ServiceApi } from '../lib/ServiceApiAnnotation';
import { RequestMapping } from '../lib/RequestMappingAnnotation';


@ServiceApi()
export class StoreService {

	@RequestMapping({method: "get", path:"/store/inventory"})
	async getInventory(req: Request, res: Response, next: NextFunction) {
		var any: any = null
		res.json(any)

	};

	@RequestMapping({method: "post", path:"/store/order"})
	async placeOrder(req: Request, res: Response, next: NextFunction) {
		var order: Order = {
  "id": 10,
  "petId": 10,
  "quantity": 10,
  "shipDate": "2018-06-05T19:23:49.812Z",
  "status": "String",
  "complete": false
}
		res.json(order)

	};

	@RequestMapping({method: "get", path:"/store/order/:orderId(\\d+)"})
	async getOrderById(req: Request, res: Response, next: NextFunction) {
		var order: Order = {
  "id": 10,
  "petId": 10,
  "quantity": 10,
  "shipDate": "2018-06-05T19:23:49.812Z",
  "status": "String",
  "complete": false
}
		res.json(order)

	};

	@RequestMapping({method: "delete", path:"/store/order/:orderId(\\d+)"})
	async deleteOrder(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

}