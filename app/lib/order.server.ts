import type {
  Order,
  OrderType,
  Payment,
  PaymentMethod,
  Product,
  ProductOrder,
  User,
} from "@prisma/client";
import { OrderStatus } from "@prisma/client";
import cuid from "cuid";
import type { CartItem } from "~/context/CartContext";
import { db } from "../db.server";

export function getOrders(userId: User["id"]) {
  return db.order.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
  });
}

export function createOrder({
  userId,
  products,
  amount,
  orderType,
  paymentMethod,
}: {
  userId: User["id"];
  products: Array<CartItem>;
  amount: Payment["amount"];
  paymentMethod: PaymentMethod;
  orderType: OrderType;
}) {
  return db.$transaction(async (tx) => {
    const order = await tx.order.create({
      data: {
        userId,
        type: orderType,
        status: OrderStatus.IN_TRANSIT,
        payment: {
          create: {
            paymentMethod,
            amount,
            user: {
              connect: {
                id: userId,
              },
            },
          },
        },
      },
    });

    let productsWithSerialNumber: Array<{
      productId: Product["id"];
      orderId: Order["id"];
      quantity: number;
      serialNo: ProductOrder["serialNo"];
      amount: Product["price"];
    }> = [];
    products.forEach((p) => {
      for (let i = 0; i < p.quantity; i++) {
        productsWithSerialNumber.push({
          productId: p.id,
          orderId: order.id,
          quantity: 1,
          serialNo: cuid(),
          amount: p.basePrice,
        });
      }
    });

    await tx.productOrder.createMany({
      data: productsWithSerialNumber,
    });

    await Promise.all(
      products.map(async (p) => {
        const product = await tx.product.update({
          where: {
            id: p.id,
          },
          data: {
            quantity: {
              decrement: p.quantity,
            },
          },
        });

        if (product.quantity < 0) {
          throw new Error(`Product ${product.name} has insufficient quantity`);
        }
      })
    );

    return order;
  });
}

export async function cancelOrder(orderId: Order["id"]) {
  const order = await db.order.findUnique({
    where: {
      id: orderId,
    },
    include: {
      products: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  await db.order.update({
    where: {
      id: orderId,
    },
    data: {
      status: OrderStatus.CANCELLED,
    },
  });

  const products = order.products.map((p) => ({
    id: p.product.id,
    quantity: p.quantity,
    baseQuantity: p.product.quantity,
  }));

  await Promise.all(
    products.map((p) =>
      db.product.update({
        where: {
          id: p.id,
        },
        data: {
          quantity: {
            increment: p.quantity,
          },
        },
      })
    )
  );
}
