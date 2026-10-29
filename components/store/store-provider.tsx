"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import { EXCLUSIVE_PIECES, PRODUCTS, type ExclusivePiece, type Product } from "@/lib/content";
import { apiFetch, clearToken, getToken, setToken } from "@/lib/api";
import { fetchExclusivePieces } from "@/lib/exclusive-api";

export type DrawerKind = "cart" | "wishlist" | "search" | "account" | null;

export type CartItem = {
  handle: string;
  qty: number;
};

export type User = {
  email: string;
  name?: string;
};

export type Address = {
  id: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone?: string;
};

export type Preferences = {
  language: "English";
  currency: "INR" | "USD" | "EUR" | "GBP";
};

const DEFAULT_PREFERENCES: Preferences = {
  language: "English",
  currency: "INR"
};

export type WrappingOption = "essential" | "classic";

export type CartExtras = {
  wrapping: WrappingOption;
  giftMessage: string; // empty string = no card
};

const DEFAULT_EXTRAS: CartExtras = {
  wrapping: "essential",
  giftMessage: ""
};

export type OrderStatus = "placed" | "cancelled" | "shipped" | "delivered";

export type OrderItem = {
  handle: string;
  name: string;
  image?: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
};

export type Order = {
  id: string;
  placedAt: string; // ISO
  status: OrderStatus;
  cancelledAt?: string;
  items: OrderItem[];
  extras: CartExtras;
  delivery: { method: "standard" | "express"; cost: number };
  payment: { method: "upi" | "card" | "netbanking" | "cod"; fee: number };
  contact: {
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  shipping: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    postal: string;
    country: string;
  };
  subtotal: number;
  total: number;
  gst: number;
};

// What the caller passes to placeOrder. The store fills in id/placedAt/status.
export type OrderDraft = Omit<Order, "id" | "placedAt" | "status">;

type StoreState = {
  cart: CartItem[];
  wishlist: string[];
  drawer: DrawerKind;
  user: User | null;
  addresses: Address[];
  preferences: Preferences;
  cartExtras: CartExtras;
  orders: Order[];

  openDrawer: (kind: DrawerKind) => void;
  closeDrawer: () => void;

  addToCart: (handle: string, qty?: number) => void;
  removeFromCart: (handle: string) => void;
  updateCartQty: (handle: string, qty: number) => void;
  clearCart: () => void;
  setCartExtras: (patch: Partial<CartExtras>) => void;

  toggleWishlist: (handle: string) => void;
  isInWishlist: (handle: string) => boolean;
  removeFromWishlist: (handle: string) => void;

  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => void;

  addAddress: (address: Omit<Address, "id">) => void;
  removeAddress: (id: string) => void;

  updatePreferences: (patch: Partial<Preferences>) => void;

  placeOrder: (draft: OrderDraft) => Promise<Order>;
  cancelOrder: (id: string) => void;
  orderById: (id: string) => Order | undefined;

  cartCount: number;
  cartSubtotal: number;

  productByHandle: (handle: string) => Product | undefined;
};

const StoreContext = createContext<StoreState | null>(null);

const CART_KEY = "tlv:cart:v1";
const WISHLIST_KEY = "tlv:wishlist:v1";
const USER_KEY = "tlv:user:v1";
const ADDRESSES_KEY = "tlv:addresses:v1";
const PREFERENCES_KEY = "tlv:preferences:v1";
const EXTRAS_KEY = "tlv:cart-extras:v1";
const ORDERS_KEY = "tlv:orders:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    const parsed = JSON.parse(raw);
    return parsed as T;
  } catch {
    return fallback;
  }
}

// Luxe Exclusive pieces aren't in the PRODUCTS catalog — they're their
// own `EXCLUSIVE_PIECES` list in content.ts. When one is added to the
// cart, the drawer/checkout code expects a Product shape to render it,
// so we adapt on the fly. USD rate matches the rough conversion used
// elsewhere in the storefront (lib/products-api.ts); good enough for
// display, not for billing.
const INR_PER_USD = 83;
function exclusivePieceToProduct(piece: ExclusivePiece): Product {
  const inr = piece.price ?? 0;
  return {
    handle: piece.slug,
    name: piece.name,
    category: "Luxe Exclusive",
    description: piece.intro,
    price: { inr, usd: Math.round(inr / INR_PER_USD) },
    image: piece.image,
    aspect: "portrait",
    material: piece.material
  };
}

// ---------- Backend payload shapes ----------

