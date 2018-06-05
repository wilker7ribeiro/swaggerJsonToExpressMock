import { User } from '../entidade/User';
import { Request, Response, NextFunction } from 'express';
import { ServiceApi } from '../lib/ServiceApiAnnotation';
import { RequestMapping } from '../lib/RequestMappingAnnotation';


@ServiceApi()
export class UserService {

	@RequestMapping({method: "post", path:"/user"})
	async createUser(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "post", path:"/user/createWithArray"})
	async createUsersWithArrayInput(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "post", path:"/user/createWithList"})
	async createUsersWithListInput(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "get", path:"/user/login"})
	async loginUser(req: Request, res: Response, next: NextFunction) {
		var string: string = "String"
		res.json(string)

	};

	@RequestMapping({method: "get", path:"/user/logout"})
	async logoutUser(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "get", path:"/user/:username"})
	async getUserByName(req: Request, res: Response, next: NextFunction) {
		var user: User = {
  "id": 10,
  "username": "String",
  "firstName": "String",
  "lastName": "String",
  "email": "String",
  "password": "String",
  "phone": "String",
  "userStatus": 10
}
		res.json(user)

	};

	@RequestMapping({method: "put", path:"/user/:username"})
	async updateUser(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "delete", path:"/user/:username"})
	async deleteUser(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

}