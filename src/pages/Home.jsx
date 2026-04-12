import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Search, Menu, X, ArrowRight } from 'lucide-react';

const Home = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const blogs = [
    {
      id: 1,
      title: "10 Most Popular Street Foods You Must Try",
      excerpt: "Explore the vibrant and spicy world of local street food delivered straight to your home.",
      image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Oct 12, 2026",
      readTime: "5 min read"
    },
    {
      id: 2,
      title: "Why Door to Door Delivery is Changing the Game",
      excerpt: "How our logistics and fast-paced delivery algorithm ensures your food is always piping hot.",
      image: "https://images.unsplash.com/photo-1526367790999-0150786686a2?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Sep 28, 2026",
      readTime: "3 min read"
    },
    {
      id: 3,
      title: "Healthy Eating: Craving Salads over Burgers?",
      excerpt: "Discover the best organic options available right now in your city area.",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      date: "Sep 15, 2026",
      readTime: "4 min read"
    }
  ];

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Navigation Bar */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        zIndex: 100, padding: '1rem 2rem',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ 
              width: '40px', height: '40px', backgroundColor: 'var(--primary)', 
              borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' 
            }}>
              <Truck size={22} color="white" />
            </div>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#1c1c1c', letterSpacing: '-0.5px' }}>
              Door To Door
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="d-none-mobile" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/menu" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Menu</Link>
          <Link to="/my-orders" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>My Orders</Link>
          <a href="#blogs" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Blogs</a>
          <a href="#contact" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Contact</a>
          <Link to="/customer-register" style={{ fontWeight: '600', color: 'var(--text-secondary)' }}>Register</Link>
          <Link to="/login" className="btn btn-primary" style={{ padding: '0.5rem 1.5rem', borderRadius: '50px' }}>
            Admin
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="d-block-mobile" style={{ display: 'none' }}>
           <button style={{background:'none', border:'none'}} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
             {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
           </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        marginTop: '70px',
        position: 'relative',
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        padding: '0 5%',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'url("https://images.unsplash.com/photo-1504674900247-0877df9cc836?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80")',
          backgroundSize: 'cover', backgroundPosition: 'center',
          filter: 'brightness(0.35)'
        }}></div>
        
        <div className="animate-fade-in" style={{ position: 'relative', zIndex: 10, maxWidth: '800px', padding: '4rem 0' }}>
          <span style={{ 
            display: 'inline-block', backgroundColor: 'rgba(226, 55, 68, 0.2)', 
            color: '#ff8a94', padding: '0.4rem 1rem', borderRadius: '50px', 
            fontWeight: '600', fontSize: '0.85rem', marginBottom: '1.5rem', border: '1px solid rgba(226, 55, 68, 0.4)'
          }}>
            #1 Delivery App in the City
          </span>
          <h1 style={{ 
            fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', color: 'white', 
            fontWeight: '800', lineHeight: '1.1', marginBottom: '1.5rem' 
          }}>
            Hot & Delicious <br /> Delivered to your Door.
          </h1>
          <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2.5rem', maxWidth: '600px' }}>
            We bring the best restaurants and gourmet meals straight to you. Experience lightning-fast delivery and absolute freshness.
          </p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link to="/menu" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '8px' }}>
              Order Now <ArrowRight size={20} />
            </Link>
            <Link to="/menu" className="btn" style={{ 
              backgroundColor: 'rgba(255,255,255,0.1)', color: 'white', 
              padding: '1rem 2rem', fontSize: '1.1rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)', backdropFilter: 'blur(5px)'
            }}>
              View Menu
            </Link>
          </div>
        </div>
      </section>

      {/* Blogs Section */}
      <section id="blogs" style={{ padding: '6rem 5%', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', color: '#1c1c1c', marginBottom: '1rem' }}>
            Latest from our Blog
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
            Discover tips, news, and mouth-watering stories from our culinary experts.
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
          gap: '2.5rem',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {blogs.map(blog => (
            <div key={blog.id} className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ height: '220px', overflow: 'hidden' }}>
                <img 
                  src={blog.image} 
                  alt={blog.title} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.5s' }} 
                  onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
                />
              </div>
              <div style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: '500' }}>
                  <span>{blog.date}</span>
                  <span>{blog.readTime}</span>
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '1rem', color: 'var(--text-primary)', lineHeight: '1.3' }}>
                  {blog.title}
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '1.5rem', flex: 1 }}>
                  {blog.excerpt}
                </p>
                <a href="#" style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  Read More <ArrowRight size={16} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer / Contact Us Stub */}
      <footer id="contact" style={{ 
        backgroundColor: '#1c1c1c', color: 'white', padding: '4rem 5%', marginTop: 'auto'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--primary)', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Truck size={22} color="white" />
              </div>
              <span style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white' }}>
                Door To Door
              </span>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: '1.6' }}>
              Making your life easier by bringing the world’s best food directly to you.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Contact Us</h4>
            <ul style={{ color: 'rgba(255,255,255,0.6)', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              <li>Email: support@doortodoor.com</li>
              <li>Phone: +1 800 123 4567</li>
              <li>Address: 123 Delivery HQ, Food City</li>
            </ul>
          </div>
          <div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: '700', marginBottom: '1.5rem' }}>Newsletter</h4>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input type="email" placeholder="Your Email" className="form-control" style={{ border: 'none', backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }} />
              <button className="btn btn-primary">Subscribe</button>
            </div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', marginTop: '4rem', paddingTop: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.9rem' }}>
          &copy; {new Date().getFullYear()} Door To Door Delivery. All Rights Reserved.
        </div>
      </footer>

      <style>{`
        @media(max-width: 768px) {
          .d-none-mobile { display: none !important; }
          .d-block-mobile { display: block !important; }
        }
      `}</style>
    </div>
  );
};

export default Home;
