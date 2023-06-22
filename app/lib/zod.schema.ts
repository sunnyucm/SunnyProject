import {z} from 'zod'

const name = z.string().min(1, 'Name is required')
const email = z.string().email('Invalid email')
const password = z.string().min(8, 'Password must be at least 8 characters')

export const LoginSchema = z.object({
	email,
	password,
	remember: z.enum(['on']).optional(),
	redirectTo: z.string().default('/'),
})

export const RegisterUserSchema = z
	.object({
		name,
		email,
		password,
		confirmPassword: password,
	})
	.refine(data => data.password === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['password', 'confirmPassword'],
	})

export const ManageProductSchema = z.object({
	productId: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	description: z.string().min(1, 'Description is required'),
	price: z.preprocess(
		Number,
		z.number().min(0, 'Price must be greater than 0')
	),
	category: z.string().min(1, 'Category is required'),
	quantity: z.preprocess(
		Number,
		z.number().min(0, 'Quantity must be greater than 0')
	),
	maintenance: z.preprocess(
		Number,
		z.number().gte(0, 'Maintenance must be greater than or equal to 0')
	),
	guarantee: z.preprocess(
		Number,
		z.number().gte(0, 'Guarantee must be greater than or equal to 0')
	),
	image: z.string().url('Invalid URL'),
})
