import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api';
import { ArrowLeft, Clock, MapPin, CheckCircle2, Box, Truck } from 'lucide-react';

export default function PackageDetailPage({ token }) {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchPackage = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await api.getPackageById(id, token);
      setPkg(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch package details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackage();
  }, [id, token]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        <p>Loading shipment details...</p>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div className="card">
        <div className="alert alert-error">{error || 'Package not found'}</div>
        <Link to="/" className="btn btn-outline">
          <ArrowLeft size={16} /> Back to Shipments
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <Link to="/" className="btn btn-outline btn-sm" style={{ display: 'inline-flex', marginBottom: '1rem' }}>
          <ArrowLeft size={14} /> Back to Shipments
        </Link>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span className="badge badge-carrier" style={{ marginBottom: '0.4rem' }}>{pkg.carrier}</span>
            <h1 style={{ fontSize: '1.6rem', fontWeight: 700 }}>{pkg.title}</h1>
            <p style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: '0.9rem' }}>
              Tracking ID: {pkg.tracking_number}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <span className={`badge ${pkg.status === 'Delivered' ? 'badge-delivered' : 'badge-transit'}`} style={{ fontSize: '0.85rem' }}>
              {pkg.status}
            </span>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
              Estimated: {pkg.estimated_delivery}
            </p>
          </div>
        </div>
      </div>

      {/* Progress card */}
      <div className="card">
        <h2 className="card-title">
          <Clock size={18} color="var(--primary)" />
          Tracking History & Checkpoints
        </h2>

        {(!pkg.checkpoints || pkg.checkpoints.length === 0) ? (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No checkpoint updates recorded yet.</p>
        ) : (
          <div className="timeline">
            {pkg.checkpoints.map((cp) => (
              <div key={cp.id} className="timeline-item">
                <div className="timeline-dot" />
                <div className="timeline-date">
                  {new Date(cp.timestamp).toLocaleString()}
                </div>
                <div className="timeline-status">{cp.status}</div>
                <div className="timeline-location" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                  <MapPin size={14} />
                  {cp.location}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Package Specs summary */}
      <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Created On</span>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {new Date(pkg.created_at).toLocaleDateString()}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Carrier Partner</span>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem' }}>
            {pkg.carrier}
          </p>
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Delivery Status</span>
          <p style={{ fontWeight: 600, fontSize: '0.9rem', marginTop: '0.2rem', color: pkg.status === 'Delivered' ? 'var(--accent-emerald)' : 'var(--accent-blue)' }}>
            {pkg.status}
          </p>
        </div>
      </div>
    </div>
  );
}
