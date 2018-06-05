import { Pet } from '../entidade/Pet';
import { ApiResponse } from '../entidade/ApiResponse';
import { Request, Response, NextFunction } from 'express';
import { ServiceApi } from '../lib/ServiceApiAnnotation';
import { RequestMapping } from '../lib/RequestMappingAnnotation';


@ServiceApi()
export class PetService {

	@RequestMapping({method: "post", path:"/pet"})
	async addPet(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "put", path:"/pet"})
	async updatePet(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "get", path:"/pet/findByStatus"})
	async findPetsByStatus(req: Request, res: Response, next: NextFunction) {
		var petList: Pet[] = [
  {
    "id": 10,
    "category": {
      "id": 10,
      "name": "String"
    },
    "name": "String",
    "photoUrls": [
      "String"
    ],
    "tags": [
      {
        "id": 10,
        "name": "String"
      }
    ],
    "status": "String"
  }
]
		res.json(petList)

	};

	@RequestMapping({method: "get", path:"/pet/findByTags"})
	async findPetsByTags(req: Request, res: Response, next: NextFunction) {
		var petList: Pet[] = [
  {
    "id": 10,
    "category": {
      "id": 10,
      "name": "String"
    },
    "name": "String",
    "photoUrls": [
      "String"
    ],
    "tags": [
      {
        "id": 10,
        "name": "String"
      }
    ],
    "status": "String"
  }
]
		res.json(petList)

	};

	@RequestMapping({method: "get", path:"/pet/:petId(\\d+)"})
	async getPetById(req: Request, res: Response, next: NextFunction) {
		var pet: Pet = {
  "id": 10,
  "category": {
    "id": 10,
    "name": "String"
  },
  "name": "String",
  "photoUrls": [
    "String"
  ],
  "tags": [
    {
      "id": 10,
      "name": "String"
    }
  ],
  "status": "String"
}
		res.json(pet)

	};

	@RequestMapping({method: "post", path:"/pet/:petId(\\d+)"})
	async updatePetWithForm(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "delete", path:"/pet/:petId(\\d+)"})
	async deletePet(req: Request, res: Response, next: NextFunction) {
		res.sendStatus(200)
	};

	@RequestMapping({method: "post", path:"/pet/:petId(\\d+)/uploadImage"})
	async uploadFile(req: Request, res: Response, next: NextFunction) {
		var apiResponse: ApiResponse = {
  "code": 10,
  "type": "String",
  "message": "String"
}
		res.json(apiResponse)

	};

}