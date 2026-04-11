import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import BrandValues from "./components/BrandValues";
import BestSellers from "./components/BestSellers";
import NewFace from "./components/NewFace";
import Subscription from "./components/Subscription";
import CallToAction from "./components/CallToAction";
import Footer from "./components/Footer";

import Auth from "./pages/Auth";
import Menu from "./pages/Menu";
import Promotions from "./pages/Promotions";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderStatus from "./pages/OrderStatus";
import AdminLayout from "./pages/admin/AdminLayout";
import Overview from "./pages/admin/Overview";
import Products from "./pages/admin/Products";
import Orders from "./pages/admin/Orders";
import Vouchers from "./pages/admin/Vouchers";
import Customers from "./pages/admin/Customers";
import Users from "./pages/admin/Users";
import Members from "./pages/admin/Members";
import Posts from "./pages/admin/Posts";
import Banners from "./pages/admin/Banners";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/Profile";
import News from "./pages/News";
import NewsDetail from "./pages/NewsDetail";
import { ToastProvider } from "./context/ToastContext";

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Home = () => (
  <>
    <Navbar />
    <main className="pt-16">
      <Hero />
      <BestSellers />
      <NewFace />
      <BrandValues />
      <Subscription />
      <CallToAction />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <ToastProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-surface font-body text-on-surface">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/menu" element={<Menu />} />
            <Route path="/promos" element={<Promotions />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:slug" element={<NewsDetail />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-status/:id" element={<OrderStatus />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<Overview />} />
              <Route path="products" element={<Products />} />
              <Route path="orders" element={<Orders />} />
              <Route path="vouchers" element={<Vouchers />} />
              <Route path="customers" element={<Customers />} />
              <Route path="users" element={<Users />} />
              <Route path="members" element={<Members />} />
              <Route path="posts" element={<Posts />} />
              <Route path="banners" element={<Banners />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="/profile" element={<Profile />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </Router>
    </ToastProvider>
  );
}

export default App;