type BackendAddress = {
  _id?: string;
  id?: string;
  name?: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  phone?: string;
};

type BackendUser = {
  id: string;
  email: string;
  name?: string;
  addresses?: BackendAddress[];
  wishlist?: string[];
  preferences?: Preferences;
};

type BackendOrder = {
  id: string;
  ref: string;
  status: "placed" | "processing" | "shipped" | "delivered" | "cancelled";
  cancelledAt?: string;
  items: Array<{
    handle: string;
    name: string;
    image?: string;
    qty: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  extras?: CartExtras;
  delivery?: { method?: "standard" | "express"; cost?: number };
  payment?: { method?: Order["payment"]["method"]; fee?: number };
  contact?: Order["contact"];
  shipping?: Order["shipping"];
  subtotal: number;
  total: number;
  gst: number;
  createdAt: string;
};

const toLocalAddress = (a: BackendAddress): Address => ({
  id: (a._id || a.id || "") as string,
  name: a.name || "",
  line1: a.line1,
  line2: a.line2,
  city: a.city,
  state: a.state,
  postal: a.postal,
  country: a.country,
  phone: a.phone
});

const toLocalOrder = (o: BackendOrder): Order => ({
  id: o.ref || o.id,
  placedAt: o.createdAt,
  status:
    o.status === "cancelled"
      ? "cancelled"
      : o.status === "shipped"
      ? "shipped"
      : o.status === "delivered"
      ? "delivered"
      : "placed",
  cancelledAt: o.cancelledAt,
  items: o.items.map((i) => ({
    handle: i.handle,
    name: i.name,
    image: i.image,
    qty: i.qty,
    unitPrice: i.unitPrice,
    lineTotal: i.lineTotal
  })),
  extras: o.extras ?? DEFAULT_EXTRAS,
  delivery: {
    method: o.delivery?.method ?? "standard",
    cost: o.delivery?.cost ?? 0
  },
  payment: {
    method: (o.payment?.method as Order["payment"]["method"]) ?? "cod",
    fee: o.payment?.fee ?? 0
  },
  contact: o.contact ?? { email: "", firstName: "", lastName: "", phone: "" },
  shipping:
    o.shipping ?? { line1: "", line2: "", city: "", state: "", postal: "", country: "" },
  subtotal: o.subtotal,
  total: o.total,
  gst: o.gst
});

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);
  const [cartExtras, setCartExtrasState] = useState<CartExtras>(DEFAULT_EXTRAS);
  const [orders, setOrders] = useState<Order[]>([]);
  const [drawer, setDrawer] = useState<DrawerKind>(null);
  const [hydrated, setHydrated] = useState(false);
  // Luxe Exclusive pieces available to productByHandle. Seeded with the
  // hardcoded list so the cart can resolve a handle before the backend
  // round-trip completes; swapped for the admin's list once fetched. If
  // the backend is unreachable, the hardcoded seed stays — nothing to
  // overwrite with — so the resolver never regresses.
  const [exclusivePieces, setExclusivePieces] =
    useState<ExclusivePiece[]>(EXCLUSIVE_PIECES);

  // Latest token lives in a ref so async callbacks always see the current
  // value without re-triggering effects.
  const tokenRef = useRef<string | null>(null);
  const isSignedIn = () => tokenRef.current != null;

  // Hydrate from localStorage once, client-side only, then — if there's a
  // stored token — fetch the signed-in view from the backend.
  useEffect(() => {
    setCart(safeParse<CartItem[]>(localStorage.getItem(CART_KEY), []));
    setWishlist(safeParse<string[]>(localStorage.getItem(WISHLIST_KEY), []));
    setUser(safeParse<User | null>(localStorage.getItem(USER_KEY), null));
    setAddresses(safeParse<Address[]>(localStorage.getItem(ADDRESSES_KEY), []));
    setPreferences(
      safeParse<Preferences>(
        localStorage.getItem(PREFERENCES_KEY),
        DEFAULT_PREFERENCES
      )
    );
    setCartExtrasState(
      safeParse<CartExtras>(localStorage.getItem(EXTRAS_KEY), DEFAULT_EXTRAS)
    );
    setOrders(safeParse<Order[]>(localStorage.getItem(ORDERS_KEY), []));

    tokenRef.current = getToken();
    setHydrated(true);
  }, []);

  // Pull the admin-managed Luxe Exclusive list so productByHandle can
  // resolve cart items whose slugs were authored in the backend (not in
  // the hardcoded seed). Silent failure: the hardcoded seed stays if the
  // backend is unreachable; errors print to the console so backend
  // problems are visible during integration.
  useEffect(() => {
    let cancelled = false;
    fetchExclusivePieces()
      .then((rows) => {
        if (cancelled || rows.length === 0) return;
        setExclusivePieces(rows);
      })
      .catch((err) =>
        console.error("[store-provider] failed to fetch exclusive pieces:", err)
      );
    return () => {
      cancelled = true;
    };
  }, []);

  // When hydrated and a token is present, refresh the signed-in view from
  // the backend (profile, addresses, wishlist, orders). Fallback — DISABLED:
  // previously any failure here (expired token, server down) silently cleared
  // the token and continued as guest. Now errors surface to the console so
  // backend problems are visible during integration.
  useEffect(() => {
    if (!hydrated) return;
    if (!tokenRef.current) return;

    let cancelled = false;

    (async () => {
      const { user: me } = await apiFetch<{ user: BackendUser }>("/api/auth/me");
      if (cancelled) return;

      setUser({ email: me.email, name: me.name });
      if (me.addresses) setAddresses(me.addresses.map(toLocalAddress));
      if (me.wishlist) setWishlist(me.wishlist);
      if (me.preferences) setPreferences(me.preferences);

      const ordersResp = await apiFetch<{ items: BackendOrder[] }>("/api/orders");
      if (cancelled) return;
      setOrders(ordersResp.items.map(toLocalOrder));

      // Guest-fallback catch — DISABLED. Uncomment to restore silent
      // sign-out when the token is rejected.
      //
      // } catch {
      //   clearToken();
      //   tokenRef.current = null;
      // }
    })().catch((err) => {
      console.error("[store-provider] failed to refresh signed-in view:", err);
    });

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  // Persist. Skip until after hydration so we don't wipe existing storage
  // with the empty initial state on the first render.
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (user) localStorage.setItem(USER_KEY, JSON.stringify(user));
    else localStorage.removeItem(USER_KEY);
  }, [user, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ADDRESSES_KEY, JSON.stringify(addresses));
  }, [addresses, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  }, [preferences, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(EXTRAS_KEY, JSON.stringify(cartExtras));
  }, [cartExtras, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const openDrawer = useCallback((kind: DrawerKind) => setDrawer(kind), []);
  const closeDrawer = useCallback(() => setDrawer(null), []);

  // Cart stays client-side regardless of auth state — carts are session
  // objects, not committed data.
  const addToCart = useCallback((handle: string, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.handle === handle);
      if (existing) {
        return prev.map((i) =>
          i.handle === handle ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { handle, qty }];
    });
  }, []);

  const removeFromCart = useCallback((handle: string) => {
    setCart((prev) => prev.filter((i) => i.handle !== handle));
  }, []);

  const updateCartQty = useCallback((handle: string, qty: number) => {
    setCart((prev) => {
      if (qty <= 0) return prev.filter((i) => i.handle !== handle);
      return prev.map((i) => (i.handle === handle ? { ...i, qty } : i));
    });
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const setCartExtras = useCallback((patch: Partial<CartExtras>) => {
    setCartExtrasState((prev) => ({ ...prev, ...patch }));
  }, []);

  // Wishlist — optimistic local update; if signed in, mirror to the backend.
  const toggleWishlist = useCallback((handle: string) => {
    let willAdd = false;
    setWishlist((prev) => {
      if (prev.includes(handle)) {
        return prev.filter((h) => h !== handle);
      }
      willAdd = true;
      return [...prev, handle];
    });
    if (isSignedIn()) {
      // Silent-swallow catches — DISABLED. Previously failures here were
      // swallowed on the assumption local state was "good enough"; now
      // backend errors surface to the console so they can be noticed.
      if (willAdd) {
        apiFetch("/api/users/me/wishlist", {
          method: "POST",
          body: JSON.stringify({ handle })
        }).catch((err) =>
          console.error("[store-provider] wishlist add failed:", err)
        );
      } else {
        apiFetch(`/api/users/me/wishlist/${encodeURIComponent(handle)}`, {
          method: "DELETE"
        }).catch((err) =>
          console.error("[store-provider] wishlist remove failed:", err)
        );
      }
    }
  }, []);

  const isInWishlist = useCallback(
    (handle: string) => wishlist.includes(handle),
    [wishlist]
  );

  const removeFromWishlist = useCallback((handle: string) => {
    setWishlist((prev) => prev.filter((h) => h !== handle));
    if (isSignedIn()) {
      apiFetch(`/api/users/me/wishlist/${encodeURIComponent(handle)}`, {
        method: "DELETE"
      }).catch((err) =>
        console.error("[store-provider] wishlist remove failed:", err)
      );
    }
  }, []);

  // Resolve a cart handle to a Product. Checks the hardcoded PRODUCTS
  // catalog first, then falls back to Luxe Exclusive pieces (keyed by
  // slug) so the featured hero's "Add to Bag" button yields a cart row
  // the drawer and checkout can render just like any other product.
  // `exclusivePieces` is admin-authored and populated from the backend
  // (seeded with the hardcoded list so lookups work before the fetch).
  const productByHandle = useCallback(
    (handle: string) => {
      const direct = PRODUCTS.find((p) => p.handle === handle);
      if (direct) return direct;
      const piece = exclusivePieces.find((p) => p.slug === handle);
      return piece ? exclusivePieceToProduct(piece) : undefined;
    },
    [exclusivePieces]
  );

  // Auth. The storefront version takes a real password now; the backend
  // issues a JWT we hold in both the ref and localStorage.
  const signIn = useCallback(async (email: string, password: string) => {
    const { token, user: me } = await apiFetch<{
      token: string;
      user: BackendUser;
    }>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      auth: false
    });
    setToken(token);
    tokenRef.current = token;

    setUser({ email: me.email, name: me.name });
    setAddresses((me.addresses || []).map(toLocalAddress));

    // Guest-wishlist merge — DISABLED. Previously, any wishlist handles the
    // visitor collected before signing in were merged into the server list
    // on sign-in. Now the server's list is authoritative; local items are
    // discarded. Uncomment to restore the merge-and-push-local-additions flow.
    //
    // const incoming = me.wishlist || [];
    // setWishlist((prev) => {
    //   const merged = Array.from(new Set([...incoming, ...prev]));
    //   prev
    //     .filter((h) => !incoming.includes(h))
    //     .forEach((handle) => {
    //       apiFetch("/api/users/me/wishlist", {
    //         method: "POST",
    //         body: JSON.stringify({ handle })
    //       }).catch(() => {});
    //     });
    //   return merged;
    // });
    setWishlist(me.wishlist || []);

    if (me.preferences) setPreferences(me.preferences);

    // Orders fetch — the previous try/catch "non-fatal, orders list stays
    // empty" fallback is DISABLED. Backend errors now propagate so the
    // sign-in surfaces them.
    const ordersResp = await apiFetch<{ items: BackendOrder[] }>("/api/orders");
    setOrders(ordersResp.items.map(toLocalOrder));
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, name?: string) => {
      const { token, user: me } = await apiFetch<{
        token: string;
        user: BackendUser;
      }>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
        auth: false
      });
      setToken(token);
      tokenRef.current = token;
      setUser({ email: me.email, name: me.name });
      setAddresses([]);
      // Guest-wishlist carry-over — DISABLED. Previously, any wishlist the
      // visitor had before registering was kept locally and pushed up to the
      // new account one item at a time. Now we start from the server's
      // (empty) list. Uncomment to restore the carry-over.
      //
      // setWishlist((prev) => {
      //   prev.forEach((handle) => {
      //     apiFetch("/api/users/me/wishlist", {
      //       method: "POST",
      //       body: JSON.stringify({ handle })
      //     }).catch(() => {});
      //   });
      //   return prev;
      // });
      setWishlist([]);
    },
    []
  );

  const signOut = useCallback(() => {
    clearToken();
    tokenRef.current = null;
    setUser(null);
    setAddresses([]);
    setOrders([]);
    // Wishlist stays — it's useful for guests too.
  }, []);

  const addAddress = useCallback((address: Omit<Address, "id">) => {
    // Optimistic add with a temp id; replaced when the server returns.
    const tempId = `addr-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const temp: Address = { ...address, id: tempId };
    setAddresses((prev) => [...prev, temp]);
    if (isSignedIn()) {
      apiFetch<BackendAddress>("/api/users/me/addresses", {
        method: "POST",
        body: JSON.stringify(address)
      })
        .then((row) => {
          const saved = toLocalAddress(row);
          setAddresses((prev) =>
            prev.map((a) => (a.id === tempId ? saved : a))
          );
        })
        .catch((err) => {
          // Silent swallow — DISABLED. Previously kept the temp row on
          // failure so the UI didn't flicker. Now the row is rolled back
          // and the error is surfaced.
          console.error("[store-provider] add address failed:", err);
          setAddresses((prev) => prev.filter((a) => a.id !== tempId));
        });
    }
  }, []);

  const removeAddress = useCallback((id: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    if (isSignedIn()) {
      apiFetch(`/api/users/me/addresses/${encodeURIComponent(id)}`, {
        method: "DELETE"
      }).catch((err) =>
        console.error("[store-provider] remove address failed:", err)
      );
    }
  }, []);

  const updatePreferences = useCallback((patch: Partial<Preferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
    if (isSignedIn()) {
      apiFetch("/api/auth/me", {
        method: "PATCH",
        body: JSON.stringify({ preferences: { ...preferences, ...patch } })
      }).catch((err) =>
        console.error("[store-provider] update preferences failed:", err)
      );
    }
  }, [preferences]);

  const placeOrder = useCallback(async (draft: OrderDraft): Promise<Order> => {
    // Backend-only. Guest-checkout fallback — DISABLED. Previously if the
    // visitor wasn't signed in, placeOrder minted a local-only Order and
    // kept it in localStorage so the confirmation page still rendered.
    // That hid orders from the admin and bypassed stock/pricing checks.
    // Uncomment the guest branch at the bottom to restore it.
    if (!isSignedIn()) {
      throw new Error("Please sign in to place an order.");
    }

    const payload = {
      items: draft.items.map((i) => ({
        handle: i.handle,
        qty: i.qty,
        name: i.name,
        image: i.image,
        unitPrice: i.unitPrice,
        lineTotal: i.lineTotal
      })),
      contact: draft.contact,
      shipping: draft.shipping,
      delivery: draft.delivery,
      payment: draft.payment,
      extras: draft.extras
    };
    const row = await apiFetch<BackendOrder>("/api/orders", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    const order = toLocalOrder(row);
    setOrders((prev) => [order, ...prev]);
    return order;

    // Guest fallback — DISABLED.
    //
    // const id = `LV-${Date.now().toString().slice(-8)}`;
    // const order: Order = {
    //   ...draft,
    //   id,
    //   placedAt: new Date().toISOString(),
    //   status: "placed"
    // };
    // setOrders((prev) => [order, ...prev]);
    // return order;
  }, []);

  const cancelOrder = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id && o.status === "placed"
          ? { ...o, status: "cancelled", cancelledAt: new Date().toISOString() }
          : o
      )
    );
    if (isSignedIn()) {
      // Silent swallow — DISABLED. Errors from the cancel round-trip now
      // surface to the console instead of being discarded.
      apiFetch<{ items: BackendOrder[] }>(`/api/orders?limit=200`)
        .then(({ items }) => {
          const match = items.find((o) => o.ref === id || o.id === id);
          if (!match) return;
          return apiFetch(`/api/orders/${match.id}/cancel`, { method: "POST" });
        })
        .catch((err) =>
          console.error("[store-provider] cancel order failed:", err)
        );
    }
  }, []);

  const orderById = useCallback(
    (id: string) => orders.find((o) => o.id === id),
    [orders]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, i) => acc + i.qty, 0),
    [cart]
  );

  // Subtotal flows through productByHandle so Luxe Exclusive pieces (which
  // live outside PRODUCTS and come from the admin-managed list) contribute
  // their price too. A naive PRODUCTS.find lookup silently zeroed them out.
  const cartSubtotal = useMemo(
    () =>
      cart.reduce((acc, i) => {
        const p = productByHandle(i.handle);
        return acc + (p?.price.inr ?? 0) * i.qty;
      }, 0),
    [cart, productByHandle]
  );

  const value: StoreState = {
    cart,
    wishlist,
    drawer,
    user,
    addresses,
    preferences,
    cartExtras,
    orders,
    openDrawer,
    closeDrawer,
    addToCart,
    removeFromCart,
    updateCartQty,
    clearCart,
    setCartExtras,
    toggleWishlist,
    isInWishlist,
    removeFromWishlist,
    signIn,
    signUp,
    signOut,
    addAddress,
    removeAddress,
    updatePreferences,
    placeOrder,
    cancelOrder,
    orderById,
    cartCount,
    cartSubtotal,
    productByHandle
  };

  return (
    <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
  );
}

export function useStore(): StoreState {
  const ctx = useContext(StoreContext);
  if (!ctx) {
    throw new Error("useStore must be used within a StoreProvider");
  }
  return ctx;
}
