import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { PlusCircle, PackageCheck, Truck, ChevronRight, RefreshCw, Calendar, Tag } from 'lucide-react';

export default function PackagesPage({ token }) {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Form state
  const [trackingNumber, setTrackingNumber] = useState('');
  const [title, setTitle] = useState('');
  const [carrier, setCarrier] = useState('FedEx');
  const [origin, setOrigin] = useState('');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPackages(token);
      setPackages(data);
    } catch (err) {
      setError(err.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackages();
  }, [token]);

  const handleAddPackage = async (e) => {
    e.preventDefault();
    if (!trackingNumber.trim() || !title.trim()) {
      setError('Please provide tracking number and title');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await api.createPackage(
        {
          tracking_number: trackingNumber.trim(),
          title: title.trim(),
          carrier,
          origin: origin.trim() || 'Distribution Center',
          estimated_delivery: estimatedDelivery.trim() || 'In 2-3 business days',
        },
        token
      );

      // Reset form
      setTrackingNumber('');
      setTitle('');
      setOrigin('');
      setEstimatedDelivery('');
      setShowAddForm(false);

      // Refresh list
      fetchPackages();
    } catch (err) {
      setError(err.message || 'Failed to add package');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>My Shipments</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Monitor and trace your active deliveries in real-time
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <PlusCircle size={18} />
          {showAddForm ? 'Close Form' : 'Track Package'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Add Package Form Card */}
      {showAddForm && (
        <div className="card" style={{ borderColor: 'var(--primary)' }}>
          <h2 className="card-title">
            <Truck size={20} color="var(--primary)" />
            Add New Package to Track
          </h2>
          <form onSubmit={handleAddPackage}>
            <div className="form-row">
              <div className="form-group">
                <label>Tracking Number *</label>
                <input
                  type="text"
                  placeholder="e.g. TRK-88291"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Package Title / Description *</label>
                <input
                  type="text"
                  placeholder="e.g. Ergonomic Office Chair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Carrier</label>
                <select value={carrier} onChange={(e) => setCarrier(e.target.value)}>
                  <option value="FedEx">FedEx</option>
                  <option value="DHL Express">DHL Express</option>
                  <option value="BlueDart">BlueDart</option>
                  <option value="UPS">UPS</option>
                  <option value="India Post">India Post</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Origin Hub</label>
                <input
                  type="text"
                  placeholder="e.g. Mumbai Logistics Hub"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Estimated Delivery</label>
                <input
                  type="text"
                  placeholder="e.g. Tomorrow by 7 PM"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Registering...' : 'Save & Track'}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Package List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <RefreshCw size={24} className="spin" style={{ marginBottom: '0.5rem' }} />
          <p>Loading your packages...</p>
        </div>
      ) : packages.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <PackageCheck size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>No packages tracked yet</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            Enter your tracking ID above to monitor courier progress and delivery milestones.
          </p>
          <button className="btn btn-primary" onClick={() => setShowAddForm(true)}>
            <PlusCircle size={18} />
            Track Your First Package
          </button>
        </div>
      ) : (
        <div className="packages-grid">
          {packages.map((pkg) => (
            <Link key={pkg.id} to={`/packages/${pkg.id}`} className="package-item">
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className="badge badge-carrier">{pkg.carrier}</span>
                  <span className={`badge ${pkg.status === 'Delivered' ? 'badge-delivered' : 'badge-transit'}`}>
                    {pkg.status}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  {pkg.title}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', fontFamily: 'monospace' }}>
                  {pkg.tracking_number}
                </p>
              </div>

              <div style={{ marginTop: '1.25rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Calendar size={13} />
                  {pkg.estimated_delivery || 'In transit'}
                </span>
                <span style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', fontSize: '0.8rem', fontWeight: 600 }}>
                  Details <ChevronRight size={14} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
