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
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, description: string | null, price: bigint, unitLabel: string | null, imageUrl: string | null): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getCallerRole(): Promise<ExtendedRole>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductsForVendor(vendor: Principal): Promise<Array<Product>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    toggleAvailability(id: bigint): Promise<void>;
}
