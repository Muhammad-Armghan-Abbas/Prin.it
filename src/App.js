import './App.css';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import View from './components/pages/View.js';
import Home from './components/pages/Home.js';
import ShoppingBag from './components/ShoppingBag.js';
import Header from './components/header.js';
import Footer from './components/footer.js';
import Checkout from './components/pages/checkout.js';
import AuthForm from './components/pages/SignInSignUp.js';
import ScrollToTop from './components/ScrollToTop.js';
import AdminLogin from './components/pages/AdminLogin.js';
import AdminDashboard from './components/pages/AdminDashboard.js';
import UserDashboard from './components/pages/UserDashboard.js';
import ProtectedRoute from './components/auth/ProtectedRoute.js';
import AdminRoute from './components/auth/AdminRoute.js';
import CustomizeProduct from './components/pages/CustomizeProduct.js';
import { auth } from './firebase.js';

function App() {
  document.addEventListener('scroll', () => {
    const head = document.querySelector('header');
    if (window.scrollY > 20) {
      head.classList.add('scrolled')
    } else {
      head.classList.remove('scrolled')
    }
  })
  return (
    <Router>
      <div className="App">
        <ScrollToTop />
        <Header />
        <ShoppingBag />
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/auth' element={<AuthForm />} />
          <Route path='/login' element={<AuthForm mode="login" />} />
          <Route path='/view/:id' element={<View />} />          <Route path='/admin' element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          } />
          <Route path='/admin/login' element={<AdminLogin />} />
          <Route path='/account' element={
            <ProtectedRoute>
              <UserDashboard />
            </ProtectedRoute>
          } />
          <Route path='/customize/:id' element={<CustomizeProduct />} />
          <Route path='/checkout' element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
        </Routes>
        <Footer />
      </div>
    </Router>
  )
}

export default App;
