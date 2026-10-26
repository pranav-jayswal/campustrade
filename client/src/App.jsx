import { Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import ProductCatalog from './pages/ProductCatalog';
import ProductDetail from './pages/ProductDetail';
import CampusEvents from './pages/CampusEvents';
import BountyBoard from './pages/BountyBoard';
import LostAndFound from './pages/LostAndFound';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import MyOrders from './pages/MyOrders';
import MyListings from './pages/MyListings';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Admin from './pages/Admin';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/shop" element={<ProductCatalog />} />
        <Route path="/bounties" element={<BountyBoard />} />
        <Route path="/requests" element={<BountyBoard />} />
        <Route path="/lost-and-found" element={<LostAndFound />} />
        <Route path="/lostandfound" element={<LostAndFound />} />
        <Route path="/events" element={<CampusEvents />} />
        <Route path="/campus-events" element={<CampusEvents />} />
        <Route path="/campusevents" element={<CampusEvents />} />
        <Route path="/event" element={<CampusEvents />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Authenticated member routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/my-orders" element={<MyOrders />} />
          <Route path="/my-listings" element={<MyListings />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Admin only route */}
        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
