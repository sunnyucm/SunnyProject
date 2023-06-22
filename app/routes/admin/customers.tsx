import {Role} from '@prisma/client'
import type {LoaderArgs} from '@remix-run/node'
import {json} from '@remix-run/node'
import {useLoaderData} from '@remix-run/react'
import {TailwindContainer} from '~/components/TailwindContainer'
import {db} from '~/db.server'
import {requireUser} from '~/session.server'

export const loader = async ({request}: LoaderArgs) => {
	requireUser(request)

	const allCustomers = await db.user.findMany({
		where: {
			role: Role.CUSTOMER,
		},
	})

	return json({
		customers: allCustomers,
	})
}

export default function ManageStaff() {
	const {customers} = useLoaderData<typeof loader>()

	return (
		<>
			<TailwindContainer className="mt-16">
				<div className="px-4 sm:px-6 lg:px-8">
					<div className="sm:flex sm:items-center">
						<div className="sm:flex-auto">
							<h1 className="text-xl font-semibold text-gray-900">Customers</h1>
							<p className="mt-2 text-sm text-gray-700">
								A list of all the customers including their name and email
								address.
							</p>
						</div>
					</div>
					<div className="mt-8 flex flex-col">
						<div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
							<div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
								<div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
									<table className="min-w-full divide-y divide-gray-300">
										<thead className="bg-gray-50">
											<tr>
												<th
													scope="col"
													className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6"
												>
													Name
												</th>
												<th
													scope="col"
													className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
												>
													Email
												</th>
											</tr>
										</thead>
										<tbody className="divide-y divide-gray-200 bg-white">
											{customers.map(member => (
												<tr key={member.email}>
													<td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
														{member.name}
													</td>
													<td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
														{member.email}
													</td>
												</tr>
											))}
										</tbody>
									</table>
								</div>
							</div>
						</div>
					</div>
				</div>
			</TailwindContainer>
		</>
	)
}
