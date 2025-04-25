import React from "react";

const OfficeDay: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <img src="/office-day.png" alt="Office Day" style={{ maxWidth: '100%', maxHeight: '80vh', borderRadius: '16px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)' }} />
    </div>
  );
};

export default OfficeDay; 