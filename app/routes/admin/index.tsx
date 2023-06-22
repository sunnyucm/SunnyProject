import {
	ClockIcon,
	RectangleGroupIcon,
	UsersIcon,
} from '@heroicons/react/24/solid'
import {Link} from '@remix-run/react'
import {TailwindContainer} from '~/components/TailwindContainer'

const actions = [
	{
		title: 'Manage customers',
		description: 'Manage customers',
		href: 'customers',
		icon: UsersIcon,
	},
	{
		title: 'Orders',
		description: 'View and manage orders',
		href: 'orders',
		icon: ClockIcon,
	},
	{
		title: 'Products',
		description: 'View and manage products',
		href: 'products',
		icon: RectangleGroupIcon,
	},
]

export default function AdminDashboard() {
	return (
		<div className="flex flex-col gap-4 p-4">
			<div className="bg-white">
				<TailwindContainer>
					<div className="py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
						<h2 className="text-2xl font-extrabold tracking-tight text-gray-900">
							Admin Dashboard
						</h2>

						<div className="mt-8">
							<ul className="mt-3 flex flex-col gap-4">
								{actions.map((action, actionIdx) => (
									<Link to={action.href} key={actionIdx}>
										<li className="relative col-span-1 flex min-h-[50px] rounded-md shadow-sm">
											<div className="flex flex-1 items-center justify-between truncate rounded-r-md border-t border-r border-b border-gray-200 bg-white">
												<div className="flex-1 truncate px-4 py-2 text-sm">
													<span className="font-medium text-gray-900 hover:text-gray-600">
														{action.title}
													</span>
												</div>
											</div>
										</li>
									</Link>
								))}
							</ul>
						</div>
					</div>
				</TailwindContainer>
			</div>
		</div>
	)
}
