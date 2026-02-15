import Time "mo:core/Time";
import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Set "mo:core/Set";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import Nat "mo:core/Nat";

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

  public type OrderStatus = {
    #pending;
    #confirmed;
    #shipped;
    #delivered;
    #cancelled;
  };

  public type OrderItem = {
    id : Nat;
    productId : Nat;
    name : Text;
    price : Nat;
    quantity : Nat;
    imageUrl : ?Text;
    isAvailable : Bool;
    vendor : ?Principal;
  };

  public type ExtendedRole = {
    #admin;
    #vendor;
    #customer;
    #guest;
  };

  public type Order = {
    id : Nat;
    customer : Principal;
    items : [OrderItem];
    totalAmount : Nat;
    createdAt : Time.Time;
    paymentMethod : ?Text;
    status : OrderStatus;
    confirmationText : ?Text;
  };

  public type OrderConfirmation = {
    orderId : Nat;
    message : Text;
    items : [OrderItem];
    totalAmount : Nat;
    createdAt : Time.Time;
    paymentMethod : Text;
    customer : Principal;
    status : OrderStatus;
  };

  let products = Map.empty<Nat, Product>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let vendorProducts = Map.empty<Principal, Set.Set<Nat>>();
  let orders = Map.empty<Nat, Order>();
  var nextProductId = 1;
  var nextOrderId = 1;

  public query ({ caller }) func getCallerRole() : async ExtendedRole {
    let baseRole = AccessControl.getUserRole(accessControlState, caller);
    switch (baseRole) {
      case (#admin) { #admin };
      case (#user) {
        switch (vendorProducts.get(caller)) {
          case (null) { #customer };
          case (?productSet) {
            if (productSet.size() > 0) { #vendor } else { #customer };
          };
        };
      };
      case (#guest) { #guest };
    };
  };

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

  public shared ({ caller }) func createProduct(
    name : Text,
    description : ?Text,
    price : Nat,
    unitLabel : ?Text,
    imageUrl : ?Text
  ) : async Nat {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can delete products");
    };

    switch (products.get(id)) {
      case (?product) {
        switch (product.vendor) {
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only admins can delete this product");
            };
          };
          case (?vendorPrincipal) {
            if (vendorPrincipal != caller and not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: You can only delete your own products");
            };
          };
        };
        products.remove(id);

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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can toggle product availability");
    };

    switch (products.get(id)) {
      case (?product) {
        switch (product.vendor) {
          case (null) {
            if (not AccessControl.isAdmin(accessControlState, caller)) {
              Runtime.trap("Unauthorized: Only admins can modify this product");
            };
          };
          case (?vendorPrincipal) {
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
    products.get(id);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  public query ({ caller }) func getProductsForVendor(vendor : Principal) : async [Product] {
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

  public shared ({ caller }) func checkout(cartItems : [(Nat, Nat)], paymentMethod : Text) : async OrderConfirmation {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can place orders");
    };

    if (cartItems.size() == 0) {
      Runtime.trap("Cart is empty. Add items to your cart before checkout.");
    };

    let orderItems = List.empty<OrderItem>();
    var totalAmount = 0;

    for ((productId, quantity) in cartItems.values()) {
      switch (products.get(productId)) {
        case (?product) {
          if (not product.isAvailable) {
            Runtime.trap("Product " # product.name # " is not available. Please remove unavailable items from your cart.");
          };

          let item : OrderItem = {
            id = productId;
            productId;
            name = product.name;
            price = product.price;
            quantity;
            imageUrl = product.imageUrl;
            isAvailable = product.isAvailable;
            vendor = product.vendor;
          };

          orderItems.add(item);
          totalAmount += product.price * quantity;
        };
        case (null) {
          Runtime.trap("Product with ID " # productId.toText() # " not found. Please remove unavailable items from your cart.");
        };
      };
    };

    let orderId = nextOrderId;
    let order : Order = {
      id = orderId;
      customer = caller;
      items = orderItems.toArray();
      totalAmount;
      createdAt = Time.now();
      paymentMethod = ?paymentMethod;
      status = #pending;
      confirmationText = ?("Order successfully placed for " # totalAmount.toText() # "€ 💶");
    };

    orders.add(orderId, order);
    nextOrderId += 1;

    {
      orderId;
      message = "Your order (ID: " # orderId.toText() # ") has been placed. Please complete the payment process. 💶";
      items = orderItems.toArray();
      totalAmount;
      createdAt = order.createdAt;
      paymentMethod;
      customer = caller;
      status = #pending;
    };
  };

  func isVendorOfOrder(caller : Principal, order : Order) : Bool {
    for (item in order.items.values()) {
      switch (item.vendor) {
        case (?vendorPrincipal) {
          if (vendorPrincipal == caller) {
            return true;
          };
        };
        case (null) {};
      };
    };
    false;
  };

  public query ({ caller }) func getOrderById(orderId : Nat) : async ?Order {
    switch (orders.get(orderId)) {
      case (?order) {
        if (caller == order.customer or AccessControl.isAdmin(accessControlState, caller) or isVendorOfOrder(caller, order)) {
          ?order;
        } else {
          Runtime.trap("Unauthorized: You can only view your own orders, orders you are a vendor for, or be an admin");
        };
      };
      case (null) { null };
    };
  };

  public query ({ caller }) func getAllOrdersForCustomer(customerPrincipal : Principal) : async [Order] {
    if (caller != customerPrincipal and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: You can only view your own orders");
    };

    orders.values().toArray().filter(
      func(o) { o.customer == customerPrincipal }
    );
  };
};
