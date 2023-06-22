import {db} from '../db.server'

export function getAllProducts() {
	return db.product.findMany({})
}
