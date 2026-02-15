import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface OrderItem {
    id: bigint;
    name: string;
    isAvailable: boolean;
    productId: bigint;
    imageUrl?: string;
    vendor?: Principal;
    quantity: bigint;
    price: bigint;
}
export interface OrderConfirmation {
    status: OrderStatus;
    paymentMethod: string;
    customer: Principal;
    createdAt: Time;
    orderId: bigint;
    message: string;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export interface Order {
    id: bigint;
    status: OrderStatus;
    paymentMethod?: string;
    confirmationText?: string;
    customer: Principal;
    createdAt: Time;
    totalAmount: bigint;
    items: Array<OrderItem>;
}
export interface UserProfile {
    name: string;
}
export interface Product {
    id: bigint;
    name: string;
    createdAt: Time;
    isAvailable: boolean;
    description?: string;
    unitLabel?: string;
    updatedAt: Time;
    imageUrl?: string;
    vendor?: Principal;
    price: bigint;
}
export enum ExtendedRole {
    admin = "admin",
    customer = "customer",
    guest = "guest",
    vendor = "vendor"
}
export enum OrderStatus {
    shipped = "shipped",
    cancelled = "cancelled",
    pending = "pending",
    delivered = "delivered",
    confirmed = "confirmed"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkout(cartItems: Array<[bigint, bigint]>, paymentMethod: string): Promise<OrderConfirmation>;
    createProduct(name: string, description: string | null, price: bigint, unitLabel: string | null, imageUrl: string | null): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrdersForCustomer(customerPrincipal: Principal): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerRole(): Promise<ExtendedRole>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductsForVendor(vendor: Principal): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleAvailability(id: bigint): Promise<void>;
}
