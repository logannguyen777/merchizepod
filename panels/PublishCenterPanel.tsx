/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MagnifyingGlassIcon, TagIcon, ArrowUpOnSquareIcon, RocketIcon } from '../components/icons';

// Sample data for demonstration
const sampleProducts = [
  {
    id: 1,
    imageUrl: 'https://picsum.photos/seed/product1/80',
    title: 'Retro Sunset Graphic Tee',
    productType: 'T-Shirt',
    status: 'Ready to Publish',
    price: '24.99',
  },
  {
    id: 2,
    imageUrl: 'https://picsum.photos/seed/product2/80',
    title: 'Vintage Gamer Style Hoodie',
    productType: 'Hoodie',
    status: 'Draft',
    price: '39.99',
  },
  {
    id: 3,
    imageUrl: 'https://picsum.photos/seed/product3/80',
    title: 'Cute Cat Astronaut Mug',
    productType: 'Mug',
    status: 'Published',
    price: '15.99',
  },
  {
    id: 4,
    imageUrl: 'https://picsum.photos/seed/product4/80',
    title: 'Spooky Season Ghost Shirt',
    productType: 'T-Shirt',
    status: 'Ready to Publish',
    price: '22.50',
  },
  {
    id: 5,
    imageUrl: 'https://picsum.photos/seed/product5/80',
    title: 'Book Lover\'s Aesthetic Tee',
    productType: 'T-Shirt',
    status: 'Error',
    price: '21.99',
  },
];

const StatusTag = ({ status }: { status: string }) => {
  const statusClasses: { [key: string]: string } = {
    'Ready to Publish': 'tag-untapped', // using primary color
    'Draft': 'tag-low', // using blue
    'Published': 'tag-high', // using success color
    'Error': 'tag-danger', // using danger/warning color
  };
  return <span className={`tag ${statusClasses[status] || 'tag-low'}`}>{status}</span>;
};

export const PublishCenterPanel: React.FC = () => {
  return (
    <div className="dashboard-panel">
      <header className="welcome-header">
        <h1>Publish Center</h1>
        <p>Manage your product listings and publish them to your connected stores.</p>
      </header>

      <section className="panel-section">
        <div className="artwork-prompt-bar" style={{ justifyContent: 'space-between', flexWrap: 'nowrap', gap: '1rem' }}>
          <div className="prompt-input-wrapper" style={{ maxWidth: '400px', flexGrow: 1 }}>
            <MagnifyingGlassIcon style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', width: '1rem', height: '1rem', color: 'var(--text-secondary)' }} />
            <input 
              type="text" 
              className="prompt-input" 
              placeholder="Search products..." 
              style={{ paddingLeft: '2.5rem', paddingRight: '1rem' }}
            />
          </div>
          <button className="generate-button" style={{ position: 'relative', transform: 'none', right: 0, top: 0, whiteSpace: 'nowrap' }}>
            <RocketIcon />
            <span>Sync with Stores</span>
          </button>
        </div>
      </section>

      <section className="panel-section">
        <div className="table-container">
          <table className="keywords-table">
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sampleProducts.map(product => (
                <tr key={product.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <img src={product.imageUrl} alt={product.title} style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', backgroundColor: 'var(--background-color)' }} />
                      <span style={{ fontWeight: '600' }}>{product.title}</span>
                    </div>
                  </td>
                  <td>{product.productType}</td>
                  <td>${product.price}</td>
                  <td><StatusTag status={product.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                      <button className="tool-button" title="Edit Listing"><TagIcon /></button>
                      <button className="tool-button" title="Publish"><ArrowUpOnSquareIcon /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};