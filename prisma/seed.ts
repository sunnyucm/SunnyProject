import {PrismaClient, Role} from '@prisma/client'
import slugify from 'slugify'
import {createPasswordHash} from '~/utils/misc.server'
import {seedProducts} from './data'

const db = new PrismaClient()

async function seed() {
	await db.user.deleteMany()
	await db.product.deleteMany()
	await db.productOrder.deleteMany()

	await db.user.create({
		data: {
			name: 'John Doe',
			email: 'user@app.com',
			password: await createPasswordHash('password'),
			role: Role.CUSTOMER,
		},
	})

	await db.user.create({
		data: {
			name: 'Admin',
			email: 'admin@app.com',
			password: await createPasswordHash('password'),
			role: Role.ADMIN,
		},
	})

	await db.product.createMany({
		data: seedProducts.map(product => ({
			...product,
			slug: slugify(product.name, {lower: true}),
			category: product.category[0],
		})),
	})

	console.log(`Database has been seeded. 🌱`)
}

seed()
	.catch(e => {
		console.error(e)
		process.exit(1)
	})
	.finally(async () => {
		await db.$disconnect()
	})
