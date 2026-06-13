import { NextResponse } from 'next/server';
import { createOrder } from '@/lib/wordpress';

export async function POST(request: Request) {
  try {
    const orderData = await request.json();
    const order = await createOrder(orderData);
    return NextResponse.json(order);
  } catch (error: any) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
