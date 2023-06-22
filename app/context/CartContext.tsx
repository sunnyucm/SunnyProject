import type {Product} from '@prisma/client'
import * as React from 'react'
import {useLocalStorageState} from '~/utils/hooks'
import type {DateToString} from '~/utils/types'

const LocalStorageKey = 'electronics-item-cart'

export type CartItem = DateToString<Product> & {
	basePrice: number
}

interface ICartContext {
	itemsInCart: Array<CartItem>
	addItemToCart: (item: CartItem) => void
	removeItemFromCart: (itemId: CartItem['id']) => void
	clearCart: () => void
	totalPrice: number
}

const CartContext = React.createContext<ICartContext | undefined>(undefined)

export function CartProvider({children}: {children: React.ReactNode}) {
	const [items, setItems] = useLocalStorageState<CartItem[]>({
		key: LocalStorageKey,
		defaultValue: [],
	})

	const totalPrice = items.reduce(
		(acc, item) => acc + item.basePrice * item.quantity,
		0
	)

	const clearCart = React.useCallback(() => {
		setItems([])
	}, [setItems])

	const addItemToCart = React.useCallback(
		(item: CartItem) => {
			const isAlreadyInCart = items.some(cartItem => cartItem.id === item.id)

			console.log({isAlreadyInCart, item})

			if (!isAlreadyInCart) {
				return setItems(prev => [...prev, {...item}])
			}

			setItems(prevItems => {
				const newItems = [...prevItems]

				const index = newItems.findIndex(i => i.id === item.id)
				if (index > -1) {
					newItems[index].quantity = newItems[index].quantity + item.quantity
				}

				return newItems
			})
		},
		[items, setItems]
	)

	const removeItemFromCart = (itemId: Product['id']) => {
		setItems(prev => prev.filter(item => item.id !== itemId))
	}

	return (
		<CartContext.Provider
			value={{
				itemsInCart: items,
				totalPrice,
				addItemToCart,
				removeItemFromCart,
				clearCart,
			}}
		>
			{children}
		</CartContext.Provider>
	)
}

export function useCart() {
	const context = React.useContext(CartContext)
	if (!context) {
		throw new Error('`useCart()` must be used within a <CartProvider />')
	}

	return context
}
