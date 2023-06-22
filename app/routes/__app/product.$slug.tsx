import {Button, NumberInput} from '@mantine/core'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import * as React from 'react'
import {useCart} from '~/context/CartContext'
import {useProduct} from '~/utils/hooks'

export const loader = async ({params}: LoaderArgs) => {
	const {slug} = params

	if (!slug) {
		throw new Response('No slug provided', {status: 404})
	}

	return json({slug})
}

export default function Item() {
	const {slug} = useLoaderData<typeof loader>()
	const product = useProduct(slug)
	const {addItemToCart} = useCart()

	const [quantity, setQuantity] = React.useState(1)

	// This scenario is unlikely
	// as the slug is checked in the loader
	if (!product) {
		return null
	}

	const totalPrice = product.price * quantity
	const isOutOfStock = product.quantity === 0

	return (
		<>
			<div className="flex flex-col gap-4 p-4">
				<div className="bg-white">
					<div className="mx-auto max-w-2xl py-16 px-4 sm:py-24 sm:px-6 lg:grid lg:max-w-7xl lg:grid-cols-2 lg:gap-x-12 lg:px-8">
						{/* Cuisine image */}
						<div className="sm:mt-10 lg:row-span-2 lg:mt-0 lg:self-center">
							<div className="overflow-hidden rounded-lg shadow">
								<img
									src={product.image}
									alt={product.name}
									className="aspect-square w-full object-cover"
								/>
							</div>
						</div>

						{/* Cuisine details */}
						<div className="lg:col-start-2 lg:max-w-lg lg:self-end">
							<div className="mt-4">
								<h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
									{product.name}
								</h1>
							</div>

							<section aria-labelledby="information-heading" className="mt-4">
								<h2 id="information-heading" className="sr-only">
									Cuisine information
								</h2>

								<p className="text-lg text-gray-900 sm:text-xl">
									${totalPrice}
								</p>

								<div className="mt-4 space-y-6">
									<p className="text-base text-gray-500">
										{product.description}
									</p>
								</div>

								<p className="mt-4 text-base ">
									<span className="text-gray-900">Maintenance:</span>{' '}
									<span className="text-gray-500">
										{product.maintenance === 1
											? '1 year'
											: `${product.maintenance} years`}
									</span>
								</p>

								<p className="text-base">
									<span className="text-gray-900">Guarantee:</span>{' '}
									<span className="text-gray-500">
										{product.guarantee === 1
											? '1 year'
											: `${product.guarantee} years`}
									</span>
								</p>

								{!isOutOfStock ? (
									<NumberInput
										mt={12}
										required
										label="Quantity"
										value={quantity}
										parser={value => value?.replace(/\$\s?|(,*)/g, '')}
										formatter={value => {
											if (!value) {
												return '1'
											}

											return value
										}}
										onChange={val => setQuantity(Number(val))}
										max={product.quantity}
										min={1}
										defaultValue={1}
									/>
								) : null}
							</section>
						</div>

						{/* Add to cart button */}
						<div className="mt-10 lg:col-start-2 lg:row-start-2 lg:max-w-lg lg:self-start">
							<Button
								fullWidth
								mt="2.5rem"
								disabled={isOutOfStock}
								onClick={() =>
									addItemToCart({
										...product,
										quantity,
										basePrice: product.price,
									})
								}
							>
								{isOutOfStock ? 'Out of stock' : 'Add to cart'}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}
