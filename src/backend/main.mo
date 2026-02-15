import Time "mo:core/Time";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";



actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type Product = {
    id : Nat;
    name : Text;
    description : ?Text;
    price : Nat;
    unitLabel : ?Text;
    imageUrl : ?Text;
    isAvailable : Bool;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    vendor : ?Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  // Extended role type for frontend consumption
  public type ExtendedRole = {
    #admin;
    #vendor;
    #customer;
    #guest;
  };

  let products = Map.empty<Nat, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let vendorProducts = Map.empty<Principal, Set.Set<Nat>>();
  var nextProductId = 1;

  // Role determination API for frontend
  public query ({ caller }) func getCallerRole() : async ExtendedRole {
    let baseRole = AccessControl.getUserRole(accessControlState, caller);
    switch (baseRole) {
      case (#admin) { #admin };
      case (#user) {
        // Users who have created products are vendors, others are customers
        switch (vendorProducts.get(caller)) {
          case (null) { #customer };
          case (?productSet) {
            if (productSet.size() > 0) {
              #vendor;
            } else {
              #customer;
            };
          };
        };
      };
      case (#guest) { #guest };
    };
  };

  // User profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Product catalog management functions
  public shared ({ caller }) func createProduct(
    name : Text,
    description : ?Text,
    price : Nat,
    unitLabel : ?Text,
    imageUrl : ?Text
  ) : async Nat {
    // Only authenticated users (not guests) can create products
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can create products");
    };

    let productId = nextProductId;
    let timestamp = Time.now();

    let newProduct : Product = {
      id = productId;
      name;
      description;
      price;
      unitLabel;
      imageUrl;
      isAvailable = true;
      createdAt = timestamp;
      updatedAt = timestamp;
      vendor = ?caller;
    };

    products.add(productId, newProduct);

    switch (vendorProducts.get(caller)) {
      case (null) {
        let newSet = Set.singleton<Nat>(productId);
        vendorProducts.add(caller, newSet);
      };
      case (?existingSet) {
        existingSet.add(productId);
      };
    };

    nextProductId += 1;
    productId;
  };

  public shared ({ caller }) func deleteProduct(id : Nat) : async () {
    // Only authenticated users can delete products
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };

    switch (products.get(id)) {
      case (?product) {
        switch (product.vendor) {
          case (null) {
            // Products without vendor can only be deleted by admins
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only admins can delete this product");
            };
          };
          case (?vendorPrincipal) {
            // Vendors can only delete their own products, admins can delete any
            if (vendorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only delete your own products");
            };
          };
        };
        products.remove(id);

        // Clean up vendor products mapping
        switch (product.vendor) {
          case (?vendorPrincipal) {
            switch (vendorProducts.get(vendorPrincipal)) {
              case (?productSet) {
                productSet.remove(id);
              };
              case (null) {};
            };
          };
          case (null) {};
        };
      };
      case (null) {
        Runtime.trap("Product does not exist");
      };
    };
  };

  public shared ({ caller }) func toggleAvailability(id : Nat) : async () {
    // Only authenticated users can toggle availability
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle product availability");
    };

    switch (products.get(id)) {
      case (?product) {
        switch (product.vendor) {
          case (null) {
            // Products without vendor can only be modified by admins
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only admins can modify this product");
            };
          };
          case (?vendorPrincipal) {
            // Vendors can only modify their own products, admins can modify any
            if (vendorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only toggle availability for your own products");
            };
          };
        };
        let updatedProduct = {
          product with
          isAvailable = not product.isAvailable;
          updatedAt = Time.now();
        };
        products.add(id, updatedProduct);
      };
      case (null) {
        Runtime.trap("Product does not exist");
      };
    };
  };

  public query ({ caller }) func getProduct(id : Nat) : async ?Product {
    // Anyone (including guests) can view products
    products.get(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    // Anyone (including guests) can view all products
    products.values().toArray();
  };

  public query ({ caller }) func getProductsForVendor(vendor : Principal) : async [Product] {
    // Anyone (including guests) can view products by vendor
    switch (vendorProducts.get(vendor)) {
      case (null) { [] };
      case (?productIds) {
        productIds.toArray().map(
          func(productId) {
            products.get(productId);
          }
        ).filter(
          func(maybeProduct) {
            switch (maybeProduct) {
              case (null) { false };
              case (?_product) { true };
            };
          }
        ).map(
          func(maybeProduct) {
            switch (maybeProduct) {
              case (null) { Runtime.trap("Unexpected null product") };
              case (?product) { product };
            };
          }
        );
      };
    };
  };
};
