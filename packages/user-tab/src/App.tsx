import React, { Suspense, lazy, useState } from 'react';

const Card = lazy(() => import('shared_components/Layout').then(m => ({ default: m.Card })));
const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Input = lazy(() => import('shared_components/Input').then(m => ({ default: m.Input })));

const UserApp: React.FC = () => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');

  return (
    <Suspense fallback={<div>Loading User Settings...</div>}>
      <div>
        <Card title="User Settings">
          <p style={{ marginBottom: '20px', color: '#666' }}>
            Manage your user profile and preferences. This tab demonstrates
            independent deployment while sharing UI components.
          </p>

          <div style={{ maxWidth: '400px' }}>
            <Input
              label="Name"
              value={name}
              onChange={setName}
              placeholder="Enter your name"
            />

            <Input
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="Enter your email"
            />

            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <Button variant="primary" onClick={() => alert('Profile saved!')}>
                Save Changes
              </Button>
              <Button variant="secondary" onClick={() => {
                setName('John Doe');
                setEmail('john@example.com');
              }}>
                Reset
              </Button>
            </div>
          </div>
        </Card>

        <Card title="Account Information" style={{ marginTop: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '150px 1fr', gap: '12px', fontSize: '14px' }}>
            <strong>Account ID:</strong>
            <span>USR-12345</span>

            <strong>Member Since:</strong>
            <span>January 2024</span>

            <strong>Account Type:</strong>
            <span>Premium</span>

            <strong>Last Login:</strong>
            <span>Today, 10:30 AM</span>
          </div>
        </Card>
      </div>
    </Suspense>
  );
};

export default UserApp;
