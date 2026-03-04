import React, { useState } from 'react';
import axios from 'axios';

const PlacementExecutiveCreateForm = () => {
  const [formData, setFormData] = useState({
    full_name: '',
    mobile_number: '',
    email: '',
    joining_date: '',
    employment_type: [],
    facility_types_handled: [],
    photograph: null,
    login: {
      userID: '',
      password: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested login object
    if (name.startsWith('login_')) {
      const loginField = name.replace('login_', '');
      setFormData(prev => ({
        ...prev,
        login: {
          ...prev.login,
          [loginField]: value
        }
      }));
      return;
    }

    // Handle array fields
    if (['employment_type', 'facility_types_handled'].includes(name)) {
      setFormData(prev => ({
        ...prev,
        [name]: value.split(',').map(item => item.trim())
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      photograph: e.target.files[0]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const token = localStorage.getItem('authToken');
      
      // Create FormData for multipart/form-data
      const submitData = new FormData();
      
      // Flatten login object for FormData
      submitData.append('login', JSON.stringify(formData.login));
      
      // Append all other fields
      Object.keys(formData).forEach(key => {
        if (key !== 'login' && key !== 'photograph' && Array.isArray(formData[key])) {
          formData[key].forEach(item => {
            submitData.append(`${key}[]`, item);
          });
        } else if (key !== 'login' && key !== 'photograph') {
          submitData.append(key, formData[key]);
        }
      });

      if (formData.photograph) {
        submitData.append('photograph', formData.photograph);
      }

      const response = await axios.post('/api/placement-executives', submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setMessage({ type: 'success', text: 'Placement Executive created successfully!' });
      console.log('Response:', response.data);
      
      // Reset form
      setFormData({
        full_name: '',
        mobile_number: '',
        email: '',
        joining_date: '',
        employment_type: [],
        facility_types_handled: [],
        photograph: null,
        login: {
          userID: '',
          password: ''
        }
      });
      
    } catch (error) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error?.message || 'Failed to create placement executive' 
      });
      console.error('Error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="placement-executive-form-container">
      <h2>Create New Placement Executive</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <h3>Personal Information</h3>
        
        <div className="form-group">
          <label>Full Name *</label>
          <input
            type="text"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mobile Number *</label>
          <input
            type="text"
            name="mobile_number"
            value={formData.mobile_number}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email *</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Joining Date *</label>
          <input
            type="date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleChange}
            required
          />
        </div>

        <h3>Employment Details</h3>

        <div className="form-group">
          <label>Employment Type (comma-separated)</label>
          <input
            type="text"
            name="employment_type"
            value={formData.employment_type.join(', ')}
            onChange={handleChange}
            placeholder="full-time, part-time, contract"
          />
        </div>

        <div className="form-group">
          <label>Facility Types Handled (comma-separated)</label>
          <input
            type="text"
            name="facility_types_handled"
            value={formData.facility_types_handled.join(', ')}
            onChange={handleChange}
            placeholder="Aged Care, Disability, Home Care"
          />
        </div>

        <h3>Photograph</h3>

        <div className="form-group">
          <label>Photograph</label>
          <input
            type="file"
            name="photograph"
            onChange={handleFileChange}
            accept="image/jpeg,image/png,image/gif,image/webp"
          />
        </div>

        <h3>Login Credentials</h3>

        <div className="form-group">
          <label>Login UserID *</label>
          <input
            type="text"
            name="login_userID"
            value={formData.login.userID}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Login Password *</label>
          <input
            type="password"
            name="login_password"
            value={formData.login.password}
            onChange={handleChange}
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Placement Executive'}
        </button>
      </form>

      <style jsx>{`
        .placement-executive-form-container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .placement-executive-form-container h2 {
          margin-bottom: 20px;
        }
        
        .placement-executive-form-container h3 {
          margin-top: 30px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #ddd;
        }
        
        .form-group {
          margin-bottom: 15px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
        }
        
        .form-group input {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        
        .message {
          padding: 10px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }
        
        button {
          padding: 12px 24px;
          background-color: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 16px;
          margin-top: 20px;
        }
        
        button:hover {
          background-color: #218838;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PlacementExecutiveCreateForm;
