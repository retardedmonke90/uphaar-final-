import { createBrowserRouter } from "react-router";
import Root from "./components/Root";
import Home from "./components/Home";
import Categories from "./components/Categories";
import ProductDetail from "./components/ProductDetail";
import Cart from "./components/Cart";
import Checkout from "./components/Checkout";
import Contact from "./components/Contact";
import Support from "./components/Support";
import Reviews from "./components/Reviews";
import OrderHistory from "./components/OrderHistory";
import LuckyDraw from "./components/LuckyDraw";
import NotFound from "./components/NotFound";
import Admin from "./components/Admin";
import Account from "./components/Account";
import AuthCallback from "./components/AuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "categories", Component: Categories },
      { path: "categories/:category", Component: Categories },
      { path: "product/:id", Component: ProductDetail },
      { path: "cart", Component: Cart },
      { path: "checkout", Component: Checkout },
      { path: "contact", Component: Contact },
      { path: "support", Component: Support },
      { path: "reviews", Component: Reviews },
      { path: "orders", Component: OrderHistory },
      { path: "lucky-draw", Component: LuckyDraw },
      { path: "account", Component: Account },
      { path: "auth/callback", Component: AuthCallback },
      { path: "admin", Component: Admin },
      { path: "*", Component: NotFound },
    ],
  },
]);
