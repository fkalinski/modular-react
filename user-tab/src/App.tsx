import React, { Suspense, lazy, useState } from 'react';

const Button = lazy(() => import('shared_components/Button').then(m => ({ default: m.Button })));
const Input = lazy(() => import('shared_components/Input').then(m => ({ default: m.Input })));
const Breadcrumbs = lazy(() => import('shared_components/Breadcrumbs').then(m => ({ default: m.Breadcrumbs })));

const UserApp: React.FC = () => {
  const [name, setName] = useState('John Doe');
  const [email, setEmail] = useState('john@example.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [company, setCompany] = useState('Acme Corporation');

  // Box design system styles
  const containerStyles: React.CSSProperties = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f7f7f8',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  };

  const toolbarStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e2e2e2',
  };

  const contentAreaStyles: React.CSSProperties = {
    flex: 1,
    overflow: 'auto',
    padding: '20px',
  };

  const sectionStyles: React.CSSProperties = {
    backgroundColor: '#ffffff',
    padding: '20px',
    borderRadius: '4px',
    border: '1px solid #e2e2e2',
    marginBottom: '20px',
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: '#222222',
    marginBottom: '12px',
  };

  const sectionDescriptionStyles: React.CSSProperties = {
    fontSize: '13px',
    color: '#767676',
    lineHeight: '18px',
    marginBottom: '16px',
  };

  const formGroupStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    marginBottom: '20px',
  };

  const infoGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '140px 1fr',
    gap: '12px',
    fontSize: '13px',
  };

  const labelStyles: React.CSSProperties = {
    fontWeight: 600,
    color: '#222222',
  };

  const valueStyles: React.CSSProperties = {
    color: '#767676',
  };

  const avatarSectionStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  };

  const avatarStyles: React.CSSProperties = {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: '#0061d5',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    fontWeight: 600,
  };

  return (
    <Suspense fallback={<div style={{ padding: '20px' }}>Loading User Settings...</div>}>
      {/* Breadcrumbs */}
      <Suspense fallback={null}>
        <Breadcrumbs
          items={[
            { id: 'user', label: 'User', icon: '👤' },
            { id: 'settings', label: 'Settings' },
            { id: 'profile', label: 'Profile' },
          ]}
        />
      </Suspense>

      <div style={containerStyles}>
        {/* Toolbar */}
        <div style={toolbarStyles}>
          <div>
            <span style={{ fontSize: '13px', color: '#222222', fontWeight: 500 }}>
              User Settings
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Suspense fallback={null}>
              <Button
                size="small"
                variant="secondary"
                onClick={() => {
                  setName('John Doe');
                  setEmail('john@example.com');
                  setPhone('+1 (555) 123-4567');
                  setCompany('Acme Corporation');
                }}
              >
                Reset
              </Button>
              <Button
                size="small"
                variant="primary"
                onClick={() => alert('Profile saved!')}
              >
                Save Changes
              </Button>
            </Suspense>
          </div>
        </div>

        {/* Content Area */}
        <div style={contentAreaStyles}>
          {/* Profile Section */}
          <div style={sectionStyles}>
            <div style={sectionTitleStyles}>Profile</div>
            <div style={sectionDescriptionStyles}>
              Manage your personal information and preferences. This tab is independently
              deployed as a federated module while sharing UI components with the platform.
            </div>

            <div style={avatarSectionStyles}>
              <div style={avatarStyles}>JD</div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600, color: '#222222', marginBottom: '4px' }}>
                  {name}
                </div>
                <div style={{ fontSize: '13px', color: '#767676' }}>
                  {email}
                </div>
                <button
                  style={{
                    marginTop: '8px',
                    padding: '4px 12px',
                    fontSize: '12px',
                    border: '1px solid #d3d3d3',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff',
                    cursor: 'pointer',
                    color: '#222222',
                  }}
                  onClick={() => alert('Upload new avatar')}
                >
                  Change Photo
                </button>
              </div>
            </div>

            <Suspense fallback={null}>
              <div style={formGroupStyles}>
                <Input
                  label="Full Name"
                  value={name}
                  onChange={setName}
                  placeholder="Enter your name"
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={setEmail}
                  placeholder="Enter your email"
                />
                <Input
                  label="Phone Number"
                  type="tel"
                  value={phone}
                  onChange={setPhone}
                  placeholder="Enter your phone"
                />
                <Input
                  label="Company"
                  value={company}
                  onChange={setCompany}
                  placeholder="Enter your company"
                />
              </div>
            </Suspense>
          </div>

          {/* Account Information */}
          <div style={sectionStyles}>
            <div style={sectionTitleStyles}>Account Information</div>
            <div style={infoGridStyles}>
              <div style={labelStyles}>Account ID:</div>
              <div style={valueStyles}>USR-12345</div>

              <div style={labelStyles}>Member Since:</div>
              <div style={valueStyles}>January 2024</div>

              <div style={labelStyles}>Account Type:</div>
              <div style={valueStyles}>
                <span style={{
                  display: 'inline-block',
                  padding: '2px 8px',
                  fontSize: '11px',
                  fontWeight: 500,
                  borderRadius: '2px',
                  backgroundColor: '#e7f5ec',
                  color: '#1e7e34',
                }}>
                  Premium
                </span>
              </div>

              <div style={labelStyles}>Last Login:</div>
              <div style={valueStyles}>Today, 10:30 AM</div>

              <div style={labelStyles}>Storage Used:</div>
              <div style={valueStyles}>24.5 GB of 100 GB</div>

              <div style={labelStyles}>Active Sessions:</div>
              <div style={valueStyles}>3 devices</div>
            </div>
          </div>

          {/* Preferences */}
          <div style={sectionStyles}>
            <div style={sectionTitleStyles}>Preferences</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ color: '#222222' }}>Email notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ color: '#222222' }}>Desktop notifications</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" />
                <span style={{ color: '#222222' }}>Marketing emails</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', cursor: 'pointer' }}>
                <input type="checkbox" defaultChecked />
                <span style={{ color: '#222222' }}>Product updates</span>
              </label>
            </div>
          </div>

          {/* Danger Zone */}
          <div style={{
            ...sectionStyles,
            borderColor: '#dc3545',
            borderWidth: '1px',
          }}>
            <div style={{ ...sectionTitleStyles, color: '#dc3545' }}>Danger Zone</div>
            <div style={sectionDescriptionStyles}>
              These actions are irreversible. Please proceed with caution.
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#dc3545',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                onClick={() => alert('Deactivate account')}
              >
                Deactivate Account
              </button>
              <button
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  border: '1px solid #dc3545',
                  borderRadius: '4px',
                  backgroundColor: '#dc3545',
                  color: '#ffffff',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
                onClick={() => alert('Delete account')}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
    </Suspense>
  );
};

export default UserApp;
