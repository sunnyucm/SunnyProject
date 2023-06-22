import {PlusIcon} from '@heroicons/react/24/solid'
import {
	Button,
	clsx,
	Modal,
	NumberInput,
	Select,
	Textarea,
	TextInput,
} from '@mantine/core'
import {useDisclosure} from '@mantine/hooks'
import type {Product} from '@prisma/client'
import type {ActionFunction, LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {useFetcher, useLoaderData} from '@remix-run/react'
import {ObjectId} from 'bson'
import * as React from 'react'
import slugify from 'slugify'
import {TailwindContainer} from '~/components/TailwindContainer'
import {db} from '~/db.server'
import {getAllProducts} from '~/lib/product.server'
import {ManageProductSchema} from '~/lib/zod.schema'
import {requireUser} from '~/session.server'
import {badRequest} from '~/utils/misc.server'
import type {inferErrors} from '~/utils/validation'
import {validateAction} from '~/utils/validation'

enum MODE {
	edit,
	add,
}

export const loader = async ({request}: LoaderArgs) => {
	await requireUser(request)

	const products = await getAllProducts()

	return json({
		products,
	})
}

interface ActionData {
	success: boolean
	fieldErrors?: inferErrors<typeof ManageProductSchema>
}

export const action: ActionFunction = async ({request}) => {
	const {fields, fieldErrors} = await validateAction(
		request,
		ManageProductSchema
	)

	if (fieldErrors) {
		return badRequest<ActionData>({success: false, fieldErrors})
	}

	const {productId, ...rest} = fields
	const id = new ObjectId()

	await db.product.upsert({
		where: {
			id: productId || id.toString(),
		},
		update: {
			...rest,
			slug: slugify(rest.name, {lower: true, strict: true}),
		},
		create: {
			...rest,
			slug: slugify(rest.name, {lower: true, strict: true}),
		},
	})

	return json({
		success: true,
	})
}

export default function ManageProduct() {
	const fetcher = useFetcher<ActionData>()
	const {products} = useLoaderData<typeof loader>()

	const [productToUpdate, setProductToUpdate] = React.useState<Product | null>(
		null
	)
	const [mode, setMode] = React.useState<MODE>(MODE.edit)
	const [isModalOpen, {open: openModal, close: closeModal}] =
		useDisclosure(false)

	const isSubmitting = fetcher.state !== 'idle'

	React.useEffect(() => {
		if (fetcher.state === 'idle') {
			return
		}

		if (fetcher.data?.success) {
			setProductToUpdate(null)
			closeModal()
		}
	}, [closeModal, fetcher.data?.success, fetcher.state])

	return (
		<>
			<TailwindContainer className="rounded-md bg-white">
				<div className="mt-8 px-4 py-10 sm:px-6 lg:px-8">
					<div className="sm:flex sm:flex-auto sm:items-center sm:justify-between">
						<div>
							<h1 className="text-xl font-semibold text-gray-900">
								Manage Product
							</h1>
							<p className="mt-2 text-sm text-gray-700">
								A list of all the products currently present in store.
							</p>
						</div>
						<div>
							<Button
								loading={isSubmitting}
								loaderPosition="left"
								onClick={() => {
									setMode(MODE.add)
									openModal()
								}}
							>
								<PlusIcon className="h-4 w-4" />
								<span className="ml-2">Add product</span>
							</Button>
						</div>
					</div>
					<div className="mt-8 flex flex-col">
						<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
								<table className="min-w-full divide-y divide-gray-300">
									<thead>
										<tr>
											<th
												scope="col"
												className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 md:pl-0"
											>
												Name
											</th>
											<th
												scope="col"
												className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
											>
												Price
											</th>
											<th
												scope="col"
												className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
											>
												Quantity
											</th>
											<th
												scope="col"
												className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
											>
												Maintenance (year)
											</th>
											<th
												scope="col"
												className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
											>
												Guarantee (year)
											</th>
											<th
												scope="col"
												className="hidden py-3.5 px-3 text-left text-sm font-semibold text-gray-900 sm:table-cell"
											>
												Category
											</th>
											<th
												scope="col"
												className="relative py-3.5 pl-3 pr-4 sm:pr-6 md:pr-0"
											>
												<span className="sr-only">Actions</span>
											</th>
										</tr>
									</thead>
									<tbody className="divide-y divide-gray-200">
										{products.map(product => (
											<tr key={product.id}>
												<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6 md:pl-0">
													{product.name}
												</td>
												<td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
													${product.price.toFixed(2)}
												</td>
												<td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
													{product.quantity}
												</td>
												<td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
													{product.maintenance === 1
														? '1 year'
														: `${product.maintenance} years`}
												</td>
												<td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
													{product.guarantee === 1
														? '1 year'
														: `${product.guarantee} years`}
												</td>
												<td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
													{product.category}
												</td>
												<td className="relative space-x-4 whitespace-nowrap py-4 pl-3 pr-4 text-left text-sm font-medium sm:pr-6 md:pr-0">
													<div className="flex items-center gap-6">
														<Button
															loading={isSubmitting}
															variant="subtle"
															loaderPosition="right"
															onClick={() => {
																setProductToUpdate(product)
																setMode(MODE.edit)
																openModal()
															}}
														>
															Edit
														</Button>
													</div>
												</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</TailwindContainer>

			<Modal
				opened={isModalOpen}
				onClose={() => {
					setProductToUpdate(null)
					closeModal()
				}}
				title={clsx({
					'Edit product': mode === MODE.edit,
					'Add product': mode === MODE.add,
				})}
			>
				<fetcher.Form method="post" replace>
					<fieldset disabled={isSubmitting} className="flex flex-col gap-4">
						<input type="hidden" name="productId" value={productToUpdate?.id} />

						<TextInput
							name="name"
							label="Name"
							defaultValue={productToUpdate?.name}
							error={fetcher.data?.fieldErrors?.name}
							required
						/>

						<Textarea
							name="description"
							label="Description"
							defaultValue={productToUpdate?.description}
							error={fetcher.data?.fieldErrors?.description}
							required
						/>

						<NumberInput
							name="price"
							label="Price"
							defaultValue={productToUpdate?.price}
							error={fetcher.data?.fieldErrors?.price}
							required
						/>

						<NumberInput
							name="quantity"
							label="Quantity"
							defaultValue={productToUpdate?.quantity}
							error={fetcher.data?.fieldErrors?.quantity}
							min={productToUpdate?.quantity}
							required
						/>

						<div className="grid grid-cols-2 gap-4">
							<NumberInput
								name="maintenance"
								label="Maintenance"
								defaultValue={productToUpdate?.maintenance}
								error={fetcher.data?.fieldErrors?.maintenance}
								min={0}
								required
							/>

							<NumberInput
								name="guarantee"
								label="Guarantee"
								defaultValue={productToUpdate?.guarantee}
								error={fetcher.data?.fieldErrors?.guarantee}
								min={0}
								required
							/>
						</div>

						<TextInput
							name="image"
							label="Image"
							defaultValue={productToUpdate?.image}
							error={fetcher.data?.fieldErrors?.image}
							required
						/>

						<Select
							name="category"
							label="Category"
							required
							data={[
								'Smartphone',
								'Tablet',
								'Headphone',
								'Watch',
								'Camera',
								'Laptop',
								'Accessory',
							]}
							defaultValue={productToUpdate?.category}
							placeholder="Select categories"
							searchable
							error={fetcher.data?.fieldErrors?.category}
						/>

						<div className="mt-1 flex items-center justify-end gap-4">
							<Button
								variant="subtle"
								disabled={isSubmitting}
								onClick={() => {
									setProductToUpdate(null)
									closeModal()
								}}
								color="red"
							>
								Cancel
							</Button>
							<Button
								type="submit"
								loading={isSubmitting}
								loaderPosition="right"
							>
								{mode === MODE.edit ? 'Save changes' : 'Add product'}
							</Button>
						</div>
					</fieldset>
				</fetcher.Form>
			</Modal>
		</>
	)
}
